import contactsController from "../../controllers/contacts-controller.js";
import express from "express";
import isEmptyBody from "../../middlewares/isEmptyBody.js";

const router = express.Router();

router.get("/", contactsController.getAllContacts);

router.get("/:contactId", contactsController.getOneContact);

router.post("/", contactsController.createContact);

router.delete("/:contactId", contactsController.deleteContact);

router.put("/:contactId", isEmptyBody, contactsController.updateContact);

export default router;
