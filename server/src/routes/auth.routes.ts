import { Router } from "express";
import { z } from "zod";
import { User } from "../models/User.js";
import { Student, Teacher } from "../models/Academic.js";
import { requireAuth, signToken } from "../middleware/auth.js";
import type { AuthRequest } from "../types.js";

export const authRouter = Router();

const registerSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(8),
  role: z.enum(["student", "teacher"]).default("student")
});

authRouter.post("/register", async (req, res, next) => {
  try {
    const data = registerSchema.parse(req.body);
    const exists = await User.exists({ email: data.email });
    if (exists) return res.status(409).json({ message: "Email already exists" });

    const user = await User.create(data);
    if (data.role === "student") {
      await Student.create({ user: user._id, rollNumber: `STU-${Date.now()}`, semester: 1, section: "A" });
    } else {
      await Teacher.create({ user: user._id, employeeId: `TCH-${Date.now()}`, designation: "Faculty" });
    }
    const token = signToken({ id: user.id, role: user.role });
    res.status(201).json({ token, user: sanitizeUser(user) });
  } catch (error) {
    next(error);
  }
});

authRouter.post("/login", async (req, res, next) => {
  try {
    const { email, password } = z.object({ email: z.string().email(), password: z.string() }).parse(req.body);
    const user = await User.findOne({ email }).select("+password");
    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({ message: "Invalid email or password" });
    }
    if (!user.isActive) return res.status(403).json({ message: "Account disabled" });
    user.lastLoginAt = new Date();
    await user.save();
    const token = signToken({ id: user.id, role: user.role });
    res.json({ token, user: sanitizeUser(user) });
  } catch (error) {
    next(error);
  }
});

authRouter.get("/me", requireAuth, async (req: AuthRequest, res, next) => {
  try {
    const user = await User.findById(req.user?.id).populate("department", "name code");
    res.json({ user: sanitizeUser(user) });
  } catch (error) {
    next(error);
  }
});

function sanitizeUser(user: any) {
  if (!user) return null;
  return {
    id: user._id?.toString() ?? user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    avatar: user.avatar,
    department: user.department
  };
}
