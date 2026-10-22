// screens/register_employee_screen.dart
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, User, Mail, Lock, Eye, EyeOff } from 'lucide-react';
import { registerEmployee } from '../services/authService';
import { useToast } from '../components/Toast';

function Field({ icon: Icon, label, error, suffix, ...props }) {
  return (
    <div className="field">
      <label>{label}</label>
      <div className="input-icon"><Icon size={18} /><input {...props} />{suffix}</div>
      {error && <span className="err">{error}</span>}
    </div>
  );
}

export default function Register() {
  const nav = useNavigate();
  const toast = useToast();
  const [f, setF] = useState({ name: '', email: '', pass: '', confirm: '' });
  const [show, setShow] = useState({ pass: false, confirm: false });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const set = (k) => (e) => setF({ ...f, [k]: e.target.value });

  const submit = async (e) => {
    e.preventDefault();
    const errs = {};
    if (!f.name) errs.name = 'Enter name';
    if (!f.email) errs.email = 'Enter email'; else if (!f.email.includes('@')) errs.email = 'Enter valid email';
    if (f.pass.length < 6) errs.pass = 'Min 6 characters';
    if (f.confirm !== f.pass) errs.confirm = 'Passwords do not match';
    setErrors(errs);
    if (Object.keys(errs).length) return;
    setLoading(true);
    try {
      await registerEmployee({ email: f.email, name: f.name, password: f.pass });
      toast('✓ Registration successful! Please login.', 'success');
      nav('/login');
    } catch (err) {
      toast(err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  const eye = (k) => (
    <button type="button" className="icon-btn eye" onClick={() => setShow({ ...show, [k]: !show[k] })}>
      {show[k] ? <Eye size={18} /> : <EyeOff size={18} />}
    </button>
  );

  return (
    <div className="auth-bg light">
      <div style={{ width: '100%', maxWidth: 440 }}>
        <div style={{ display: 'flex', alignItems: 'center', color: '#fff', marginBottom: 16 }}>
          <button className="icon-btn light" onClick={() => nav(-1)}><ArrowLeft /></button>
          <h2 style={{ margin: 0, fontSize: 20 }}>Associate Registration</h2>
        </div>
        <form className="auth-card" onSubmit={submit} noValidate>
          <h2 style={{ margin: 0, color: '#0D47A1' }}>Create Account</h2>
          <p style={{ color: '#9ca3af', fontSize: 13, margin: '4px 0 22px' }}>Fill in your details to register.</p>
          <Field icon={User} label="Full Name" value={f.name} onChange={set('name')} error={errors.name} />
          <Field icon={Mail} label="Email Address" type="email" value={f.email} onChange={set('email')} error={errors.email} />
          <Field icon={Lock} label="Password" type={show.pass ? 'text' : 'password'} value={f.pass} onChange={set('pass')} error={errors.pass} suffix={eye('pass')} />
          <Field icon={Lock} label="Confirm Password" type={show.confirm ? 'text' : 'password'} value={f.confirm} onChange={set('confirm')} error={errors.confirm} suffix={eye('confirm')} />
          <button className="btn full" style={{ height: 50, marginTop: 8 }} disabled={loading}>
            {loading ? <span className="spinner sm" /> : 'Register'}
          </button>
        </form>
      </div>
    </div>
  );
}
