import express from 'express';
import stockController from '../controllers/stockController.js';

const router = express.Router();

router.get("/:id", stockController.find);

export default router;