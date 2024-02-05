import type { Request, Response } from 'express';
import { Product } from '../models/Product.js';

async function list(req: Request, res: Response) {
  const products = await Product.find()
    .populate({path: 'stock', model: 'Stock'})
    .populate({path: 'collections', model: 'Collection'});

  res.json(products);
}

export default { list }