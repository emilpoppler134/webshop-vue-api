import { Section } from '../models/Section.js';

import type { Request, Response } from 'express';

async function list(req: Request, res: Response) {
  const sections = await Section.find()
    .populate({path: 'categories', populate: { path: 'collections' }}); 

  res.json(sections);
}

export default { list }