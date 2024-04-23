import { Request, Response } from "express";
import { Types } from "mongoose";
import { ICollection } from "../models/Collection.js";
import { IProduct, Product } from "../models/Product.js";
import { IStock } from "../models/Stock.js";
import { ErrorCode, SuccessCode } from "../types/StatusCode.js";
import { ErrorResponse, sendValidResponse } from "../utils/sendResponse.js";

type ExtendedProduct = Omit<IProduct, "stock" | "collections"> & {
  stock: Array<IStock>;
  collections: Array<ICollection>;
};

async function list(req: Request, res: Response) {
  const products: Array<ExtendedProduct> = await Product.find()
    .populate({ path: "stock", model: "Stock" })
    .populate({ path: "collections", model: "Collection" });

  return sendValidResponse<Array<ExtendedProduct>>(
    res,
    SuccessCode.OK,
    products,
  );
}

async function find(req: Request, res: Response) {
  const id = req.params.id;

  if (id === undefined || !Types.ObjectId.isValid(id)) {
    throw new ErrorResponse(ErrorCode.BAD_REQUEST, "Not a valid ID.");
  }

  const product: ExtendedProduct | null = await Product.findById(id)
    .populate({ path: "stock", model: "Stock" })
    .populate({ path: "collections", model: "Collection" });

  if (product === null) {
    throw new ErrorResponse(ErrorCode.NO_RESULT, "No product with that id.");
  }

  return sendValidResponse<ExtendedProduct>(res, SuccessCode.OK, product);
}

export default { list, find };
