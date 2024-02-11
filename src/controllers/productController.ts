import { Types } from 'mongoose';
import type { Request, Response } from 'express';
import { Product } from '../models/Product.js';

async function list(req: Request, res: Response) {
  const products = await Product.find()
    .populate({path: 'stock', model: 'Stock'})
    .populate({path: 'collections', model: 'Collection'});

  res.json(products);
}

async function find(req: Request, res: Response) {
  const id = req.params.id;

  if (id === undefined || !Types.ObjectId.isValid(id)) {
    res.json({status: "ERROR", data: "Not a valid ID"});
    return;
  }

  const products = await Product.findById(id)
    .populate({path: 'stock', model: 'Stock'})
    .populate({path: 'collections', model: 'Collection'});

  res.json(products);
}

export default { list, find }