import { Link } from "react-router-dom";
import { ArrowRight, Flame, Target, TrendingUp, Zap, Shield, Sparkles } from "lucide-react";
import Button from "../components/Button";
import "../styles/landing.css";

function Landing() {
  return (
    <div className="landing">
      {/* Dynamic Background */}
      <div className="landing__glow-top"></div>
      <div className="landing__glow-bottom"></div>

      {/* Navigation */}
      <header className="landing__header animate-fade-in">
        <div className="container flex items-center justify-between">
          <div className="landing__brand flex items-center gap-2">
            <div className="landing__logo-wrapper">
              <Flame size={24} className="landing__brand-icon" />
            </div>
            <span className="landing__brand-text">Momentum</span>
          </div>
          <nav className="landing__nav flex items-center gap-6">
            <Link to="/features" className="landing__nav-link">Features</Link>
            <Link to="/pricing" className="landing__nav-link">Pricing</Link>
            <div className="flex items-center gap-3">
              <Link to="/login" className="landing__nav-link">Log in</Link>
              <Link to="/login">
                <Button variant="primary" size="sm">Start Tracking</Button>
              </Link>
            </div>
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <main className="landing__hero flex flex-col items-center text-center">
        <div className="container">
          <div className="landing__hero-badge animate-fade-in" style={{ animationDelay: '0.1s' }}>
            <Sparkles size={14} />
            <span>New: AI-Powered Insights</span>
          </div>
          
          <h1 className="landing__title animate-fade-in" style={{ animationDelay: '0.2s' }}>
            Master your habits.<br />
            <span className="text-gradient">Build your momentum.</span>
          </h1>
          
          <p className="landing__subtitle animate-fade-in" style={{ animationDelay: '0.3s' }}>
            A premium habit tracker designed for those who seek consistent growth. 
            Beautiful visuals, actionable data, and zero distractions.
          </p>
          
          <div className="landing__cta animate-fade-in" style={{ animationDelay: '0.4s' }}>
            <Link to="/login">
              <Button variant="primary" size="lg" className="landing__main-btn">
                Get Started for Free <ArrowRight size={20} />
              </Button>
            </Link>
          </div>

          {/* Feature Grid Mini */}
          <div className="landing__feature-grid animate-fade-in" style={{ animationDelay: '0.6s' }}>
            <div className="landing__card">
              <div className="landing__card-icon blue"><Target size={24} /></div>
              <h3>Precision Tracking</h3>
              <p>Daily goals with flexible weekly targets.</p>
            </div>
            <div className="landing__card">
              <div className="landing__card-icon purple"><TrendingUp size={24} /></div>
              <h3>Deep Analytics</h3>
              <p>Visualize your progress with stunning charts.</p>
            </div>
            <div className="landing__card">
              <div className="landing__card-icon cyan"><Shield size={24} /></div>
              <h3>Privacy First</h3>
              <p>Your data is yours. Secure and encrypted.</p>
            </div>
          </div>
        </div>
      </main>

      <footer className="landing__footer">
        <div className="container flex items-center justify-between">
          <p className="text-dim">&copy; {new Date().getFullYear()} Momentum. Built for peak performance.</p>
          <div className="flex gap-4">
            <span className="text-dim hover-white">Terms</span>
            <span className="text-dim hover-white">Privacy</span>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default Landing;
