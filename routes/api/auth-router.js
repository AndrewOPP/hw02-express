import express from "express";
import isValidId from "../../middlewares/isValidId.js";
import validateBody from "../../decorators/validateBody.js";
import contactSchemas from "../../schemas/contact-schemas.js";
import isEmptyBody from "../../middlewares/isEmptyBody.js";
import {
  updateSubscription,
  userSinginSchema,
  userSingupSchema,
} from "../../models/User.js";
import authController from "../../controllers/auth-controller.js";
import { authenticate } from "../../middlewares/authenticate.js";

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

authRouter.post("/signout", authenticate, authController.signout);

export default authRouter;
