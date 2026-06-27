import { Router } from "express";
import { z } from "zod";
import { User } from "../models/User.js";
import { Student, Department } from "../models/Academic.js";
import { requireAuth, signToken } from "../middleware/auth.js";
import type { AuthRequest } from "../types.js";

export const authRouter = Router();

const registerSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(8),
  role: z.enum(["student"]).default("student")
});

authRouter.post("/register", async (req, res, next) => {
  try {
    const data = registerSchema.parse(req.body);
    const exists = await User.exists({ email: data.email });
    if (exists) return res.status(409).json({ message: "Email already exists" });

    const user = await User.create(data);
    await Student.create({ user: user._id, rollNumber: `STU-${Date.now()}`, semester: 1, section: "A" });
    const token = signToken({ id: user.id, role: user.role, isProfileComplete: user.isProfileComplete });
    res.status(201).json({ token, user: sanitizeUser(user) });
  } catch (error) {
    next(error);
  }
});

authRouter.post("/login", async (req, res, next) => {
  try {
    const { email, password } = z.object({ email: z.string().email(), password: z.string() }).parse(req.body);
    const user = await User.findOne({ email }).select("+password") as any;
    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({ message: "Invalid email or password" });
    }
    if (!user.isActive) return res.status(403).json({ message: "Account disabled" });
    user.lastLoginAt = new Date();
    await user.save();
    const token = signToken({ id: user.id, role: user.role, isProfileComplete: user.isProfileComplete });
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

authRouter.post("/social-login", async (req, res, next) => {
  try {
    const { email, name, avatar } = z.object({
      email: z.string().email(),
      name: z.string(),
      avatar: z.string().optional()
    }).parse(req.body);

    let user = await User.findOne({ email });
    if (!user) {
      // Create user with isProfileComplete: false
      user = await User.create({
        name,
        email,
        password: Math.random().toString(36).slice(-10) + "Aa1!",
        role: "student",
        avatar,
        isProfileComplete: false
      });

      // Create temporary student document
      await Student.create({
        user: user._id,
        rollNumber: `TEMP-STU-${Date.now()}`
      });
    }

    const token = signToken({ id: user.id, role: user.role, isProfileComplete: user.isProfileComplete });
    res.json({ token, user: sanitizeUser(user) });
  } catch (error) {
    next(error);
  }
});

authRouter.put("/complete-profile", requireAuth, async (req: AuthRequest, res, next) => {
  try {
    const { name, rollNumber, department, semester, section } = z.object({
      name: z.string().min(2),
      rollNumber: z.string().min(2),
      department: z.string().optional(),
      semester: z.number().optional(),
      section: z.string().optional()
    }).parse(req.body);

    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ message: "Authentication required" });

    // Check rollNumber uniqueness
    const existingStudent = await Student.findOne({ rollNumber, user: { $ne: userId } });
    if (existingStudent) {
      return res.status(409).json({ message: "Roll number is already taken by another student" });
    }

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    user.name = name;
    user.isProfileComplete = true;
    await user.save();

    const student = await Student.findOne({ user: userId });
    if (!student) return res.status(404).json({ message: "Student record not found" });

    student.rollNumber = rollNumber;
    if (department) student.department = department as any;
    if (semester) student.semester = semester;
    if (section) student.section = section;
    await student.save();

    const token = signToken({ id: user.id, role: user.role, isProfileComplete: true });
    res.json({ token, user: sanitizeUser(user) });
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
    isProfileComplete: user.isProfileComplete,
    department: user.department
  };
}

authRouter.get("/departments", async (req, res, next) => {
  try {
    const departments = await Department.find({}, "name code");
    res.json(departments);
  } catch (error) {
    next(error);
  }
});
