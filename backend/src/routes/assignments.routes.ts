import { Router } from "express";
import { requireAuth } from "../middleware/auth.js";
import { Assignment } from "../models/Assignment.js";

export const assignmentsRouter = Router();

// Protect all routes
assignmentsRouter.use(requireAuth);

// Get all assignments for current user
assignmentsRouter.get("/", async (req, res, next) => {
  try {
    const assignments = await Assignment.find({ userId: (req as any).user?.id }).sort({ dueDate: 1 });
    res.json(assignments);
  } catch (err) {
    next(err);
  }
});

// Create an assignment
assignmentsRouter.post("/", async (req, res, next) => {
  try {
    const { title, course, description, status, givenDate, dueDate, reminderTime, weight } = req.body;
    
    const newAssignment = new Assignment({
      userId: (req as any).user?.id,
      title,
      course,
      description,
      status,
      givenDate,
      dueDate,
      reminderTime,
      weight
    });

    await newAssignment.save();
    res.status(201).json(newAssignment);
  } catch (err) {
    next(err);
  }
});

// Update an assignment
assignmentsRouter.put("/:id", async (req, res, next) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    const assignment = await Assignment.findOneAndUpdate(
      { _id: id, userId: (req as any).user?.id },
      { $set: updateData },
      { new: true }
    );

    if (!assignment) {
      return res.status(404).json({ error: "Assignment not found" });
    }

    res.json(assignment);
  } catch (err) {
    next(err);
  }
});

// Delete an assignment
assignmentsRouter.delete("/:id", async (req, res, next) => {
  try {
    const { id } = req.params;
    const assignment = await Assignment.findOneAndDelete({ _id: id, userId: (req as any).user?.id });

    if (!assignment) {
      return res.status(404).json({ error: "Assignment not found" });
    }

    res.json({ success: true, message: "Assignment deleted" });
  } catch (err) {
    next(err);
  }
});
