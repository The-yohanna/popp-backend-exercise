import { Request, Response } from "express";

export const statusController = async (req: Request, res: Response) => {
  res.send("Ok!");
};
