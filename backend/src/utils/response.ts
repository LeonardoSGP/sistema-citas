import { Response } from 'express';

export const sendSuccess = (
  res: Response,
  data: unknown,
  message = 'OK',
  status = 200
) => {
  return res.status(status).json({ success: true, message, data });
};

export const sendError = (
  res: Response,
  message: string,
  status = 500,
  errors?: unknown
) => {
  return res.status(status).json({ success: false, message, errors });
};
