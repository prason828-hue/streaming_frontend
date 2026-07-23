import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "./AuthContext";

export default function Signup() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  function handleChange(e) {
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");

    if (form.password !== form.confirmPassword) {
      setError("Passwords don't match");
      return;
    }

    setLoading(true);
    try {
      await register({
        username: form.username,
        email: form.email,
        password: form.password,
      });
      setSuccess(true);
    } catch (err) {
      setError(err.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  }

  if (success) {
    return (
      <div className="auth-form">
        <h2 className="auth-form__title">Account created</h2>
        <p className="auth-form__subtitle">
          Your account is ready. Log in to continue.
        </p>
        <button className="auth-button" onClick={() => navigate("/login")}>
          Go to login
        </button>
      </div>
    );
  }

  return (
    <form className="auth-form" onSubmit={handleSubmit}>
      <h2 className="auth-form__title">Create account</h2>
      <p className="auth-form__subtitle">Register to get access.</p>

      <label className="auth-field">
        <span>Username</span>
        <input
          name="username"
          type="text"
          value={form.username}
          onChange={handleChange}
          autoComplete="username"
          required
        />
      </label>

      <label className="auth-field">
        <span>Email</span>
        <input
          name="email"
          type="email"
          value={form.email}
          onChange={handleChange}
          autoComplete="email"
          required
        />
      </label>

      <label className="auth-field">
        <span>Password</span>
        <input
          name="password"
          type="password"
          value={form.password}
          onChange={handleChange}
          autoComplete="new-password"
          required
        />
      </label>

      <label className="auth-field">
        <span>Confirm password</span>
        <input
          name="confirmPassword"
          type="password"
          value={form.confirmPassword}
          onChange={handleChange}
          autoComplete="new-password"
          required
        />
      </label>

      {error && <p className="auth-error">{error}</p>}

      <button className="auth-button" type="submit" disabled={loading}>
        {loading ? "Creating account…" : "Create account"}
      </button>

      <p className="auth-switch">
        Already have an account? <Link className="auth-link" to="/login">Log in</Link>
      </p>
    </form>
  );
}
