import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Zap, Mail, Lock, User, Globe, AlertCircle, X } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { supabase } from '../lib/supabase';

const COUNTRIES = [
  "United States", "United Kingdom", "Canada", "Australia", 
  "India", "Germany", "France", "Japan", "Brazil", "Other"
];

export function Signup() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [country, setCountry] = useState('United States');
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [showTerms, setShowTerms] = useState(false);
  
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const navigate = useNavigate();

  const validatePassword = (pass: string) => {
    if (pass.length < 8) return "Password must be at least 8 characters long.";
    if (!/[A-Z]/.test(pass)) return "Password must contain an uppercase letter.";
    if (!/[a-z]/.test(pass)) return "Password must contain a lowercase letter.";
    if (!/[0-9]/.test(pass)) return "Password must contain a number.";
    return null;
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!acceptTerms) {
      return setError("You must accept the terms and conditions.");
    }

    if (password !== confirmPassword) {
      return setError("Passwords do not match.");
    }

    const passwordError = validatePassword(password);
    if (passwordError) {
      return setError(passwordError);
    }

    setLoading(true);

    try {
      const { error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: name,
            country: country,
          }
        }
      });

      if (signUpError) throw signUpError;

      setSuccess(true);
      // Wait a few seconds then navigate to login
      setTimeout(() => {
        navigate('/login');
      }, 3000);

    } catch (err: any) {
      setError(err.message || 'An error occurred during sign up.');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
        <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
          <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100 mb-4">
            <Zap className="h-6 w-6 text-green-600" />
          </div>
          <h2 className="text-3xl font-bold text-slate-900 mb-2">Check your email</h2>
          <p className="text-slate-600">
            We've sent a verification link to <strong>{email}</strong>. 
            Please verify your email address to continue.
          </p>
          <Button className="mt-6" onClick={() => navigate('/login')}>
            Return to Login
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <Link to="/" className="flex items-center justify-center gap-2 mb-8">
          <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center shadow-lg shadow-blue-500/20">
            <Zap className="w-6 h-6 text-white" />
          </div>
          <span className="text-3xl font-bold text-slate-900 tracking-tight">FinPilot</span>
        </Link>
        <h2 className="mt-6 text-center text-3xl font-bold tracking-tight text-slate-900">
          Create your account
        </h2>
        <p className="mt-2 text-center text-sm text-slate-600">
          Already have an account?{' '}
          <Link to="/login" className="font-medium text-primary hover:text-blue-500 transition-colors">
            Sign in here
          </Link>
        </p>
      </div>

      <motion.div 
        className="mt-8 sm:mx-auto sm:w-full sm:max-w-md"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="bg-white py-8 px-4 shadow-xl shadow-slate-200/50 sm:rounded-2xl sm:px-10 border border-slate-100">
          {error && (
            <div className="mb-4 bg-red-50 text-red-600 p-3 rounded-lg text-sm flex items-center gap-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form className="space-y-4" onSubmit={handleSignup}>
            <div>
              <label className="block text-sm font-medium text-slate-700">Full Name</label>
              <div className="mt-1 relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <User className="h-5 w-5 text-slate-400" />
                </div>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="block w-full pl-10 pr-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary sm:text-sm transition-all"
                  placeholder="John Doe"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700">Email address</label>
              <div className="mt-1 relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-slate-400" />
                </div>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="block w-full pl-10 pr-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary sm:text-sm transition-all"
                  placeholder="you@example.com"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700">Country</label>
              <div className="mt-1 relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Globe className="h-5 w-5 text-slate-400" />
                </div>
                <select
                  required
                  value={country}
                  onChange={(e) => setCountry(e.target.value)}
                  className="block w-full pl-10 pr-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary sm:text-sm transition-all bg-white"
                >
                  {COUNTRIES.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700">Password</label>
              <div className="mt-1 relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-slate-400" />
                </div>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="block w-full pl-10 pr-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary sm:text-sm transition-all"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700">Confirm Password</label>
              <div className="mt-1 relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-slate-400" />
                </div>
                <input
                  type="password"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="block w-full pl-10 pr-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary sm:text-sm transition-all"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <div className="flex items-center">
              <input
                id="terms"
                type="checkbox"
                checked={acceptTerms}
                onChange={(e) => setAcceptTerms(e.target.checked)}
                className="h-4 w-4 rounded border-slate-300 text-primary focus:ring-primary"
              />
              <label htmlFor="terms" className="ml-2 block text-sm text-slate-600">
                I accept the{' '}
                <button 
                  type="button" 
                  onClick={() => setShowTerms(true)}
                  className="text-primary hover:underline bg-transparent border-none p-0 cursor-pointer"
                >
                  Terms and Conditions
                </button>
              </label>
            </div>

            <Button type="submit" className="w-full" size="lg" disabled={loading}>
              {loading ? 'Creating Account...' : 'Create Account'}
            </Button>
          </form>
        </div>
      </motion.div>

      {/* Terms and Conditions Modal */}
      <AnimatePresence>
        {showTerms && (
          <>
            <motion.div 
              className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-40"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowTerms(false)}
            />
            <motion.div 
              className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6"
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
            >
              <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl max-h-[85vh] flex flex-col overflow-hidden border border-slate-100">
                <div className="flex items-center justify-between p-6 border-b border-slate-100 bg-slate-50/50">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center shadow-md shadow-blue-500/20">
                      <Zap className="w-6 h-6 text-white" />
                    </div>
                    <h3 className="text-xl font-bold text-slate-900">Terms & Conditions</h3>
                  </div>
                  <button 
                    onClick={() => setShowTerms(false)}
                    className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
                
                <div className="p-6 overflow-y-auto flex-1 bg-white">
                  <div className="prose prose-slate prose-sm sm:prose-base max-w-none">
                    <p className="font-semibold text-slate-900 text-base mb-4">Last Updated: July 2026</p>
                    
                    <h4 className="text-lg font-bold text-slate-900 mt-6 mb-3">1. Acceptance of Terms</h4>
                    <p className="text-slate-600 leading-relaxed mb-4">
                      By accessing and using FinPilot, you agree to be bound by these Terms and Conditions. FinPilot provides an AI-powered financial dashboard to help you manage transactions, budgets, and goals.
                    </p>
                    
                    <h4 className="text-lg font-bold text-slate-900 mt-6 mb-3">2. Data Security & Privacy</h4>
                    <p className="text-slate-600 leading-relaxed mb-4">
                      We take your financial data seriously. All data is encrypted and securely stored. We never sell your personal financial data to third parties. Our AI Advisor processes anonymized data to provide personalized financial insights.
                    </p>
                    
                    <h4 className="text-lg font-bold text-slate-900 mt-6 mb-3">3. User Responsibilities</h4>
                    <p className="text-slate-600 leading-relaxed mb-4">
                      You are responsible for maintaining the confidentiality of your account credentials. You agree to provide accurate financial information and understand that FinPilot's AI advice is for informational purposes only and does not constitute certified financial or legal advice.
                    </p>

                    <h4 className="text-lg font-bold text-slate-900 mt-6 mb-3">4. Limitation of Liability</h4>
                    <p className="text-slate-600 leading-relaxed mb-4">
                      FinPilot shall not be liable for any financial losses or damages resulting from the use of our dashboard or AI-generated recommendations. Always consult a certified financial planner for major financial decisions.
                    </p>
                  </div>
                </div>
                
                <div className="p-6 border-t border-slate-100 bg-slate-50 flex justify-end gap-3">
                  <Button variant="outline" onClick={() => setShowTerms(false)}>
                    Close
                  </Button>
                  <Button onClick={() => {
                    setAcceptTerms(true);
                    setShowTerms(false);
                  }}>
                    I Accept
                  </Button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
