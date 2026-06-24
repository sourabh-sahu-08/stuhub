import type { ErrorRequestHandler } from "express";

export const notFound: ErrorRequestHandler = (req, res) => {
  res.status(404).json({ message: `Route not found: ${req.originalUrl}` });
};

export const errorHandler: ErrorRequestHandler = (error, _req, res, _next) => {
  console.error(error);
  const status = typeof error.status === "number" ? error.status : 500;
  res.status(status).json({
    message: status === 500 ? "Something went wrong" : error.message,
    detail: process.env.NODE_ENV === "production" ? undefined : error.message
  });
};
