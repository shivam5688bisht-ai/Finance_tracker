import { Router } from "express";
import mongoose from "mongoose";
import Transaction from "../models/Transaction.js";
import auth from "../middleware/auth.js";

const router = Router();
router.use(auth);

function validBody(body) {
  return body.title?.trim() && Number.isFinite(Number(body.amount)) && Number(body.amount) > 0 &&
    ["income", "expense"].includes(body.type) && body.category?.trim() && !Number.isNaN(new Date(body.date).getTime());
}
router.get("/", async (req, res, next) => {
  try {
    const filter = { user: req.userId };
    if (req.query.type && ["income", "expense"].includes(req.query.type)) filter.type = req.query.type;
    if (req.query.category) filter.category = req.query.category;
    const items = await Transaction.find(filter).sort({ date: -1, createdAt: -1 });
    res.json(items);
  } catch (err) { next(err); }
});
router.post("/", async (req, res, next) => {
  try {
    if (!validBody(req.body)) return res.status(400).json({ message: "Please provide a valid title, amount, type, category and date." });
    const item = await Transaction.create({ ...req.body, amount: Number(req.body.amount), user: req.userId });
    res.status(201).json(item);
  } catch (err) { next(err); }
});
router.put("/:id", async (req, res, next) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) return res.status(400).json({ message: "Invalid transaction ID." });
    if (!validBody(req.body)) return res.status(400).json({ message: "Please provide valid transaction details." });
    const item = await Transaction.findOneAndUpdate(
      { _id: req.params.id, user: req.userId },
      { ...req.body, amount: Number(req.body.amount) }, { new: true, runValidators: true }
    );
    if (!item) return res.status(404).json({ message: "Transaction not found." });
    res.json(item);
  } catch (err) { next(err); }
});
router.delete("/:id", async (req, res, next) => {
  try {
    const item = await Transaction.findOneAndDelete({ _id: req.params.id, user: req.userId });
    if (!item) return res.status(404).json({ message: "Transaction not found." });
    res.json({ message: "Transaction deleted." });
  } catch (err) { next(err); }
});
export default router;
