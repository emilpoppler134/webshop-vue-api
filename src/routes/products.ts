import express from 'express';
import productController from '../controllers/productController.js';

const router = express.Router();

router.get("/", productController.list);
router.get("/:id", productController.find);

export default router;