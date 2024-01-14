import { Schema, model } from "mongoose";
import { handleSaveError, setUpdateSettings } from "./hooks.js";
import Joi from "joi";
const userSchema = new Schema(
  {
    password: {
      type: String,
      required: [true, "Set password for user"],
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
    },
    subscription: {
      type: String,
      enum: ["starter", "pro", "business"],
      default: "starter",
    },
    avatarURL: String,
    token: String,
  },
  { versionKey: false, timestamps: true }
);

userSchema.post("save", handleSaveError);

userSchema.pre("findOneAndUpdate", setUpdateSettings);

userSchema.post("findOneAndUpdate", handleSaveError);

export const userSingupSchema = Joi.object({
  email: Joi.string().required(),
  password: Joi.string().required(),
});

export const updateSubscription = Joi.object({
  subscription: Joi.string().valid("starter", "pro", "business").required(),
});

export const updateUserAvatar = Joi.object({
  avatar: Joi.required(),
});

export const userSinginSchema = Joi.object({
  email: Joi.string().required(),
  password: Joi.string().required(),
});

const User = model("user", userSchema);

export default User;
