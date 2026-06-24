import { Router } from "express";
import multer from "multer";
import { allowRoles, requireAuth } from "../middleware/auth.js";
import { Event, Notice, Placement, Resource, Notification, Club, Alumni } from "../models/Campus.js";
import { Assignment, Attendance, Grade, Leave } from "../models/Operations.js";
import type { AuthRequest } from "../types.js";

const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 10 * 1024 * 1024 } });
export const resourceRouter = Router();

resourceRouter.use(requireAuth);

resourceRouter.get("/feed", async (req: AuthRequest, res, next) => {
  try {
    const [notices, events] = await Promise.all([
      Notice.find({ audience: { $in: [req.user?.role, "all"] } }).sort({ pinned: -1, createdAt: -1 }).limit(12),
      Event.find().sort({ startsAt: 1 }).limit(8)
    ]);
    res.json({ notices, events });
  } catch (error) {
    next(error);
  }
});

resourceRouter.route("/notices")
  .get(async (_req, res, next) => {
    try {
      res.json(await Notice.find().sort({ createdAt: -1 }).limit(50));
    } catch (error) {
      next(error);
    }
  })
  .post(allowRoles("teacher", "admin"), async (req: AuthRequest, res, next) => {
    try {
      const notice = await Notice.create({ ...req.body, author: req.user?.id });
      req.app.get("io")?.emit("notification", { title: "New announcement", body: notice.title });
      res.status(201).json(notice);
    } catch (error) {
      next(error);
    }
  });

resourceRouter.route("/assignments")
  .get(async (_req, res, next) => {
    try {
      res.json(await Assignment.find().populate("subject", "name code").sort({ dueAt: 1 }).limit(50));
    } catch (error) {
      next(error);
    }
  })
  .post(allowRoles("teacher", "admin"), async (req, res, next) => {
    try {
      res.status(201).json(await Assignment.create(req.body));
    } catch (error) {
      next(error);
    }
  });

resourceRouter.post("/assignments/:id/submit", allowRoles("student"), upload.single("file"), async (req, res, next) => {
  try {
    res.status(201).json({
      message: "Submission received",
      assignment: req.params.id,
      fileName: req.file?.originalname ?? "manual-entry",
      storage: "cloudinary-ready"
    });
  } catch (error) {
    next(error);
  }
});

resourceRouter.post("/attendance", allowRoles("teacher", "admin"), async (req, res, next) => {
  try {
    res.status(201).json(await Attendance.insertMany(req.body.records ?? []));
  } catch (error) {
    next(error);
  }
});

resourceRouter.post("/grades", allowRoles("teacher", "admin"), async (req, res, next) => {
  try {
    res.status(201).json(await Grade.create(req.body));
  } catch (error) {
    next(error);
  }
});

resourceRouter.patch("/leaves/:id", allowRoles("teacher", "admin"), async (req, res, next) => {
  try {
    res.json(await Leave.findByIdAndUpdate(req.params.id, { status: req.body.status }, { new: true }));
  } catch (error) {
    next(error);
  }
});

resourceRouter.get("/placements", async (_req, res, next) => {
  try {
    res.json(await Placement.find().sort({ deadline: 1 }).limit(50));
  } catch (error) {
    next(error);
  }
});

resourceRouter.get("/library", async (req, res, next) => {
  try {
    const q = String(req.query.q ?? "");
    res.json(await Resource.find(q ? { $text: { $search: q } } : {}).sort({ createdAt: -1 }).limit(50));
  } catch (error) {
    next(error);
  }
});

resourceRouter.get("/clubs", async (_req, res, next) => {
  try {
    res.json(await Club.find().sort({ name: 1 }));
  } catch (error) {
    next(error);
  }
});

resourceRouter.get("/alumni", async (_req, res, next) => {
  try {
    res.json(await Alumni.find().sort({ graduationYear: -1 }).limit(50));
  } catch (error) {
    next(error);
  }
});

resourceRouter.get("/notifications", async (req: AuthRequest, res, next) => {
  try {
    res.json(await Notification.find({ user: req.user?.id }).sort({ createdAt: -1 }).limit(30));
  } catch (error) {
    next(error);
  }
});
