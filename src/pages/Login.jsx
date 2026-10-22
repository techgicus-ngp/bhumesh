// screens/login_screen.dart
import { useState } from "react";
import { Link } from "react-router-dom";
import { Mail, Lock, Eye, EyeOff, AlertCircle } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../components/Toast";

export default function Login() {
  const { login } = useAuth();
  const toast = useToast();
  const [email, setEmail] = useState("");
  const [pass, setPass] = useState("");
  const [show, setShow] = useState(false);
  const [loading, setLoading] = useState(false);
  const [shake, setShake] = useState(false);
  const [errors, setErrors] = useState({});

  const fail = () => {
    setShake(true);
    setTimeout(() => setShake(false), 450);
  };

  const submit = async (e) => {
    e.preventDefault();
    const errs = {};
    if (!email.trim()) errs.email = "Enter email";
    if (!pass.trim()) errs.pass = "Enter password";
    setErrors(errs);
    if (Object.keys(errs).length) return fail();
    setLoading(true);
    try {
      await login(email.trim(), pass.trim()); // AuthContext updates → router redirects
    } catch (err) {
      fail();
      toast(err.message, "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-bg">
      <div style={{ width: "100%", maxWidth: 420 }}>
        <div className="auth-title">
          <div className="logo-badge" />
          <h1>Bhumesh Realtors</h1>
          <p>Real Estate Management</p>
        </div>
        <form
          className={`auth-card ${shake ? "shake" : ""}`}
          onSubmit={submit}
          noValidate
        >
          <h2 style={{ margin: 0, color: "#0D47A1" }}>Sign In</h2>
          <p style={{ color: "#9ca3af", fontSize: 13, margin: "4px 0 22px" }}>
            Welcome back! Please login.
          </p>

          <div className="field">
            <label>Email Address</label>
            <div className="input-icon">
              <Mail size={18} />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="username"
              />
            </div>
            {errors.email && <span className="err">{errors.email}</span>}
          </div>

          <div className="field">
            <label>Password</label>
            <div className="input-icon">
              <Lock size={18} />
              <input
                type={show ? "text" : "password"}
                value={pass}
                onChange={(e) => setPass(e.target.value)}
                autoComplete="current-password"
              />
              <button
                type="button"
                className="icon-btn eye"
                onClick={() => setShow(!show)}
              >
                {show ? <Eye size={18} /> : <EyeOff size={18} />}
              </button>
            </div>
            {errors.pass && <span className="err">{errors.pass}</span>}
          </div>

          <button
            className="btn full"
            style={{ height: 50, marginTop: 8 }}
            disabled={loading}
          >
            {loading ? (
              <>
                <span className="spinner sm" /> Signing in…
              </>
            ) : (
              "Sign In"
            )}
          </button>
          <p style={{ textAlign: "center", marginTop: 18, fontSize: 13 }}>
            <Link to="/register" style={{ color: "#1565C0", fontWeight: 600 }}>
              New employee? Register here
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
}
