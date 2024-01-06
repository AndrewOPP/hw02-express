import contactsController from "../../controllers/contacts-controller.js";
import express from "express";
import isEmptyBody from "../../middlewares/isEmptyBody.js";
import isValidId from "../../middlewares/isValidId.js";
import validateBody from "../../decorators/validateBody.js";
import contactSchemas from "../../schemas/contact-schemas.js";
import { authenticate } from "../../middlewares/authenticate.js";

const router = express.Router();

router.use(authenticate);

router.get("/", contactsController.getAllContacts);

router.get("/:id", isValidId, contactsController.getOneContact);

router.post(
  "/",
  validateBody(contactSchemas.contactPostSchema),
  contactsController.createContact
);

router.delete("/:id", isValidId, contactsController.deleteContact);

router.patch(
  "/:id/favorite",
  isValidId,
  isEmptyBody,
  validateBody(contactSchemas.contactFavoriteSchema),
  contactsController.updateContact
);

router.put(
  "/:id",
  isValidId,
  isEmptyBody,
  validateBody(contactSchemas.contactUpdateSchema),
  contactsController.updateContact
);

export default router;
