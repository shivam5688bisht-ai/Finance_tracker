import { useState } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import { ArrowRight, CircleDollarSign, ShieldCheck } from "lucide-react";
import { useAuth } from "../context/AuthContext";

export default function AuthPage({ mode }) {
  const signup = mode === "signup";
  const { user, login, register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  if (user) return <Navigate to="/" replace/>;
  const change = e => setForm({ ...form, [e.target.name]: e.target.value });
  async function submit(e) {
    e.preventDefault(); setError(""); setBusy(true);
    try {
      if (signup) await register(form.name, form.email, form.password);
      else await login(form.email, form.password);
      navigate("/");
    } catch (err) { setError(err.response?.data?.message || "Something went wrong. Check your connection."); }
    finally { setBusy(false); }
  }
  return <div className="auth-layout">
    <section className="auth-visual"><div className="brand light"><span className="brand-mark"><CircleDollarSign size={21}/></span><span>moneta</span></div><div className="visual-copy"><div className="pill"><span className="pulse-dot"/> YOUR MONEY, IN FOCUS</div><h1>Make every<br/><em>rupee count.</em></h1><p>A clearer view of your spending. A calmer way to plan what comes next.</p><div className="visual-stats"><div><b>01</b><span>Track spending</span></div><div><b>02</b><span>Build a budget</span></div><div><b>03</b><span>Stay in control</span></div></div></div><div className="visual-footer"><ShieldCheck size={16}/> Your financial records are private to your account.</div></section>
    <section className="auth-form-side"><div className="auth-form-wrap"><div className="mobile-brand brand"><span className="brand-mark"><CircleDollarSign size={21}/></span><span>moneta</span></div><span className="eyebrow">{signup ? "GET STARTED" : "WELCOME BACK"}</span><h2>{signup ? "Create your account" : "Sign in to Moneta"}</h2><p className="muted">{signup ? "Start building a healthier picture of your money." : "Your finances, right where you left them."}</p>
      <form onSubmit={submit} className="form-stack">
        {signup && <label>Full name<input name="name" value={form.name} onChange={change} placeholder="Your name" required maxLength="80"/></label>}
        <label>Email address<input name="email" type="email" value={form.email} onChange={change} placeholder="you@example.com" required/></label>
        <label>Password<input name="password" type="password" value={form.password} onChange={change} placeholder="At least 8 characters" minLength="8" required/></label>
        {error && <div className="alert">{error}</div>}
        <button className="primary-button" disabled={busy}>{busy ? "Please wait…" : signup ? "Create account" : "Sign in"} <ArrowRight size={17}/></button>
      </form><p className="switch-auth">{signup ? "Already have an account?" : "New to Moneta?"} <Link to={signup ? "/login" : "/signup"}>{signup ? "Sign in" : "Create an account"}</Link></p></div></section>
  </div>;
}
