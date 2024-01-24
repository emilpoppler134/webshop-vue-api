import express from 'express';
import sectionController from '../controllers/sectionController.js';

const router = express.Router();

router.get("/", sectionController.list);

export default router;