import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import { connect } from 'mongoose';

import { PORT, DATABASE_USERNAME, DATABASE_PASSWORD, DATABASE_HOST, DATABASE_NAME } from './config.js';

import './models/Category.js';
import './models/Collection.js';
import './models/Customer.js';
import './models/Order.js';
import './models/Product.js';
import './models/Section.js';
import './models/Stock.js';

import checkoutRoutes from './routes/checkout.js';
import imageRoutes from './routes/images.js';
import productRoutes from './routes/products.js';
import sectionRoutes from './routes/sections.js';
import stockRoutes from './routes/stock.js';

const server = express();
server.use(bodyParser.json())
server.use(cors());

server.use("/checkout", checkoutRoutes);
server.use("/images", imageRoutes);
server.use("/products", productRoutes);
server.use("/sections", sectionRoutes);
server.use("/stock", stockRoutes);

server.listen(PORT, async () => {
  console.log(`Listening on http://localhost:${PORT}/`);
  await connect(`mongodb+srv://${DATABASE_USERNAME}:${DATABASE_PASSWORD}@${DATABASE_HOST}/${DATABASE_NAME}`);
});