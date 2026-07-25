import { Router, Response, NextFunction } from "express";
import { User } from "../models/User.js";
import { Note } from "../models/Note.js";
import { Pyq } from "../models/Pyq.js";
import { CtPyq } from "../models/CtPyq.js";
import { Assignment } from "../models/Assignment.js";
import { Feedback } from "../models/Feedback.js";
import { Subject, Department } from "../models/Academic.js";
import { requireAuth, allowRoles } from "../middleware/auth.js";
import type { AuthRequest } from "../types.js";

const router = Router();

// Secure all admin routes
router.use(requireAuth, allowRoles("admin"));

// ── Stats ──────────────────────────────────────────────────────────────────
router.get("/stats", async (_req, res, next) => {
  try {
    const [totalUsers, totalNotes, totalPyqs] = await Promise.all([
      User.countDocuments(),
      Note.countDocuments(),
      Pyq.countDocuments()
    ]);
    res.json({ totalUsers, totalNotes, totalPyqs });
  } catch (error) {
    next(error);
  }
});

// ── Users ──────────────────────────────────────────────────────────────────
router.get("/users", async (_req, res, next) => {
  try {
    const users = await User.find().select("-password").sort({ createdAt: -1 });
    res.json(users);
  } catch (error) {
    next(error);
  }
});

router.put("/users/:id/role", async (req, res, next) => {
  try {
    const { role } = req.body;
    if (!["student", "admin"].includes(role)) {
      return res.status(400).json({ message: "Invalid role" });
    }
    const user = await User.findByIdAndUpdate(req.params.id, { role }, { new: true }).select("-password");
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json(user);
  } catch (error) {
    next(error);
  }
});

router.delete("/users/:id", async (req, res, next) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json({ message: "User deleted successfully" });
  } catch (error) {
    next(error);
  }
});

// ── Notes (Admin: all notes) ───────────────────────────────────────────────
router.get("/notes", async (_req, res, next) => {
  try {
    const notes = await Note.find()
      .select("-fileData")
      .populate("user", "name email")
      .sort({ createdAt: -1 });
    res.json(notes);
  } catch (error) {
    next(error);
  }
});

router.post("/notes/link", requireAuth, allowRoles("admin"), async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { title, subject, semester, syllabus, branch, driveUrl } = req.body;
    if (!title || !subject || !semester || !syllabus || !branch || !driveUrl) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const note = await Note.create({
      user: req.user?.id,
      title,
      subject,
      semester: parseInt(semester),
      syllabus,
      branch,
      driveUrl
    });
    res.status(201).json(note);
  } catch (error) {
    next(error);
  }
});

router.delete("/notes/:id", async (req, res, next) => {
  try {
    const note = await Note.findByIdAndDelete(req.params.id);
    if (!note) return res.status(404).json({ message: "Note not found" });
    res.json({ message: "Note deleted" });
  } catch (error) {
    next(error);
  }
});

// ── PYQs (Admin: all papers) ───────────────────────────────────────────────
router.get("/pyqs", async (_req, res, next) => {
  try {
    const pyqs = await Pyq.find()
      .select("-fileData")
      .populate("user", "name email")
      .sort({ createdAt: -1 });
    res.json(pyqs);
  } catch (error) {
    next(error);
  }
});

router.post("/pyqs/link", requireAuth, allowRoles("admin"), async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { paperName, subject, semester, syllabus, branch, driveUrl } = req.body;
    if (!paperName || !subject || !semester || !syllabus || !branch || !driveUrl) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const pyq = await Pyq.create({
      user: req.user?.id,
      paperName,
      subject,
      semester: parseInt(semester),
      syllabus,
      branch,
      driveUrl
    });
    res.status(201).json(pyq);
  } catch (error) {
    next(error);
  }
});

router.delete("/pyqs/:id", async (req, res, next) => {
  try {
    const pyq = await Pyq.findByIdAndDelete(req.params.id);
    if (!pyq) return res.status(404).json({ message: "PYQ not found" });
    res.json({ message: "PYQ deleted" });
  } catch (error) {
    next(error);
  }
});

// ── CT-PYQs (Admin: all papers) ───────────────────────────────────────────────
router.get("/ct-pyqs", async (_req, res, next) => {
  try {
    const ctPyqs = await CtPyq.find()
      .select("-fileData")
      .populate("user", "name email")
      .sort({ createdAt: -1 });
    res.json(ctPyqs);
  } catch (error) {
    next(error);
  }
});

router.post("/ct-pyqs/link", requireAuth, allowRoles("admin"), async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { paperName, subject, semester, syllabus, branch, driveUrl } = req.body;
    if (!paperName || !subject || !semester || !syllabus || !branch || !driveUrl) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const ctPyq = await CtPyq.create({
      user: req.user?.id,
      paperName,
      subject,
      semester: parseInt(semester),
      syllabus,
      branch,
      driveUrl
    });
    res.status(201).json(ctPyq);
  } catch (error) {
    next(error);
  }
});

router.delete("/ct-pyqs/:id", async (req, res, next) => {
  try {
    const ctPyq = await CtPyq.findByIdAndDelete(req.params.id);
    if (!ctPyq) return res.status(404).json({ message: "CT-PYQ not found" });
    res.json({ message: "CT-PYQ deleted" });
  } catch (error) {
    next(error);
  }
});

// ── Assignments (Admin: all assignments) ──────────────────────────────────
router.get("/assignments", async (_req, res, next) => {
  try {
    const assignments = await Assignment.find()
      .select("-fileData")
      .populate("user", "name email")
      .sort({ createdAt: -1 });
    res.json(assignments);
  } catch (error) {
    next(error);
  }
});

router.post("/assignments/link", requireAuth, allowRoles("admin"), async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { title, subject, semester, syllabus, branch, driveUrl } = req.body;
    if (!title || !subject || !semester || !syllabus || !branch || !driveUrl) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const assignment = await Assignment.create({
      user: req.user?.id,
      title,
      subject,
      semester: parseInt(semester),
      syllabus,
      branch,
      driveUrl
    });
    res.status(201).json(assignment);
  } catch (error) {
    next(error);
  }
});

router.delete("/assignments/:id", async (req, res, next) => {
  try {
    const assignment = await Assignment.findByIdAndDelete(req.params.id);
    if (!assignment) return res.status(404).json({ message: "Assignment not found" });
    res.json({ message: "Assignment deleted" });
  } catch (error) {
    next(error);
  }
});

// ── Feedback (Admin: all feedback) ────────────────────────────────────────
router.get("/feedback", async (_req, res, next) => {
  try {
    const feedback = await Feedback.find().sort({ createdAt: -1 });
    res.json(feedback);
  } catch (error) {
    next(error);
  }
});

router.put("/feedback/:id/status", async (req, res, next) => {
  try {
    const { status } = req.body;
    if (!['new', 'reviewed', 'resolved'].includes(status)) {
      return res.status(400).json({ message: "Invalid status" });
    }
    const updated = await Feedback.findByIdAndUpdate(req.params.id, { status }, { new: true });
    if (!updated) return res.status(404).json({ message: "Feedback not found" });
    res.json(updated);
  } catch (error) {
    next(error);
  }
});

// ── Subjects (Admin) ───────────────────────────────────────────────────────
router.get("/subjects", async (_req, res, next) => {
  try {
    const subjects = await Subject.find().populate("department", "name code");
    res.json(subjects);
  } catch (error) {
    next(error);
  }
});

router.post("/subjects", async (req, res, next) => {
  try {
    const { name, code, departmentCode, semester, syllabus } = req.body;
    const dept = await Department.findOne({ code: departmentCode.toUpperCase() });
    if (!dept) {
      return res.status(404).json({ message: "Department not found" });
    }
    
    const subject = await Subject.create({
      name,
      code,
      department: dept._id,
      semester: parseInt(semester),
      syllabus
    });
    
    const populated = await subject.populate("department", "name code");
    res.status(201).json(populated);
  } catch (error) {
    next(error);
  }
});

router.put("/subjects/:id", async (req, res, next) => {
  try {
    const { name, code, departmentCode, semester, syllabus } = req.body;
    let updateData: any = { name, code, semester: parseInt(semester), syllabus };
    
    if (departmentCode) {
      const dept = await Department.findOne({ code: departmentCode.toUpperCase() });
      if (!dept) {
        return res.status(404).json({ message: "Department not found" });
      }
      updateData.department = dept._id;
    }

    const subject = await Subject.findByIdAndUpdate(req.params.id, updateData, { new: true });
    if (!subject) return res.status(404).json({ message: "Subject not found" });
    
    const populated = await subject.populate("department", "name code");
    res.json(populated);
  } catch (error) {
    next(error);
  }
});

router.delete("/subjects/:id", async (req, res, next) => {
  try {
    const subject = await Subject.findByIdAndDelete(req.params.id);
    if (!subject) return res.status(404).json({ message: "Subject not found" });
    res.json({ message: "Subject deleted" });
  } catch (error) {
    next(error);
  }
});

export { router as adminRouter };
