import express from 'express';
import cors from 'cors';
import { connect } from 'mongoose';
import { PORT, DATABASE_USERNAME, DATABASE_PASSWORD, DATABASE_HOST, DATABASE_NAME } from './config.js';

import './models/Section.js'
import './models/Category.js'
import './models/Collection.js'

import sectionRoutes from './routes/sections.js';

const server = express();
server.use(cors());
server.use("/sections", sectionRoutes);

server.listen(PORT, async () => {
  console.log(`Listening on http://localhost:${PORT}/`);
  await connect(`mongodb+srv://${DATABASE_USERNAME}:${DATABASE_PASSWORD}@${DATABASE_HOST}/${DATABASE_NAME}`);
});