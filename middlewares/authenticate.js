import jwt from "jsonwebtoken";
import HttpError from "../helpers/httpError.js";
import User from "../models/User.js";
import "dotenv/config";
const { SECRET_KEY } = process.env;

export const authenticate = async (req, res, next) => {
  const { authorization } = req.headers;
  if (!authorization) {
    return next(HttpError(401, "Authorization not define"));
  }

  const [bearer, token] = authorization.split(" ");

  if (bearer !== "Bearer") {
    return next(HttpError(401));
  }

  try {
    const { id } = jwt.verify(token, SECRET_KEY);

    const user = await User.findById(id);

    if (!user || !user.token || token !== user.token) {
      return next(HttpError(401));
    }

    req.user = user;

    next();
  } catch (error) {
    next(HttpError(401, error.message));
  }
};
