import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Flame, Mail, Lock, ArrowRight, Globe } from "lucide-react";
import Button from "../components/Button";
import "../styles/login.css";

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

        <div className="flex gap-4">
          <Button variant="secondary" size="md" className="flex-1">
            <Globe size={18} /> Github
          </Button>
          <Button variant="secondary" size="md" className="flex-1">
             Google
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
