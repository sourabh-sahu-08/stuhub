import type { Request } from "express";
import type { JwtPayload } from "jsonwebtoken";

export type Role = "student" | "admin";

export interface AuthTokenPayload extends JwtPayload {
  id: string;
  role: Role;
  isProfileComplete: boolean;
}

export interface AuthRequest extends Request {
  user?: AuthTokenPayload;
}
