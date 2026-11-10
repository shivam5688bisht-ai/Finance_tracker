import { Router } from "express";
import Category from "../models/Category.js";
import auth from "../middleware/auth.js";

const router = Router();
router.use(auth);
router.get("/", async (req, res, next) => {
  try { res.json(await Category.find({ user: req.userId }).sort({ type: 1, name: 1 })); }
  catch (err) { next(err); }
});
router.post("/", async (req, res, next) => {
  try {
    const name = req.body.name?.trim();
    const type = req.body.type || "expense";
    if (!name || name.length > 40 || !["income", "expense"].includes(type)) return res.status(400).json({ message: "Enter a valid category name and type." });
    const category = await Category.create({ user: req.userId, name, type });
    res.status(201).json(category);
  } catch (err) {
    if (err.code === 11000) return res.status(409).json({ message: "That category already exists." });
    next(err);
  }
});
router.delete("/:id", async (req, res, next) => {
  try {
    const category = await Category.findOneAndDelete({ _id: req.params.id, user: req.userId });
    if (!category) return res.status(404).json({ message: "Category not found." });
    res.json({ message: "Category deleted." });
  } catch (err) { next(err); }
});
export default router;
