import { Types } from 'mongoose';

import { Stock } from '../models/Stock.js';

import type { Request, Response } from 'express';

async function find(req: Request, res: Response) {
  try {
    const cart = req.params.id.split(",");

    cart.forEach(item => {
      if (!Types.ObjectId.isValid(item)) {
        res.json({status: "ERROR", data: "Not a valid id"});
        return;
      }
    });

    const stock = await Stock.find({'_id': {$in: cart.map(item => new Types.ObjectId(item))}})
      .populate({path: 'product', model: 'Product'});
    
    res.json(stock);
  } catch { res.status(500).end(); }
}

export default { find }