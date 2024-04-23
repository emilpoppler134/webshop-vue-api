import express from "express";
import stockController from "../controllers/stockController.js";
import { asyncHandler } from "../handlers/asyncHandler.js";

const router = express.Router();

router.get("/:id", asyncHandler(stockController.find));

export default router;
