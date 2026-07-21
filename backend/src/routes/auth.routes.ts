import { Router } from "express";
import { z } from "zod";
import { User } from "../models/User.js";
import { Student, Department } from "../models/Academic.js";
import { requireAuth, signToken } from "../middleware/auth.js";
import type { AuthRequest } from "../types.js";
import { OAuth2Client } from "google-auth-library";
import { env } from "../config/env.js";

const client = new OAuth2Client(env.GOOGLE_CLIENT_ID);

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
    await Student.create({ user: user._id, rollNumber: `STU-${Date.now()}`, semester: 1 });
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
    if (!user) return res.status(404).json({ message: "User not found" });
    const student = await Student.findOne({ user: user._id });
    res.json({
      user: {
        ...sanitizeUser(user),
        rollNumber: student?.rollNumber,
        semester: student?.semester,

        cgpa: student?.cgpa
      }
    });
  } catch (error) {
    next(error);
  }
});

authRouter.post("/social-login", async (req, res, next) => {
  try {
    const { idToken } = z.object({ idToken: z.string() }).parse(req.body);

    let email: string;
    let name: string;
    let avatar: string | undefined;

    if (env.GOOGLE_CLIENT_ID) {
      const ticket = await client.verifyIdToken({
        idToken,
        audience: env.GOOGLE_CLIENT_ID
      });
      const payload = ticket.getPayload();
      if (!payload || !payload.email) {
        return res.status(400).json({ message: "Invalid Google token payload" });
      }
      email = payload.email;
      name = payload.name || "Google User";
      avatar = payload.picture;
    } else {
      // Development mode fallback
      try {
        const parsed = JSON.parse(idToken);
        email = parsed.email;
        name = parsed.name;
        avatar = parsed.avatar;
      } catch {
        email = idToken.includes("@") ? idToken : "sourabh08923@gmail.com";
        name = "Sourabh Sahu";
        avatar = "https://lh3.googleusercontent.com/a/default-user";
      }
    }

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

authRouter.post("/github", async (req, res, next) => {
  try {
    const { code } = z.object({ code: z.string() }).parse(req.body);

    if (!env.GITHUB_CLIENT_ID || !env.GITHUB_CLIENT_SECRET) {
      return res.status(500).json({ message: "GitHub OAuth is not configured on the server." });
    }

    const tokenResponse = await fetch("https://github.com/login/oauth/access_token", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Accept": "application/json",
      },
      body: JSON.stringify({
        client_id: env.GITHUB_CLIENT_ID,
        client_secret: env.GITHUB_CLIENT_SECRET,
        code
      })
    });

    const tokenData = await tokenResponse.json();
    if (tokenData.error) {
      return res.status(400).json({ message: tokenData.error_description || "Invalid GitHub auth code" });
    }

    const accessToken = tokenData.access_token;

    const userResponse = await fetch("https://api.github.com/user", {
      headers: {
        "Authorization": `Bearer ${accessToken}`,
        "Accept": "application/json"
      }
    });

    const userData = await userResponse.json();
    let email = userData.email;

    // GitHub users can have private emails. We fetch the emails array if primary is null.
    if (!email) {
      const emailResponse = await fetch("https://api.github.com/user/emails", {
        headers: {
          "Authorization": `Bearer ${accessToken}`,
          "Accept": "application/json"
        }
      });
      const emails = await emailResponse.json();
      const primaryEmail = emails.find((e: any) => e.primary && e.verified);
      if (primaryEmail) email = primaryEmail.email;
    }

    if (!email) {
      return res.status(400).json({ message: "No verified email found on GitHub account" });
    }

    const name = userData.name || userData.login || "GitHub User";
    const avatar = userData.avatar_url;

    let user = await User.findOne({ email });
    if (!user) {
      user = await User.create({
        name,
        email,
        password: Math.random().toString(36).slice(-10) + "Aa1!",
        role: "student",
        avatar,
        isProfileComplete: false
      });
      await Student.create({ user: user._id, rollNumber: `TEMP-STU-${Date.now()}` });
    }

    const token = signToken({ id: user.id, role: user.role, isProfileComplete: user.isProfileComplete });
    res.json({ token, user: sanitizeUser(user) });
  } catch (error) {
    next(error);
  }
});

authRouter.post("/linkedin", async (req, res, next) => {
  try {
    const { code, redirectUri } = z.object({ code: z.string(), redirectUri: z.string() }).parse(req.body);

    if (!env.LINKEDIN_CLIENT_ID || !env.LINKEDIN_CLIENT_SECRET) {
      return res.status(500).json({ message: "LinkedIn OAuth is not configured on the server." });
    }

    const tokenResponse = await fetch("https://www.linkedin.com/oauth/v2/accessToken", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        grant_type: "authorization_code",
        client_id: env.LINKEDIN_CLIENT_ID,
        client_secret: env.LINKEDIN_CLIENT_SECRET,
        code,
        redirect_uri: redirectUri
      }).toString()
    });

    const tokenData = await tokenResponse.json();
    if (tokenData.error) {
      return res.status(400).json({ message: tokenData.error_description || "Invalid LinkedIn auth code" });
    }

    const accessToken = tokenData.access_token;

    const userResponse = await fetch("https://api.linkedin.com/v2/userinfo", {
      headers: {
        "Authorization": `Bearer ${accessToken}`
      }
    });

    const userData = await userResponse.json();
    if (!userData.email) {
      return res.status(400).json({ message: "No email returned from LinkedIn" });
    }

    const email = userData.email;
    const name = userData.name || "LinkedIn User";
    const avatar = userData.picture;

    let user = await User.findOne({ email });
    if (!user) {
      user = await User.create({
        name,
        email,
        password: Math.random().toString(36).slice(-10) + "Aa1!",
        role: "student",
        avatar,
        isProfileComplete: false
      });
      await Student.create({ user: user._id, rollNumber: `TEMP-STU-${Date.now()}` });
    }

    const token = signToken({ id: user.id, role: user.role, isProfileComplete: user.isProfileComplete });
    res.json({ token, user: sanitizeUser(user) });
  } catch (error) {
    next(error);
  }
});

authRouter.put("/complete-profile", requireAuth, async (req: AuthRequest, res, next) => {
  try {
    const { name, rollNumber, department, semester } = z.object({
      name: z.string().min(2, "Name is too short"),
      rollNumber: z.string().min(5, "Invalid roll number"),
      department: z.string().optional(),
      semester: z.number().min(1).max(8).optional()
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
    await student.save();

    const token = signToken({ id: user.id, role: user.role, isProfileComplete: true });
    res.json({
      token,
      user: {
        ...sanitizeUser(user),
        rollNumber: student.rollNumber,
        semester: student.semester,
        cgpa: student.cgpa
      }
    });
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
