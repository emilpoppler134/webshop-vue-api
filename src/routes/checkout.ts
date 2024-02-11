import express from 'express';
import checkoutController from '../controllers/checkoutController.js';

const router = express.Router();

router.post("/charge", checkoutController.charge);

export default router;