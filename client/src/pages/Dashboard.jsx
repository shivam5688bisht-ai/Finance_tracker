import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowUpRight, Plus, TrendingUp } from "lucide-react";
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import api from "../api";
import StatCard from "../components/StatCard";

const money = n => `₹${Number(n || 0).toLocaleString("en-IN",{maximumFractionDigits:0})}`;
export default function Dashboard() {
  const [items,setItems] = useState([]); const [budget,setBudget] = useState({amount:0,spent:0}); const [error,setError] = useState("");
  const month = new Date().toISOString().slice(0,7);
  async function load() {
    try { const [t,b] = await Promise.all([api.get("/transactions"),api.get(`/budgets/${month}`)]); setItems(t.data); setBudget(b.data); setError(""); }
    catch(e) { setError(e.response?.data?.message || "Could not load your data."); }
  }
  useEffect(()=>{load();},[]);
  const current = items.filter(x=>String(x.date).slice(0,7)===month);
  const income = current.filter(x=>x.type==="income").reduce((s,x)=>s+x.amount,0);
  const expense = current.filter(x=>x.type==="expense").reduce((s,x)=>s+x.amount,0);
  const totalIncome = items.filter(x=>x.type==="income").reduce((s,x)=>s+x.amount,0);
  const totalExpense = items.filter(x=>x.type==="expense").reduce((s,x)=>s+x.amount,0);
  const chart = useMemo(()=>Array.from({length:6},(_,i)=>{
    const d=new Date(); d.setDate(1); d.setMonth(d.getMonth()-5+i);
    const key=d.toISOString().slice(0,7);
    const list=items.filter(x=>String(x.date).slice(0,7)===key);
    return {month:d.toLocaleDateString(undefined,{month:"short"}),Income:list.filter(x=>x.type==="income").reduce((s,x)=>s+x.amount,0),Expenses:list.filter(x=>x.type==="expense").reduce((s,x)=>s+x.amount,0)};
  }),[items]);
  const pct=budget.amount ? Math.min(100,budget.spent/budget.amount*100):0;
  return <div className="page-content">
    {error && <div className="alert">{error} Make sure the backend and MongoDB are running.</div>}
    <div className="welcome-row"><div><h2>Good to see you.</h2><p className="muted">Here’s what’s happening with your money this month.</p></div><Link className="primary-button compact" to="/transactions"><Plus size={17}/> Add transaction</Link></div>
    <div className="stats-grid">
      <StatCard label="Total balance" value={totalIncome-totalExpense} kind="balance" note="All-time income minus expenses"/>
      <StatCard label="Income this month" value={income} kind="income" note="Money received this month"/>
      <StatCard label="Expenses this month" value={expense} kind="expense" note="Money spent this month"/>
    </div>
    <div className="dashboard-grid"><section className="panel chart-panel"><div className="panel-heading"><div><span className="eyebrow">YOUR CASH FLOW</span><h3>Income vs expenses</h3></div><span className="period-tag">Last 6 months</span></div><div className="chart-legend"><span><i className="legend-income"/> Income</span><span><i className="legend-expense"/> Expenses</span></div><div className="chart-wrap"><ResponsiveContainer width="100%" height="100%"><AreaChart data={chart} margin={{top:10,right:8,left:-16,bottom:0}}><defs><linearGradient id="incomeFill" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#38b98a" stopOpacity={.22}/><stop offset="100%" stopColor="#38b98a" stopOpacity={0}/></linearGradient><linearGradient id="expenseFill" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#ed9878" stopOpacity={.2}/><stop offset="100%" stopColor="#ed9878" stopOpacity={0}/></linearGradient></defs><CartesianGrid strokeDasharray="3 5" vertical={false} stroke="#263347"/><XAxis dataKey="month" axisLine={false} tickLine={false} tick={{fill:"#8794a8",fontSize:12}}/><YAxis axisLine={false} tickLine={false} tick={{fill:"#8794a8",fontSize:11}} tickFormatter={v=>v>=1000?`${v/1000}k`:v}/><Tooltip formatter={v=>money(v)} contentStyle={{background:"#172235",border:"1px solid #2b3a50",borderRadius:12,color:"#fff"}}/><Area type="monotone" dataKey="Income" stroke="#38b98a" strokeWidth={2.5} fill="url(#incomeFill)"/><Area type="monotone" dataKey="Expenses" stroke="#ed9878" strokeWidth={2.5} fill="url(#expenseFill)"/></AreaChart></ResponsiveContainer></div></section>
      <section className="panel budget-panel"><div className="panel-heading"><div><span className="eyebrow">MONTHLY PLAN</span><h3>Spending budget</h3></div><Link to="/budget" className="text-link">Manage <ArrowUpRight size={14}/></Link></div><div className="budget-number">{money(budget.spent)}<span> / {money(budget.amount)}</span></div><div className="progress-track"><div className={`progress-fill ${pct>=100?"over":pct>=80?"near":""}`} style={{width:`${pct}%`}}/></div><div className="budget-meta"><span>{budget.amount ? `${Math.round(pct)}% used` : "No budget set"}</span><b>{money(Math.max(0,budget.amount-budget.spent))} left</b></div><div className="budget-tip"><TrendingUp size={17}/><span>{budget.amount ? (pct>=100?"You’ve reached your monthly budget.":pct>=80?"You’re getting close to your budget limit.":"You’re within your planned spending.") : "Set a monthly budget to keep your spending on track."}</span></div><Link to="/budget" className="secondary-button full">{budget.amount?"View budget":"Set a budget"}</Link></section></div>
    <section className="panel recent-panel"><div className="panel-heading"><div><span className="eyebrow">THE LATEST</span><h3>Recent transactions</h3></div><Link to="/transactions" className="text-link">View all <ArrowUpRight size={14}/></Link></div>{items.length===0?<div className="empty-state"><div className="empty-icon">↗</div><b>No transactions yet</b><span>Add your first income or expense to see it here.</span><Link to="/transactions" className="text-link">Add a transaction</Link></div>:<div className="transaction-list">{items.slice(0,5).map(x=><div className="transaction-row" key={x._id}><div className={`transaction-symbol ${x.type}`}>{x.type==="income"?"↙":"↗"}</div><div className="transaction-info"><b>{x.title}</b><span>{x.category} · {new Date(x.date).toLocaleDateString()}</span></div><strong className={x.type==="income"?"amount-in":"amount-out"}>{x.type==="income"?"+":"−"}{money(x.amount)}</strong></div>)}</div>}</section>
  </div>;
}
