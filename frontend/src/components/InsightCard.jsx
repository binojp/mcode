import React from 'react';
import { motion } from 'framer-motion';
import { Lightbulb, ArrowRight } from 'lucide-react';
import clsx from 'clsx';

const InsightCard = ({ insight, action, onClose }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 w-full max-w-sm shadow-xl relative overflow-hidden"
    >
      <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-purple-500 to-blue-500" />
      
      <div className="flex items-start space-x-4">
        <div className="bg-purple-500/10 p-3 rounded-full">
            <Lightbulb className="w-6 h-6 text-purple-400" />
        </div>
        <div className="flex-1">
            <h3 className="text-zinc-100 font-semibold text-lg mb-1">Insight</h3>
            <p className="text-zinc-400 text-sm leading-relaxed mb-4">
                {insight}
            </p>
            
            <div className="bg-zinc-800/50 rounded-xl p-3 border border-zinc-700/50">
                <div className="flex items-center text-blue-400 text-xs font-bold uppercase tracking-wider mb-1">
                    <ArrowRight className="w-3 h-3 mr-1" />
                    Recommended Action
                </div>
                <p className="text-zinc-300 text-sm font-medium">
                    {action}
                </p>
            </div>
        </div>
      </div>
      
      {onClose && (
        <button 
            onClick={onClose}
            className="mt-4 w-full py-2 text-zinc-500 text-sm hover:text-white transition-colors"
        >
            Dismiss
        </button>
      )}
    </motion.div>
  );
};

export default InsightCard;
