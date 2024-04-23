import bodyParser from "body-parser";
import cors from "cors";
import express from "express";
import mongodb from "mongoose";

import {
  DATABASE_HOST,
  DATABASE_NAME,
  DATABASE_PASSWORD,
  DATABASE_USERNAME,
  PORT,
} from "./config.js";

import "./models/Category.js";
import "./models/Collection.js";
import "./models/Customer.js";
import "./models/Order.js";
import "./models/Product.js";
import "./models/Section.js";
import "./models/Stock.js";
import "./models/User.js";
import "./models/VerificationToken.js";

import checkoutRoutes from "./routes/checkout.js";
import imageRoutes from "./routes/images.js";
import productRoutes from "./routes/products.js";
import sectionRoutes from "./routes/sections.js";
import stockRoutes from "./routes/stock.js";
import userRoutes from "./routes/users.js";

import { errorHandler } from "./handlers/errorHandler.js";

const server = express();
server.use(bodyParser.json());
server.use(cors());

server.use("/checkout", checkoutRoutes);
server.use("/images", imageRoutes);
server.use("/products", productRoutes);
server.use("/sections", sectionRoutes);
server.use("/stock", stockRoutes);
server.use("/users", userRoutes);

server.use(errorHandler);

mongodb
  .connect(
    `mongodb+srv://${DATABASE_USERNAME}:${DATABASE_PASSWORD}@${DATABASE_HOST}/${DATABASE_NAME}`
  )
  .then(() => {
    console.log("Successfully connected to mongodb.");
  })
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });

server.listen(PORT, async () => {
  console.log(`Listening on http://localhost:${PORT}/`);
});
