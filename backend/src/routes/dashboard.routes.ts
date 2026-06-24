import { Router } from "express";
import { allowRoles, requireAuth } from "../middleware/auth.js";
import { Student, Teacher, Department, Course, Subject } from "../models/Academic.js";
import { Assignment, Attendance, Grade, Leave, Timetable } from "../models/Operations.js";
import { Alumni, Club, Event, Notice, Notification, Placement, Resource } from "../models/Campus.js";
import type { AuthRequest } from "../types.js";

export const dashboardRouter = Router();

dashboardRouter.use(requireAuth);

dashboardRouter.get("/student", allowRoles("student"), async (req: AuthRequest, res, next) => {
  try {
    const student = await Student.findOne({ user: req.user?.id });
    const [attendance, assignments, grades, timetable, notices, placements, events, resources, leaves, notifications] =
      await Promise.all([
        Attendance.find({ student: student?._id }).populate("subject", "name code").limit(60),
        Assignment.find().populate("subject", "name").sort({ dueAt: 1 }).limit(6),
        Grade.find({ student: student?._id }).populate("subject", "name").limit(12),
        Timetable.findOne({ semester: student?.semester, section: student?.section }).populate("entries.subject", "name"),
        Notice.find({ audience: { $in: ["student", "all"] } }).sort({ pinned: -1, createdAt: -1 }).limit(5),
        Placement.find().sort({ deadline: 1 }).limit(4),
        Event.find().sort({ startsAt: 1 }).limit(4),
        Resource.find().sort({ createdAt: -1 }).limit(6),
        Leave.find({ student: student?._id }).sort({ createdAt: -1 }).limit(5),
        Notification.find({ user: req.user?.id }).sort({ createdAt: -1 }).limit(8)
      ]);

    const present = attendance.filter((item) => item.status === "present").length;
    const attendanceRate = attendance.length ? Math.round((present / attendance.length) * 100) : 0;
    res.json({ student, metrics: { attendanceRate, cgpa: student?.cgpa ?? 0 }, attendance, assignments, grades, timetable, notices, placements, events, resources, leaves, notifications });
  } catch (error) {
    next(error);
  }
});

dashboardRouter.get("/teacher", allowRoles("teacher"), async (req: AuthRequest, res, next) => {
  try {
    const teacher = await Teacher.findOne({ user: req.user?.id });
    const [subjects, assignments, leaveRequests, notices, attendanceCount, resources] = await Promise.all([
      Subject.find({ teacher: teacher?._id }),
      Assignment.find({ teacher: teacher?._id }).populate("subject", "name").sort({ dueAt: 1 }).limit(8),
      Leave.find({ status: "pending" }).populate("student", "rollNumber").sort({ createdAt: -1 }).limit(6),
      Notice.find({ audience: { $in: ["teacher", "all"] } }).sort({ createdAt: -1 }).limit(5),
      Attendance.countDocuments({ teacher: teacher?._id }),
      Resource.find({ uploadedBy: req.user?.id }).sort({ createdAt: -1 }).limit(5)
    ]);
    res.json({ teacher, metrics: { classes: subjects.length, pendingLeaves: leaveRequests.length, attendanceMarked: attendanceCount }, subjects, assignments, leaveRequests, notices, resources });
  } catch (error) {
    next(error);
  }
});

dashboardRouter.get("/admin", allowRoles("admin"), async (_req, res, next) => {
  try {
    const [students, teachers, departments, courses, events, placements, notices, clubs, alumni] = await Promise.all([
      Student.countDocuments(),
      Teacher.countDocuments(),
      Department.countDocuments(),
      Course.countDocuments(),
      Event.countDocuments(),
      Placement.countDocuments(),
      Notice.countDocuments(),
      Club.countDocuments(),
      Alumni.countDocuments()
    ]);
    const recentNotices = await Notice.find().sort({ createdAt: -1 }).limit(6);
    res.json({ metrics: { students, teachers, departments, courses, events, placements, notices, clubs, alumni }, recentNotices });
  } catch (error) {
    next(error);
  }
});
