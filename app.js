import express from "express";
import logger from "morgan";
import cors from "cors";
import router from "./routes/api/contacts.js";
import "dotenv/config";
import authRouter from "./routes/api/auth-router.js";

// const express = require("express");
// const logger = require("morgan");
// const cors = require("cors");

// const contactsRouter = require("./routes/api/contacts");

const app = express();

const formatsLogger = app.get("env") === "development" ? "dev" : "short";

app.use(logger(formatsLogger));
app.use(cors());
app.use(express.json());
app.use(express.static("public"));

app.use("/api/auth", authRouter);
app.use("/api/contacts", router);

app.use((req, res) => {
  res.status(404).json({ message: "Not found" });
});

app.use((err, req, res, next) => {
  res.status(err.status || 500).json({ message: err.message });
});

export default app;
