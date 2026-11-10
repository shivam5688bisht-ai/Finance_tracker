import { Router } from "express";
import Budget from "../models/Budget.js";
import Transaction from "../models/Transaction.js";
import auth from "../middleware/auth.js";

const router = Router();
router.use(auth);
router.get("/:month", async (req, res, next) => {
  try {
    const { month } = req.params;
    if (!/^\d{4}-\d{2}$/.test(month)) return res.status(400).json({ message: "Month must use YYYY-MM format." });
    const budget = await Budget.findOne({ user: req.userId, month });
    const start = new Date(`${month}-01T00:00:00.000Z`);
    const end = new Date(Date.UTC(start.getUTCFullYear(), start.getUTCMonth() + 1, 1));
    const spentResult = await Transaction.aggregate([
      { $match: { user: (await import("mongoose")).default.Types.ObjectId.createFromHexString(req.userId), type: "expense", date: { $gte: start, $lt: end } } },
      { $group: { _id: null, total: { $sum: "$amount" } } }
    ]);
    res.json({ month, amount: budget?.amount || 0, spent: spentResult[0]?.total || 0 });
  } catch (err) { next(err); }
});
router.put("/:month", async (req, res, next) => {
  try {
    const { month } = req.params;
    const amount = Number(req.body.amount);
    if (!/^\d{4}-\d{2}$/.test(month) || !Number.isFinite(amount) || amount < 0) return res.status(400).json({ message: "Enter a valid month and non-negative budget." });
    const budget = await Budget.findOneAndUpdate({ user: req.userId, month }, { amount }, { upsert: true, new: true, runValidators: true });
    res.json(budget);
  } catch (err) { next(err); }
});
export default router;
