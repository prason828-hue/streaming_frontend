import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "./AuthContext";

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ username: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  function handleChange(e) {
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      await login(form);
      navigate("/");
    } catch (err) {
      if (err.error === "USERNAME_NOT_FOUND") {
        setError("Incorrect username");
      } else if (err.error === "INVALID_PASSWORD") {
        setError("Incorrect password");
      } else {
        setError("Login failed");
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <form className="auth-form" onSubmit={handleSubmit}>
      <h2 className="auth-form__title">Log in</h2>
      <p className="auth-form__subtitle">Enter your credentials to continue.</p>

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
        <span>Password</span>
        <input
          name="password"
          type="password"
          value={form.password}
          onChange={handleChange}
          autoComplete="current-password"
          required
        />
      </label>

      {error && <p className="auth-error">{error}</p>}

      <button className="auth-button" type="submit" disabled={loading}>
        {loading ? "Logging in…" : "Log in"}
      </button>

      <p className="auth-switch">
        Don't have an account?{" "}
        <Link className="auth-link" to="/signup">
          Create one
        </Link>
      </p>
    </form>
  );
}
