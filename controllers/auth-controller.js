import HttpError from "../helpers/httpError.js";
import User from "../models/User.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import fs from "fs/promises";
import path from "path";
import gravatar from "gravatar";
import Jimp from "jimp";
const { SECRET_KEY } = process.env;

const signup = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });

    if (user) {
      throw HttpError(409, "User with such email is already registered");
    }
    const hashPass = await bcrypt.hash(password, 10);
    const avatar = gravatar.url(email);
    const newUser = await User.create({
      ...req.body,
      password: hashPass,
      avatarURL: avatar,
    });

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

export default {
  signup,
  signin,
  getCurrent,
  signout,
  updateUserSubscription,
  updateUserAvatar,
};
