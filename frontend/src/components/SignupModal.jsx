import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Sparkles, Wand2, ShieldCheck, Mail, Lock, Loader2 } from 'lucide-react';
import { useUser } from '../context/UserContext';
import toast from 'react-hot-toast';

const SignupModal = ({ isOpen, onClose }) => {
  const { upgradeUser } = useUser();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await upgradeUser(formData.email, formData.password);
      toast.success("Account upgraded successfully!");
      onClose();
    } catch (error) {
      toast.error(error.response?.data?.message || "Error upgrading account");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/80 backdrop-blur-sm"
          />
          
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="relative w-full max-w-sm bg-zinc-900 border border-zinc-800 rounded-3xl p-8 shadow-2xl overflow-hidden"
          >
            {/* Background Glow */}
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500" />
            <div className="absolute -top-24 -right-24 w-48 h-48 bg-purple-500/10 rounded-full blur-3xl" />
            
            <button
                onClick={onClose}
                className="absolute top-4 right-4 p-2 text-zinc-500 hover:text-white transition-colors"
            >
                <X className="w-5 h-5" />
            </button>

            <div className="text-center space-y-4 mb-8">
              <div className="w-16 h-16 bg-gradient-to-tr from-purple-500 to-blue-500 rounded-2xl flex items-center justify-center mx-auto shadow-lg shadow-purple-500/20 rotate-3">
                <Sparkles className="w-8 h-8 text-white" />
              </div>
              <h2 className="text-2xl font-bold tracking-tight">Upgrade Your Experience</h2>
              <p className="text-zinc-400 text-sm">
                Unlock deeper insights, persistent history, and advanced personalization.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <label className="text-xs font-bold text-zinc-500 uppercase tracking-widest ml-1">Email</label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                  <input
                    required
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full bg-zinc-800 border border-zinc-700/50 rounded-2xl py-3 pl-12 pr-4 focus:outline-none focus:border-purple-500/50 transition-colors text-sm"
                    placeholder="name@example.com"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-zinc-500 uppercase tracking-widest ml-1">Password</label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                  <input
                    required
                    type="password"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    className="w-full bg-zinc-800 border border-zinc-700/50 rounded-2xl py-3 pl-12 pr-4 focus:outline-none focus:border-purple-500/50 transition-colors text-sm"
                    placeholder="••••••••"
                  />
                </div>
              </div>

              <button
                disabled={loading}
                type="submit"
                className="w-full bg-white text-black font-bold py-3 rounded-2xl hover:scale-[1.02] active:scale-[0.98] transition-all relative overflow-hidden group mt-4"
              >
                {loading ? (
                    <Loader2 className="w-5 h-5 animate-spin mx-auto text-black" />
                ) : (
                    "Upgrade Now"
                )}
              </button>
            </form>

            <div className="mt-8 grid grid-cols-2 gap-4">
                <div className="flex items-center gap-2 text-[10px] text-zinc-500">
                    <Wand2 className="w-3 h-3 text-purple-400" />
                    <span>Personalized Insights</span>
                </div>
                <div className="flex items-center gap-2 text-[10px] text-zinc-500">
                    <ShieldCheck className="w-3 h-3 text-blue-400" />
                    <span>Secure Storage</span>
                </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default SignupModal;
