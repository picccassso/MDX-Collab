import { useState, type FormEvent } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { useAuthStore } from "../stores/auth.store";
import type { AuthMode } from "../types/auth";

export default function Auth() {
  const [mode, setMode] = useState<AuthMode>("login");
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const { signIn, signUp, signInWithGoogle, user } = useAuthStore();
  const navigate = useNavigate();

  if (user) return <Navigate to="/" replace />;

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");

    if (mode === "register" && password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    setLoading(true);
    try {
      if (mode === "login") {
        await signIn(email, password);
      } else {
        await signUp(email, password, username);
      }
      navigate("/");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Authentication failed");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogle = async () => {
    setError("");
    setLoading(true);
    try {
      await signInWithGoogle();
      navigate("/");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Google sign-in failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="login-box">
        <div className="login-logo">
          <div className="shield" style={{ width: 34, height: 38 }}>
            <div className="shield-text" style={{ fontSize: 14 }}>M</div>
          </div>
          <div className="login-logo-text">
            MDX <span>Collab</span>
          </div>
        </div>

        <p className="login-tagline">
          Your collaboration hub for students. Connect, build, and ship projects together.
        </p>

        {error && <div className="auth-error">{error}</div>}

        <form onSubmit={handleSubmit}>
          {mode === "register" && (
            <div className="input-group">
              <label htmlFor="username">Username</label>
              <input
                id="username"
                type="text"
                placeholder="Your display name"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
              />
            </div>
          )}

          <div className="input-group">
            <label htmlFor="email">Student Email</label>
            <input
              id="email"
              type="email"
              placeholder="m.student@mdx.ac.uk"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="input-group">
            <label htmlFor="password">Password</label>
            <input
              id="password"
              type="password"
              placeholder="********"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          {mode === "register" && (
            <div className="input-group">
              <label htmlFor="confirm-password">Confirm Password</label>
              <input
                id="confirm-password"
                type="password"
                placeholder="********"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />
            </div>
          )}

          <button className="btn-primary" type="submit" disabled={loading}>
            {loading ? "Please wait..." : mode === "login" ? "Sign In" : "Create Account"}
          </button>
        </form>

        <div className="divider">or</div>

        <button className="btn-ghost" type="button" disabled={loading} onClick={handleGoogle}>
          Continue with Google
        </button>

        <div style={{ marginTop: 8 }}>
          <button className="btn-sm outline" type="button" onClick={() => navigate("/")}>
            Continue as Guest
          </button>
        </div>

        <div className="login-footer">
          {mode === "login" ? (
            <>
              No account?{" "}
              <button className="link-btn" type="button" onClick={() => setMode("register")}>
                Sign up with student email
              </button>
            </>
          ) : (
            <>
              Already signed up?{" "}
              <button className="link-btn" type="button" onClick={() => setMode("login")}>
                Back to sign in
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
