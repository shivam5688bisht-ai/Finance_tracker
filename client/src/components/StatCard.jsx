import { ArrowDownRight, ArrowUpRight } from "lucide-react";
export default function StatCard({ label, value, kind, note }) {
  const positive = kind === "income";
  return <div className="stat-card"><div className="stat-top"><span>{label}</span><span className={`stat-icon ${kind}`}>{positive ? <ArrowUpRight size={18}/> : kind === "expense" ? <ArrowDownRight size={18}/> : "₹"}</span></div><strong>₹{Number(value || 0).toLocaleString("en-IN",{maximumFractionDigits:2})}</strong><small>{note}</small></div>;
}
