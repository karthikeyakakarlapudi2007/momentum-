import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Flame, Mail, Lock, ArrowRight, Globe } from "lucide-react";
import Button from "../../components/Button";
import "./Login.css";

function Login() {
  const navigate = useNavigate();
  const [isSignUp, setIsSignUp] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    navigate("/dashboard");
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
            {isSignUp ? "Start your journey to better habits today." : "Log in to track your progress and stay consistent."}
          </p>
        </div>

        {/* Tab Buttons to Switch between Login and Signup */}
        <div className="login__tabs flex gap-2 mt-6">
          <button
            type="button"
            className={`login__tab ${!isSignUp ? "active" : ""}`}
            onClick={() => setIsSignUp(false)}
          >
            Log In
          </button>
          <button
            type="button"
            className={`login__tab ${isSignUp ? "active" : ""}`}
            onClick={() => setIsSignUp(true)}
          >
            Sign Up
          </button>
        </div>

        <form className="login__form flex flex-col gap-4 mt-8" onSubmit={handleSubmit}>
          {isSignUp && (
            <div className="login__input-group">
              <label>Full Name</label>
              <input type="text" placeholder="John Doe" required />
            </div>
          )}
          
          <div className="login__input-group">
            <label>Email Address</label>
            <div className="input-wrapper">
              <Mail size={18} className="input-icon" />
              <input type="email" placeholder="name@email.com" required />
            </div>
          </div>

          <div className="login__input-group">
            <label>Password</label>
            <div className="input-wrapper">
              <Lock size={18} className="input-icon" />
              <input type="password" placeholder="••••••••" required />
            </div>
          </div>

          <Button type="submit" variant="primary" size="lg" className="mt-2">
            {isSignUp ? "Create Account" : "Sign In"} <ArrowRight size={18} />
          </Button>
        </form>

        <div className="login__divider text-center my-6">
          <span>Or continue with</span>
        </div>

        <div className="flex justify-center">
          <Button variant="secondary" size="md" className="w-full flex items-center justify-center gap-2">
            <svg viewBox="0 0 24 24" width="18" height="18" xmlns="http://www.w3.org/2000/svg" style={{ flexShrink: 0 }}>
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" fill="#FBBC05"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" fill="#EA4335"/>
            </svg>
            Continue with Google
          </Button>
        </div>

        <div className="login__switch text-center mt-8 text-dim">
          {isSignUp ? "Already have an account?" : "New to Momentum?"}
          <button 
            type="button" 
            onClick={() => setIsSignUp(!isSignUp)}
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
