import express from 'express';
import productController from '../controllers/productController.js';

const router = express.Router();

router.get("/", productController.list);

export default router;