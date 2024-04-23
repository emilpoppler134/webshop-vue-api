import { Types } from "mongoose";

import { Product } from "../models/Product.js";

import type { Request, Response } from "express";
import { ErrorCode } from "../types/StatusCode.js";
import { ErrorResponse } from "../utils/sendResponse.js";

async function list(req: Request, res: Response) {
  try {
    const products = await Product.find()
      .populate({ path: "stock", model: "Stock" })
      .populate({ path: "collections", model: "Collection" });

    res.json(products);
  } catch {
    throw new ErrorResponse(ErrorCode.SERVER_ERROR, "Something went wrong.");
  }
}

async function find(req: Request, res: Response) {
  try {
    const id = req.params.id;

    if (id === undefined || !Types.ObjectId.isValid(id)) {
      res.json({ status: "ERROR", data: "Not a valid ID" });
      return;
    }

    const products = await Product.findById(id)
      .populate({ path: "stock", model: "Stock" })
      .populate({ path: "collections", model: "Collection" });

    res.json(products);
  } catch {
    throw new ErrorResponse(ErrorCode.SERVER_ERROR, "Something went wrong.");
  }
}

export default { list, find };
