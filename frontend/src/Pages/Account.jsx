import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Mail, Lock, Sparkles, Wand2, ShieldCheck, ArrowLeft, Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useUser } from '../context/UserContext';
import toast from 'react-hot-toast';

const Account = () => {
  const navigate = useNavigate();
  const { user, upgradeUser, loginUser } = useUser();
  const [isLogin, setIsLogin] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({ email: '', password: '' });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (isLogin) {
        await loginUser(formData.email, formData.password);
        toast.success("Welcome back!");
      } else {
        await upgradeUser(formData.email, formData.password);
        toast.success("Account upgraded successfully!");
      }
      navigate('/');
    } catch (error) {
      toast.error(error.response?.data?.message || "Authentication error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-white p-6 font-sans selection:bg-purple-500/30">
      <div className="max-w-md mx-auto space-y-8 pt-12">
        {/* Back Button */}
        <button 
          onClick={() => navigate('/')}
          className="flex items-center gap-2 text-zinc-500 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span className="text-sm">Back to Dashboard</span>
        </button>

        <div className="text-center space-y-4">
          <div className="w-20 h-20 bg-gradient-to-tr from-purple-500 to-blue-500 rounded-3xl flex items-center justify-center mx-auto shadow-2xl shadow-purple-500/20 rotate-6 group transition-transform hover:rotate-0">
            <Sparkles className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-4xl font-black tracking-tight italic">
            {isLogin ? "Welcome Back" : "Unlock Your Experience"}
          </h1>
          <p className="text-zinc-400 text-sm max-w-xs mx-auto">
            {isLogin 
              ? "Sign in to access your logs and streaks across all your devices." 
              : "Upgrade now to get deeper insights, secure your history, and earn exclusive rewards."}
          </p>
        </div>

        {/* Feature Highlights */}
        {!isLogin && (
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-zinc-900/50 border border-zinc-800 p-4 rounded-2xl space-y-2">
              <Wand2 className="w-5 h-5 text-purple-400" />
              <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Personalized AI</p>
              <p className="text-[11px] text-zinc-400 leading-tight">Complex behavior analysis and specific advice.</p>
            </div>
            <div className="bg-zinc-900/50 border border-zinc-800 p-4 rounded-2xl space-y-2">
              <ShieldCheck className="w-5 h-5 text-blue-400" />
              <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Secure History</p>
              <p className="text-[11px] text-zinc-400 leading-tight">Your data, synced securely across devices.</p>
            </div>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-xs font-bold text-zinc-500 uppercase tracking-widest ml-1">Email Address</label>
              <div className="relative group">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500 group-focus-within:text-purple-400 transition-colors" />
                <input
                  required
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-2xl py-4 pl-12 pr-4 focus:outline-none focus:border-purple-500/50 transition-all text-sm group-hover:bg-zinc-850"
                  placeholder="name@example.com"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-zinc-500 uppercase tracking-widest ml-1">Password</label>
              <div className="relative group">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500 group-focus-within:text-purple-400 transition-colors" />
                <input
                  required
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-2xl py-4 pl-12 pr-4 focus:outline-none focus:border-purple-500/50 transition-all text-sm group-hover:bg-zinc-850"
                  placeholder="••••••••"
                />
              </div>
            </div>
          </div>

          <button
            disabled={loading}
            type="submit"
            className="w-full bg-white text-black font-black py-4 rounded-2xl hover:bg-zinc-200 active:scale-[0.98] transition-all flex items-center justify-center gap-2 shadow-xl shadow-white/5"
          >
            {loading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <span>{isLogin ? "Sign In" : "Unlock Now"}</span>
            )}
          </button>
        </form>

        <div className="text-center">
          <button 
            onClick={() => setIsLogin(!isLogin)}
            className="text-zinc-500 hover:text-white transition-colors text-sm font-medium"
          >
            {isLogin ? "Don't have an account? Upgrade now" : "Already have an account? Sign in"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Account;
