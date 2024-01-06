import HttpError from "../helpers/httpError.js";
import User from "../models/User.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

const { SECRET_KEY } = process.env;

const signup = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });

    if (user) {
      throw HttpError(409, "User with such email is already registered");
    }

    const hashPass = await bcrypt.hash(password, 10);

    const newUser = await User.create({ ...req.body, password: hashPass });

    res.json({
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

export default {
  signup,
  signin,
  getCurrent,
  signout,
  updateUserSubscription,
};
