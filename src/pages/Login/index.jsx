import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { Flame, Mail, Lock, User, ArrowRight, Loader2, AlertCircle } from "lucide-react";
import Button from "../../components/Button";
import GoogleButton from "../../components/GoogleButton";
import { useAuth } from "../../context/AuthContext";
import { useToast } from "../../context/ToastContext";
import "./Login.css";

function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, register, loginWithGoogle } = useAuth();
  const toast = useToast();

  const [isSignUp, setIsSignUp] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // Where to send the user after auth — back to where they were headed, or dashboard.
  const redirectTo = location.state?.from?.pathname || "/dashboard";

  const switchMode = (signUp) => {
    setIsSignUp(signUp);
    setError("");
  };

  const validate = () => {
    if (isSignUp && !name.trim()) return "Please enter your name.";
    if (!email.trim()) return "Please enter your email.";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim()))
      return "Please enter a valid email address.";
    if (!password) return "Please enter your password.";
    if (password.length < 6) return "Password must be at least 6 characters.";
    return "";
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const validationError = validate();
    if (validationError) {
      setError(validationError);
      return;
    }

    setSubmitting(true);
    setError("");
    try {
      if (isSignUp) {
        const user = await register({ name: name.trim(), email: email.trim(), password });
        toast.success(`Welcome to Momentum, ${user.name}!`);
      } else {
        const user = await login({ email: email.trim(), password });
        toast.success(`Welcome back, ${user.name}!`);
      }
      navigate(redirectTo, { replace: true });
    } catch (err) {
      setError(err?.message || "Something went wrong. Please try again.");
      setSubmitting(false);
    }
  };

  const handleGoogleLogin = async () => {
    setSubmitting(true);
    setError("");
    try {
      const authUser = await loginWithGoogle();
      toast.success(`Welcome to Momentum, ${authUser.name}!`);
      navigate(redirectTo, { replace: true });
    } catch (err) {
      if (err.code !== "auth/popup-closed-by-user") {
        setError(err?.message || "Google sign in failed. Please try again.");
      }
      setSubmitting(false);
    }
  };

  return (
    <div className="login flex items-center justify-center">
      <div className="login__glow"></div>

      <div className="login__card animate-fade-in">
        <div className="login__header text-center">
          <div className="login__logo flex items-center justify-center mb-6">
            <div className="landing__logo-wrapper">
              <Flame size={24} className="primary-glow" />
            </div>
          </div>
          <h1 className="login__title">{isSignUp ? "Join Momentum" : "Welcome Back"}</h1>
          <p className="login__subtitle">
            {isSignUp
              ? "Start your journey to better habits today."
              : "Log in to track your progress and stay consistent."}
          </p>
        </div>

        {/* Tab Buttons to Switch between Login and Signup */}
        <div className="login__tabs flex gap-2 mt-6">
          <button
            type="button"
            className={`login__tab ${!isSignUp ? "active" : ""}`}
            onClick={() => switchMode(false)}
          >
            Log In
          </button>
          <button
            type="button"
            className={`login__tab ${isSignUp ? "active" : ""}`}
            onClick={() => switchMode(true)}
          >
            Sign Up
          </button>
        </div>

        <form className="login__form flex flex-col gap-4 mt-8" onSubmit={handleSubmit} noValidate>
          {isSignUp && (
            <div className="login__input-group">
              <label htmlFor="login-name">Full Name</label>
              <div className="input-wrapper">
                <User size={18} className="input-icon" />
                <input
                  id="login-name"
                  type="text"
                  placeholder="John Doe"
                  value={name}
                  autoComplete="name"
                  onChange={(e) => setName(e.target.value)}
                />
              </div>
            </div>
          )}

          <div className="login__input-group">
            <label htmlFor="login-email">Email Address</label>
            <div className="input-wrapper">
              <Mail size={18} className="input-icon" />
              <input
                id="login-email"
                type="email"
                placeholder="name@email.com"
                value={email}
                autoComplete="email"
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
          </div>

          <div className="login__input-group">
            <label htmlFor="login-password">Password</label>
            <div className="input-wrapper">
              <Lock size={18} className="input-icon" />
              <input
                id="login-password"
                type="password"
                placeholder="••••••••"
                value={password}
                autoComplete={isSignUp ? "new-password" : "current-password"}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>

          {error && (
            <div className="login__error" role="alert">
              <AlertCircle size={16} />
              <span>{error}</span>
            </div>
          )}

          <Button
            type="submit"
            variant="primary"
            size="lg"
            className="mt-2"
            disabled={submitting}
            aria-disabled={submitting}
          >
            {submitting ? (
              <>
                <Loader2 size={18} className="spin" /> {isSignUp ? "Creating account…" : "Signing in…"}
              </>
            ) : (
              <>
                {isSignUp ? "Create Account" : "Sign In"} <ArrowRight size={18} />
              </>
            )}
          </Button>
        </form>

        <div className="login__divider my-6 text-center">
          <span>or</span>
        </div>

        <GoogleButton
          onClick={handleGoogleLogin}
          isLoading={submitting}
          disabled={submitting}
        />

        <div className="login__switch text-center mt-8 text-dim">
          {isSignUp ? "Already have an account?" : "New to Momentum?"}
          <button
            type="button"
            onClick={() => switchMode(!isSignUp)}
            className="text-primary ml-2 hover-white font-semibold"
          >
            {isSignUp ? "Log In" : "Sign Up for Free"}
          </button>
        </div>

        <Link to="/" className="login__footer-link text-center block mt-6 text-xs text-dim hover:text-white transition-colors">
          ← Back to Landing
        </Link>
      </div>
    </div>
  );
}

export default Login;
