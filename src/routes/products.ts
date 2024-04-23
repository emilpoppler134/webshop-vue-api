import express from "express";
import productController from "../controllers/productController.js";
import { asyncHandler } from "../handlers/asyncHandler.js";

const router = express.Router();

router.post("/", asyncHandler(productController.list));
router.post("/:id", asyncHandler(productController.find));

export default router;
