import { Section } from '../models/Section.js';

import type { Request, Response } from 'express';

async function list(req: Request, res: Response) {
  try {
    const sections = await Section.find()
      .populate({path: 'categories', populate: { path: 'collections' }}); 

    res.json(sections);
  } catch { res.status(500).end(); }
}

export default { list }