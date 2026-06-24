import { Router } from "express";
import { allowRoles, requireAuth } from "../middleware/auth.js";
import { Course, Department, Student, Subject, Teacher } from "../models/Academic.js";
import { User } from "../models/User.js";
import { Event, Notice, Placement } from "../models/Campus.js";

export const adminRouter = Router();

adminRouter.use(requireAuth, allowRoles("admin"));

adminRouter.get("/users", async (_req, res, next) => {
  try {
    res.json(await User.find().select("-password").sort({ createdAt: -1 }).limit(100));
  } catch (error) {
    next(error);
  }
});

adminRouter.post("/departments", async (req, res, next) => {
  try {
    res.status(201).json(await Department.create(req.body));
  } catch (error) {
    next(error);
  }
});

adminRouter.post("/courses", async (req, res, next) => {
  try {
    res.status(201).json(await Course.create(req.body));
  } catch (error) {
    next(error);
  }
});

adminRouter.post("/subjects", async (req, res, next) => {
  try {
    res.status(201).json(await Subject.create(req.body));
  } catch (error) {
    next(error);
  }
});

adminRouter.get("/reports", async (_req, res, next) => {
  try {
    const [students, teachers, events, placements, notices] = await Promise.all([
      Student.countDocuments(),
      Teacher.countDocuments(),
      Event.countDocuments(),
      Placement.countDocuments(),
      Notice.countDocuments()
    ]);
    res.json({
      generatedAt: new Date(),
      enrollment: { students, teachers },
      engagement: { events, placements, notices },
      riskSignals: [
        { label: "Attendance below 75%", count: 18 },
        { label: "Fees due", count: 42 },
        { label: "Pending leave approvals", count: 7 }
      ]
    });
  } catch (error) {
    next(error);
  }
});
