import { Router } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/User.js";
import Category from "../models/Category.js";
import auth from "../middleware/auth.js";

const router = Router();
const makeToken = (userId) => jwt.sign({ userId }, process.env.JWT_SECRET, { expiresIn: "7d" });

router.post("/register", async (req, res, next) => {
  try {
    const { name, email, password } = req.body;
    if (!name?.trim() || !email?.trim() || !password) return res.status(400).json({ message: "Name, email and password are required." });
    if (password.length < 8) return res.status(400).json({ message: "Password must be at least 8 characters." });
    const normalizedEmail = email.trim().toLowerCase();
    if (await User.findOne({ email: normalizedEmail })) return res.status(409).json({ message: "An account with this email already exists." });
    const user = await User.create({ name: name.trim(), email: normalizedEmail, password: await bcrypt.hash(password, 12) });
    await Category.insertMany([
      ...["Food", "Transport", "Shopping", "Bills", "Entertainment", "Health", "Other"].map(name => ({ user: user._id, name, type: "expense" })),
      ...["Salary", "Freelance", "Gift", "Other income"].map(name => ({ user: user._id, name, type: "income" }))
    ]);
    res.status(201).json({ token: makeToken(user._id), user: { id: user._id, name: user.name, email: user.email } });
  } catch (err) { next(err); }
});

router.post("/login", async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email: email?.trim().toLowerCase() });
    if (!user || !await bcrypt.compare(password || "", user.password)) return res.status(401).json({ message: "Incorrect email or password." });
    res.json({ token: makeToken(user._id), user: { id: user._id, name: user.name, email: user.email } });
  } catch (err) { next(err); }
});

router.get("/me", auth, async (req, res, next) => {
  try {
    const user = await User.findById(req.userId).select("name email");
    if (!user) return res.status(404).json({ message: "User not found." });
    res.json({ user: { id: user._id, name: user.name, email: user.email } });
  } catch (err) { next(err); }
});

export default router;
