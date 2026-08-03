import toast from 'react-hot-toast';
import { motion } from 'framer-motion';
import { ArrowRight, BarChart3, PieChart, Shield, Sparkles, Target, Zap } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { Link } from 'react-router-dom';

const fadeIn = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.5 }
};

const staggerContainer = {
  animate: {
    transition: {
      staggerChildren: 0.1
    }
  }
};

export function LandingPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Navbar */}
      <nav className="fixed top-0 w-full bg-white/80 backdrop-blur-md z-50 border-b border-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
              <Zap className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold text-slate-900">FinPilot</span>
          </div>
          <div className="flex items-center gap-4">
            <Link to="/login" className="text-sm font-medium text-slate-600 hover:text-slate-900">Sign In</Link>
            <Link to="/signup">
              <Button onClick={() => toast.success('Feature coming soon!', { icon: '🚧' })}  size="sm">Get Started</Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="pt-32 pb-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <motion.div 
          className="text-center max-w-3xl mx-auto mb-20"
          initial="initial"
          animate="animate"
          variants={staggerContainer}
        >
          <motion.div variants={fadeIn} className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 text-primary text-sm font-medium mb-6">
            <Sparkles className="w-4 h-4" />
            <span>AI-Powered Financial Assistant</span>
          </motion.div>
          <motion.h1 variants={fadeIn} className="text-5xl md:text-7xl font-bold tracking-tight text-slate-900 mb-6 leading-tight">
            Take Control of Your <br/>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-accent">Financial Future</span>
          </motion.h1>
          <motion.p variants={fadeIn} className="text-lg md:text-xl text-slate-600 mb-10 max-w-2xl mx-auto">
            Manage your money smarter with AI-powered insights, intelligent budgeting, savings tracking, and advanced analytics all in one beautiful dashboard.
          </motion.p>
          <motion.div variants={fadeIn} className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link to="/signup">
              <Button onClick={() => toast.success('Feature coming soon!', { icon: '🚧' })}  size="lg" className="w-full sm:w-auto gap-2">
                Start for Free <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
            <Button onClick={() => toast.success('Feature coming soon!', { icon: '🚧' })}  size="lg" variant="outline" className="w-full sm:w-auto">
              View Demo
            </Button>
          </motion.div>
        </motion.div>

        {/* Features Grid */}
        <motion.div 
          className="grid md:grid-cols-3 gap-8 py-12"
          initial="initial"
          whileInView="animate"
          viewport={{ once: true }}
          variants={staggerContainer}
        >
          <motion.div variants={fadeIn}>
            <Card className="h-full border-none shadow-sm hover:shadow-xl transition-all duration-300 group">
              <CardHeader>
                <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <BarChart3 className="w-6 h-6 text-primary" />
                </div>
                <CardTitle>Intelligent Analytics</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-slate-600 leading-relaxed">
                  Visualize your spending patterns with beautiful interactive charts. Understand exactly where your money goes every month.
                </p>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div variants={fadeIn}>
            <Card className="h-full border-none shadow-sm hover:shadow-xl transition-all duration-300 group">
              <CardHeader>
                <div className="w-12 h-12 rounded-xl bg-emerald-50 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <Target className="w-6 h-6 text-accent" />
                </div>
                <CardTitle>Smart Budgeting</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-slate-600 leading-relaxed">
                  Set automatic budgets by category. Get notified before you overspend and track your progress towards financial goals.
                </p>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div variants={fadeIn}>
            <Card className="h-full border-none shadow-sm hover:shadow-xl transition-all duration-300 group">
              <CardHeader>
                <div className="w-12 h-12 rounded-xl bg-purple-50 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <PieChart className="w-6 h-6 text-purple-600" />
                </div>
                <CardTitle>AI Financial Advisor</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-slate-600 leading-relaxed">
                  Ask questions about your finances in plain English. Get personalized advice on how to save more and spend smarter.
                </p>
              </CardContent>
            </Card>
          </motion.div>
        </motion.div>

        {/* Trust Section */}
        <motion.div 
          className="mt-20 text-center pb-20"
          initial="initial"
          whileInView="animate"
          viewport={{ once: true }}
          variants={fadeIn}
        >
          <div className="inline-flex items-center justify-center p-4 rounded-full bg-slate-50 mb-6">
            <Shield className="w-8 h-8 text-slate-400" />
          </div>
          <h2 className="text-2xl font-semibold text-slate-900 mb-4">Bank-Level Security</h2>
          <p className="text-slate-600 max-w-xl mx-auto">
            Your financial data is encrypted and stored securely. We never sell your data and use industry-standard security protocols.
          </p>
        </motion.div>
      </main>
    </div>
  );
}
