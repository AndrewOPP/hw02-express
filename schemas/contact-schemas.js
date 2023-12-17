import Joi from "joi";

const contactPostSchema = Joi.object({
  name: Joi.string().min(3).max(30).required(),
  phone: Joi.string().required(),
  email: Joi.string()
    .email({
      minDomainSegments: 2,
      tlds: { allow: ["com", "net"] },
    })
    .required(),
});

const contactUpdateSchema = Joi.object({
  name: Joi.string().min(3).max(30),
  phone: Joi.string(),
  email: Joi.string().email({
    minDomainSegments: 2,
    tlds: { allow: ["com", "net"] },
  }),
});

export default {
  contactPostSchema,
  contactUpdateSchema,
};
