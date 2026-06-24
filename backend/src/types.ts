import type { Request } from "express";
import type { JwtPayload } from "jsonwebtoken";

export type Role = "student";

export interface AuthTokenPayload extends JwtPayload {
  id: string;
  role: Role;
}

export interface AuthRequest extends Request {
  user?: AuthTokenPayload;
}
