import HttpError from "../helpers/httpError.js";
import User from "../models/User.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import fs from "fs/promises";
import path from "path";
import gravatar from "gravatar";
import Jimp from "jimp";
import sendEmail from "../helpers/sendEmail.js";
import { nanoid } from "nanoid";

const { SECRET_KEY, BASE_URL } = process.env;

const signup = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });

    if (user) {
      throw HttpError(409, "User with such email is already registered");
    }
    const hashPass = await bcrypt.hash(password, 10);
    const verificationCode = nanoid();

    const avatar = gravatar.url(email);
    const newUser = await User.create({
      ...req.body,
      password: hashPass,
      avatarURL: avatar,
      verificationCode,
    });

    const verifyEmail = {
      to: email,
      subject: "Verify email",
      html: `<a target="_blank" href="${BASE_URL}/api/auth/verify/${verificationCode}">Click to verify email</a>`,
    };

    await sendEmail(verifyEmail);

    res.status(201).json({
      user: {
        email: newUser.email,
        subscription: newUser.subscription ?? "starter",
      },
    });
  } catch (error) {
    next(error);
  }
};

const signin = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });

    if (!user) {
      throw HttpError(401, "Email or password invalid");
    }

    if (!user.verify) {
      throw HttpError(401, "Email not verify");
    }

    const passwordCompare = await bcrypt.compare(password, user.password);

    if (!passwordCompare) {
      throw HttpError(401, "Email or password invalid");
    }

    const { _id: id, subscription } = user;

    const payload = {
      id,
    };

    const token = jwt.sign(payload, SECRET_KEY, { expiresIn: "23h" });
    await User.findByIdAndUpdate(id, { token });

    res.json({
      token,
      user: {
        email: email,
        subscription: subscription ?? "starter",
      },
    });
  } catch (error) {
    next(error);
  }
};

const getCurrent = async (req, res, next) => {
  try {
    const { subscription, email } = req.user;

    res.json({
      subscription,
      email,
    });
  } catch (error) {
    next(error);
  }
};

const signout = async (req, res, next) => {
  try {
    const { _id: id } = req.user;
    await User.findByIdAndUpdate(id, { token: "" });

    res.json({
      message: "Signout success",
    });
  } catch (error) {
    next(error);
  }
};

const updateUserSubscription = async (req, res, next) => {
  try {
    const { _id: id } = req.user;
    await User.findByIdAndUpdate(id, req.body);

    res.json({
      message: "Subscription updated",
    });
  } catch (error) {
    next(error);
  }
};

const avatarsPath = path.resolve("public", "avatars");

const updateUserAvatar = async (req, res, next) => {
  try {
    const { path: oldPath, filename } = req.file;
    const { _id: id } = req.user;
    const newPath = path.join(avatarsPath, filename);

    Jimp.read(oldPath)
      .then((image) => {
        return image.resize(250, 250).write(newPath);
      })
      .catch((err) => {
        throw HttpError(400, "Cant resize that img");
      });

    await fs.rename(oldPath, newPath);

    const avatar = path.join("avatars", filename);
    req.body.avatarURL = avatar;
    await User.findByIdAndUpdate(id, req.body);
    res.json({
      message: "Avatar added",
    });
  } catch (error) {
    next(error);
  }
};

const verify = async (req, res, next) => {
  try {
    const { verificationCode } = req.params;
    const user = await User.findOne({ verificationCode });
    if (!user) {
      throw HttpError(400, "Email not found or it is already verified");
    }

    await User.findByIdAndUpdate(user._id, {
      verify: true,
      verificationCode: "",
    });

    res.json({
      message: "Email verify success",
    });
  } catch (error) {
    next(error);
  }
};

const resendVerifyEmail = async (req, res, next) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });
    if (!user) {
      throw HttpError(404, "Email not found");
    }
    if (user.verify) {
      throw HttpError(400, "Email already verify");
    }

    const verifyEmail = {
      to: email,
      subject: "Verify email",
      html: `<a target="_blank" href="${BASE_URL}/api/auth/verify/${user.verificationCode}">Click to verify email</a>`,
    };

    await sendEmail(verifyEmail);

    res.json({
      message: "Verify email send success",
    });
  } catch (error) {
    next(error);
  }
};

export default {
  signup,
  signin,
  getCurrent,
  signout,
  updateUserSubscription,
  updateUserAvatar,
  verify,
  resendVerifyEmail,
};
