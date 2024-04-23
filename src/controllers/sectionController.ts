import { Section } from "../models/Section.js";

import type { Request, Response } from "express";
import { ErrorCode } from "../types/StatusCode.js";
import { ErrorResponse } from "../utils/sendResponse.js";

async function list(req: Request, res: Response) {
  try {
    const sections = await Section.find().populate({
      path: "categories",
      populate: { path: "collections" },
    });

    res.json(sections);
  } catch {
    throw new ErrorResponse(ErrorCode.SERVER_ERROR, "Something went wrong.");
  }
}

export default { list };
