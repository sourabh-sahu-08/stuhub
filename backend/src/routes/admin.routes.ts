import { Router, Response, NextFunction } from "express";
import { User } from "../models/User.js";
import { Note } from "../models/Note.js";
import { Pyq } from "../models/Pyq.js";
import { CtPyq } from "../models/CtPyq.js";
import { Assignment } from "../models/Assignment.js";
import { Feedback } from "../models/Feedback.js";
import { Resource } from "../models/Resource.js";
import { GamificationService } from "../services/gamification.service.js";
import { Subject, Department } from "../models/Academic.js";
import { requireAuth, allowRoles } from "../middleware/auth.js";
import type { AuthRequest } from "../types.js";

const router = Router();

// Secure all admin routes
router.use(requireAuth, allowRoles("admin", "co-owner", "owner"));

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

router.put("/users/:id/role", async (req: AuthRequest, res, next) => {
  try {
    const { role } = req.body;
    if (!["student", "admin", "co-owner"].includes(role)) {
      return res.status(400).json({ message: "Invalid role" });
    }
    
    // Only owner/co-owner can change roles
    if (!req.user || (req.user.role !== "owner" && req.user.role !== "co-owner")) {
      return res.status(403).json({ message: "Only owners and co-owners can change roles" });
    }

    const targetUser = await User.findById(req.params.id);
    if (!targetUser) return res.status(404).json({ message: "User not found" });

    // Protect owners
    if (targetUser.role === "owner") {
      return res.status(403).json({ message: "Cannot change the role of an owner" });
    }

    // Co-owners cannot demote other co-owners (only owner can)
    if (targetUser.role === "co-owner" && req.user.role === "co-owner" && req.user.id !== targetUser.id) {
      return res.status(403).json({ message: "Co-owners cannot change the role of other co-owners" });
    }

    targetUser.role = role;
    await targetUser.save();
    
    res.json({ message: "Role updated successfully", user: targetUser });
  } catch (error) {
    next(error);
  }
});

router.delete("/users/:id", async (req: AuthRequest, res, next) => {
  try {
    // Only owner/co-owner can delete users
    if (!req.user || (req.user.role !== "owner" && req.user.role !== "co-owner")) {
      return res.status(403).json({ message: "Only owners and co-owners can delete users" });
    }

    const targetUser = await User.findById(req.params.id);
    if (!targetUser) return res.status(404).json({ message: "User not found" });

    // Protect owners
    if (targetUser.role === "owner") {
      return res.status(403).json({ message: "Cannot delete an owner" });
    }

    // Co-owners cannot delete other co-owners
    if (targetUser.role === "co-owner" && req.user.role === "co-owner" && req.user.id !== targetUser.id) {
      return res.status(403).json({ message: "Co-owners cannot delete other co-owners" });
    }

    await User.findByIdAndDelete(req.params.id);
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

router.post("/notes/link", async (req: AuthRequest, res: Response, next: NextFunction) => {
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

router.delete("/notes/:id", async (req: AuthRequest, res, next) => {
  try {
    const note = await Note.findById(req.params.id);
    if (!note) return res.status(404).json({ message: "Note not found" });

    // Ownership check for standard admins
    if (req.user?.role === "admin" && note.user.toString() !== req.user.id) {
      return res.status(403).json({ message: "You can only delete content that you created" });
    }

    await note.deleteOne();
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

router.post("/pyqs/link", async (req: AuthRequest, res: Response, next: NextFunction) => {
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

router.delete("/pyqs/:id", async (req: AuthRequest, res, next) => {
  try {
    const pyq = await Pyq.findById(req.params.id);
    if (!pyq) return res.status(404).json({ message: "PYQ not found" });

    if (req.user?.role === "admin" && pyq.user.toString() !== req.user.id) {
      return res.status(403).json({ message: "You can only delete content that you created" });
    }

    await pyq.deleteOne();
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

router.post("/ct-pyqs/link", async (req: AuthRequest, res: Response, next: NextFunction) => {
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

router.delete("/ct-pyqs/:id", async (req: AuthRequest, res, next) => {
  try {
    const ctPyq = await CtPyq.findById(req.params.id);
    if (!ctPyq) return res.status(404).json({ message: "CT-PYQ not found" });

    if (req.user?.role === "admin" && ctPyq.user.toString() !== req.user.id) {
      return res.status(403).json({ message: "You can only delete content that you created" });
    }

    await ctPyq.deleteOne();
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

router.post("/assignments/link", async (req: AuthRequest, res: Response, next: NextFunction) => {
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

router.delete("/assignments/:id", async (req: AuthRequest, res, next) => {
  try {
    const assignment = await Assignment.findById(req.params.id);
    if (!assignment) return res.status(404).json({ message: "Assignment not found" });

    if (req.user?.role === "admin" && assignment.user.toString() !== req.user.id) {
      return res.status(403).json({ message: "You can only delete content that you created" });
    }

    await assignment.deleteOne();
    res.json({ message: "Assignment deleted" });
  } catch (error) {
    next(error);
  }
});

// ── Resources (Admin: all resources) ──────────────────────────────────────
router.get("/resources", async (_req, res, next) => {
  try {
    const resources = await Resource.find()
      .populate("user", "name email")
      .sort({ createdAt: -1 });
    res.json(resources);
  } catch (error) {
    next(error);
  }
});

router.post("/resources/link", async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const { title, url, type, subject, semester, syllabus, branch } = req.body;
      if (!title || !url || !type) {
        return res.status(400).json({ message: "Title, url, and type are required fields" });
      }
  
      const resource = await Resource.create({
        user: req.user?.id,
        title,
        url,
        type,
        subject: subject || undefined,
        semester: semester ? parseInt(semester) : undefined,
        syllabus: syllabus || undefined,
        branch: branch || undefined
      });

      await GamificationService.logActivity(
        req.user!._id,
        "UPLOAD_RESOURCE",
        resource._id,
        "Resource"
      );

      res.status(201).json(resource);
  } catch (error) {
    next(error);
  }
});

router.put("/resources/:id", async (req: AuthRequest, res, next) => {
  try {
    const { title, url, type, subject, semester, syllabus, branch } = req.body;
    
    if (!title || !url || !type) {
      return res.status(400).json({ message: "Title, url, and type are required fields" });
    }

    const resource = await Resource.findById(req.params.id);
    if (!resource) return res.status(404).json({ message: "Resource not found" });

    if (req.user?.role === "admin" && resource.user.toString() !== req.user.id) {
      return res.status(403).json({ message: "You can only edit content that you created" });
    }

    let updateData: any = { 
      title, 
      url, 
      type, 
      subject: subject || undefined, 
      semester: semester ? parseInt(semester) : undefined, 
      syllabus: syllabus || undefined, 
      branch: branch || undefined 
    };
    
    Object.assign(resource, updateData);
    await resource.save();
    
    res.json(resource);
  } catch (error) {
    next(error);
  }
});

router.delete("/resources/:id", async (req: AuthRequest, res, next) => {
  try {
    const resource = await Resource.findById(req.params.id);
    if (!resource) return res.status(404).json({ message: "Resource not found" });

    if (req.user?.role === "admin" && resource.user.toString() !== req.user.id) {
      return res.status(403).json({ message: "You can only delete content that you created" });
    }

    await resource.deleteOne();
    res.json({ message: "Resource deleted" });
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
    const subjects = await Subject.find();
    res.json(subjects);
  } catch (error) {
    next(error);
  }
});

router.post("/subjects", async (req: AuthRequest, res, next) => {
  try {
    const { name, code, branches, semesters, syllabus } = req.body;
    
    if (!name || typeof name !== "string") {
      return res.status(400).json({ message: "Subject name is required" });
    }
    if (!Array.isArray(branches) || branches.length === 0) {
      return res.status(400).json({ message: "At least one branch must be selected" });
    }
    if (!Array.isArray(semesters) || semesters.length === 0) {
      return res.status(400).json({ message: "At least one semester must be selected" });
    }

    const subject = await Subject.create({
      name,
      code,
      branches: branches.map(b => b.toUpperCase()),
      semesters: semesters.map(s => parseInt(s)),
      syllabus,
      createdBy: req.user?.id
    });
    
    res.status(201).json(subject);
  } catch (error) {
    next(error);
  }
});

router.put("/subjects/:id", async (req: AuthRequest, res, next) => {
  try {
    const { name, code, branches, semesters, syllabus } = req.body;
    
    if (!name || typeof name !== "string") {
      return res.status(400).json({ message: "Subject name is required" });
    }
    if (!Array.isArray(branches) || branches.length === 0) {
      return res.status(400).json({ message: "At least one branch must be selected" });
    }
    if (!Array.isArray(semesters) || semesters.length === 0) {
      return res.status(400).json({ message: "At least one semester must be selected" });
    }

    const subject = await Subject.findById(req.params.id);
    if (!subject) return res.status(404).json({ message: "Subject not found" });

    if (req.user?.role === "admin" && subject.createdBy?.toString() !== req.user.id) {
      return res.status(403).json({ message: "You can only edit subjects that you created" });
    }

    let updateData: any = { 
      name, 
      code, 
      branches: branches.map(b => b.toUpperCase()), 
      semesters: semesters.map(s => parseInt(s)), 
      syllabus 
    };
    
    Object.assign(subject, updateData);
    await subject.save();
    
    res.json(subject);
  } catch (error) {
    next(error);
  }
});

router.delete("/subjects/:id", async (req: AuthRequest, res, next) => {
  try {
    const subject = await Subject.findById(req.params.id);
    if (!subject) return res.status(404).json({ message: "Subject not found" });

    if (req.user?.role === "admin" && subject.createdBy?.toString() !== req.user.id) {
      return res.status(403).json({ message: "You can only delete subjects that you created" });
    }

    await subject.deleteOne();
    res.json({ message: "Subject deleted" });
  } catch (error) {
    next(error);
  }
});

export { router as adminRouter };
