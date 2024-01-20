import express from "express";
import isValidId from "../../middlewares/isValidId.js";
import validateBody from "../../decorators/validateBody.js";
import contactSchemas from "../../schemas/contact-schemas.js";
import isEmptyBody from "../../middlewares/isEmptyBody.js";
import {
  updateSubscription,
  updateUserAvatar,
  userEmailSchema,
  userSinginSchema,
  userSingupSchema,
} from "../../models/User.js";
import authController from "../../controllers/auth-controller.js";
import { authenticate } from "../../middlewares/authenticate.js";
import upload from "../../middlewares/upload.js";

const authRouter = express.Router();

authRouter.get("/current", authenticate, authController.getCurrent);

authRouter.post(
  "/signup",
  isEmptyBody,
  validateBody(userSingupSchema),
  authController.signup
);

authRouter.post(
  "/signin",
  isEmptyBody,
  validateBody(userSinginSchema),
  authController.signin
);

authRouter.patch(
  "/users",
  authenticate,
  isEmptyBody,
  validateBody(updateSubscription),
  authController.updateUserSubscription
);

authRouter.patch(
  "/users/avatars",
  upload.single("avatar"),
  authenticate,
  authController.updateUserAvatar
);

authRouter.get("/verify/:verificationCode", authController.verify);

authRouter.post(
  "/verify",
  isEmptyBody,
  validateBody(userEmailSchema),
  authController.resendVerifyEmail
);

authRouter.post("/signout", authenticate, authController.signout);

export default authRouter;
