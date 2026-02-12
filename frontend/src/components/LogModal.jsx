import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, Star, X } from 'lucide-react';
import InsightCard from './InsightCard';
import confetti from 'canvas-confetti';

const LogModal = ({ isOpen, onClose, data }) => {
  useEffect(() => {
    if (isOpen && data) {
      // Trigger confetti
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#a855f7', '#3b82f6', '#ffffff']
      });
      // Play sound (simulated with console for now as browser policies block auto-audio often, 
      // but in real app we'd use new Audio('/success.mp3').play())
    }
  }, [isOpen, data]);

  if (!isOpen) return null;

  return (
    <AnimatePresence>
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50"
            onClick={onClose}
        >
            <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className="bg-black border border-zinc-800 rounded-3xl p-1 max-w-sm w-full relative"
                onClick={e => e.stopPropagation()}
            >
                <div className="bg-zinc-900 rounded-[22px] p-6 flex flex-col items-center text-center overflow-hidden relative">
                    {/* Close button */}
                    <button onClick={onClose} className="absolute top-4 right-4 text-zinc-500 hover:text-white">
                        <X className="w-5 h-5" />
                    </button>

                    <div className="w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center mb-4 ring-4 ring-green-500/10">
                        <Check className="w-10 h-10 text-green-400" />
                    </div>

                    <h2 className="text-2xl font-bold text-white mb-2">Logged!</h2>
                    <p className="text-zinc-400 text-sm mb-6">
                        You earned <span className="text-yellow-400 font-bold">+{data?.pointsEarned || 0} XP</span>
                    </p>

                    {/* Streak Info */}
                    <div className="flex items-center gap-2 bg-zinc-800 px-4 py-2 rounded-full mb-6 relative">
                        <Star className="w-4 h-4 text-orange-500 fill-orange-500" />
                        <span className="text-sm font-bold text-orange-400">
                            {data?.streak} Day Streak
                        </span>
                        
                        {/* Surprise Bonus Badge */}
                        {data?.surpriseBonus > 0 && (
                            <motion.div 
                                initial={{ scale: 0, rotate: -20 }}
                                animate={{ scale: 1, rotate: 10 }}
                                className="absolute -top-4 -right-8 bg-gradient-to-r from-pink-500 to-purple-500 text-white text-[10px] font-bold px-2 py-1 rounded-md shadow-lg border-2 border-white transform rotate-12"
                            >
                                +{data.surpriseBonus} BONUS!
                            </motion.div>
                        )}
                    </div>

                    {/* Insight */}
                    <div className="w-full text-left">
                        <InsightCard 
                            insight={data?.insight} 
                            action={data?.action} 
                        />
                    </div>

                    <button 
                        onClick={onClose}
                        className="w-full bg-white text-black font-bold py-3 rounded-xl mt-6 hover:scale-105 transition-transform"
                    >
                        Awesome
                    </button>
                </div>
            </motion.div>
        </motion.div>
    </AnimatePresence>
  );
};

export default LogModal;
