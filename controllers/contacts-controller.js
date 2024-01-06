import HttpError from "../helpers/httpError.js";

import Contact from "../models/Contact.js"; // eslint-disable-line

const getAllContacts = async (req, res, next) => {
  try {
    const { _id: owner } = req.user;
    const { page = 1, limit = 10, favorite = false } = req.query;
    const skip = (page - 1) * limit;
    let allContacts = [];
    if (favorite) {
      allContacts = await Contact.find({ owner, favorite }, "", {
        skip,
        limit,
      }).populate("owner", ["email", "subscription"]);
    } else {
      allContacts = await Contact.find({ owner }, "", {
        skip,
        limit,
      }).populate("owner", ["email", "subscription"]);
    }

    res.json(allContacts);
  } catch (error) {
    next(error);
  }
};

const getOneContact = async (req, res, next) => {
  try {
    const { id: _id } = req.params;

    const { _id: owner } = req.user;
    console.log(owner);

    const contact = await Contact.findOne({ _id, owner });

    if (!contact) {
      throw HttpError(404, "Contact with that id has not found");
    }
    res.json(contact);
  } catch (error) {
    next(error);
  }
};

const deleteContact = async (req, res, next) => {
  try {
    const { id: _id } = req.params;
    const { _id: owner } = req.user;
    const result = await Contact.findOneAndDelete({ _id, owner });
    if (!result) {
      throw HttpError(404, "Contact with that id has not found");
    }
    res.json({
      message: "Contact has deleted",
    });
  } catch (error) {
    next(error);
  }
};

const createContact = async (req, res, next) => {
  try {
    const { phone } = req.body;
    const { _id: owner } = req.user;
    const contact = await Contact.findOne({ phone });

    if (contact) {
      throw HttpError(409, "User with such phone is already in contacts");
    }

    const result = await Contact.create({ ...req.body, owner });
    res.status(201).json(result);
  } catch (error) {
    next(error);
  }
};

const updateContact = async (req, res, next) => {
  try {
    const { id: _id } = req.params;
    const { _id: owner } = req.user;

    const result = await Contact.findOneAndUpdate({ _id, owner }, req.body);
    res.json(result);
  } catch (error) {
    next(error);
  }
};

export default {
  getAllContacts,
  getOneContact,
  createContact,
  updateContact,
  deleteContact,
};
