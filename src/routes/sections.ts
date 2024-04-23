import express from "express";
import sectionController from "../controllers/sectionController.js";
import { asyncHandler } from "../handlers/asyncHandler.js";

const router = express.Router();

router.get("/", asyncHandler(sectionController.list));

export default router;
