import React from "react";
import { Navigate, NavLink, Route, Routes, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "./context/AuthContext";
import { LayoutDashboard, ArrowLeftRight, Wallet, LogOut, CircleDollarSign } from "lucide-react";
import AuthPage from "./pages/AuthPage";
import Dashboard from "./pages/Dashboard";
import Transactions from "./pages/Transactions";
import Budget from "./pages/Budget";

function Protected({ children }) {
  const { user, loading } = useAuth();
  if (loading) return <div className="center-screen"><div className="spinner" /></div>;
  return user ? children : <Navigate to="/login" replace />;
}
function Shell({ children }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const title = location.pathname === "/" ? "Overview" : location.pathname.startsWith("/transactions") ? "Transactions" : "Budget & categories";
  return <div className="app-shell">
    <aside className="sidebar">
      <div className="brand"><span className="brand-mark"><CircleDollarSign size={21}/></span><span>moneta</span></div>
      <div className="nav-caption">WORKSPACE</div>
      <nav>
        <NavLink to="/" end><LayoutDashboard size={18}/> Overview</NavLink>
        <NavLink to="/transactions"><ArrowLeftRight size={18}/> Transactions</NavLink>
        <NavLink to="/budget"><Wallet size={18}/> Budget & categories</NavLink>
      </nav>
      <div className="sidebar-bottom"><div className="avatar">{user?.name?.[0]?.toUpperCase()}</div><div className="user-meta"><b>{user?.name}</b><span>{user?.email}</span></div><button className="icon-button" title="Log out" onClick={() => { logout(); navigate("/login"); }}><LogOut size={17}/></button></div>
    </aside>
    <main className="main-area"><header className="topbar"><div><span className="eyebrow">PERSONAL FINANCE</span><h1>{title}</h1></div><div className="top-date">{new Date().toLocaleDateString(undefined,{weekday:"short",month:"short",day:"numeric"})}</div></header>{children}</main>
  </div>;
}
export default function App() {
  return <Routes>
    <Route path="/login" element={<AuthPage mode="login"/>}/>
    <Route path="/signup" element={<AuthPage mode="signup"/>}/>
    <Route path="/" element={<Protected><Shell><Dashboard/></Shell></Protected>}/>
    <Route path="/transactions" element={<Protected><Shell><Transactions/></Shell></Protected>}/>
    <Route path="/budget" element={<Protected><Shell><Budget/></Shell></Protected>}/>
    <Route path="*" element={<Navigate to="/" replace/>}/>
  </Routes>;
}
