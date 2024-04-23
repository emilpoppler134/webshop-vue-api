import express from "express";
import checkoutController from "../controllers/checkoutController.js";
import { asyncHandler } from "../handlers/asyncHandler.js";

const router = express.Router();

router.post("/charge", asyncHandler(checkoutController.charge));

export default router;
