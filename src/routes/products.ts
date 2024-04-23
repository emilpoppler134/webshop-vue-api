import express from "express";
import productController from "../controllers/productController.js";
import { asyncHandler } from "../handlers/asyncHandler.js";

const router = express.Router();

router.get("/", asyncHandler(productController.list));
router.get("/:id", asyncHandler(productController.find));

export default router;
