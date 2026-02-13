import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft,HistoryIcon,Coffee, Cookie, Flame, Droplet, Activity, Lock, Sparkles, Filter, Calendar, ChevronDown, CheckCircle2, Circle, Info } from 'lucide-react';
import axios from 'axios';
import { useUser } from '../context/UserContext';
import clsx from 'clsx';

const getLogIcon = (type) => {
    const t = type.toLowerCase();
    if (t.includes('chai') || t.includes('tea') || t.includes('coffee')) return <Coffee className="w-5 h-5" />;
    if (t.includes('sweet') || t.includes('cookie') || t.includes('chocolate') || t.includes('cake')) return <Cookie className="w-5 h-5" />;
    if (t.includes('exercise') || t.includes('walk') || t.includes('run')) return <Flame className="w-5 h-5" />;
    if (t.includes('water') || t.includes('drink')) return <Droplet className="w-5 h-5" />;
    return <Activity className="w-5 h-5" />;
};

const HistoryItem = ({ log, index }) => {
    const [isExpanded, setIsExpanded] = useState(false);

    return (
        <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            className="group"
        >
            <div 
                onClick={() => setIsExpanded(!isExpanded)}
                className={clsx(
                    "bg-zinc-900/40 border transition-all cursor-pointer overflow-hidden rounded-[2rem]",
                    isExpanded ? "border-purple-500/50 bg-zinc-900/60 shadow-lg shadow-purple-500/5" : "border-zinc-800/50 hover:border-zinc-700 hover:bg-zinc-900/60"
                )}
            >
                <div className="p-5 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <div className={clsx(
                            "w-12 h-12 rounded-2xl flex items-center justify-center shadow-lg transition-transform group-hover:scale-110",
                            log.type.toLowerCase().includes('log') ? "bg-zinc-800 text-zinc-400" : "bg-purple-500/20 text-purple-400"
                        )}>
                            {getLogIcon(log.type)}
                        </div>
                        <div className="space-y-1">
                            <h4 className="font-bold text-sm text-zinc-100 capitalize">
                                {log.type.toLowerCase().includes('log') ? log.type : `${log.type} Spike`}
                            </h4>
                            <div className="flex items-center gap-3 text-[10px] text-zinc-500 font-bold uppercase tracking-widest">
                                <span className="flex items-center gap-1">
                                    <Calendar className="w-3 h-3" />
                                    {new Date(log.createdAt).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                                </span>
                                <span>•</span>
                                <span>{new Date(log.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center gap-4">
                        <div className="text-right hidden sm:block">
                            <div className="text-[10px] font-black italic text-zinc-500 group-hover:text-zinc-400 transition-colors uppercase tracking-widest">
                                Level {log.intensity || 3}
                            </div>
                            <div className="h-1 w-12 bg-zinc-800 rounded-full mt-1 overflow-hidden">
                                <motion.div 
                                    initial={{ width: 0 }}
                                    animate={{ width: `${(log.intensity || 3) * 20}%` }}
                                    className="h-full bg-purple-500"
                                />
                            </div>
                        </div>
                        <ChevronDown className={clsx("w-5 h-5 text-zinc-600 transition-transform duration-300", isExpanded && "rotate-180 text-purple-400")} />
                    </div>
                </div>

                <AnimatePresence>
                    {isExpanded && (
                        <motion.div 
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            className="bg-zinc-950/30 border-t border-zinc-800/50"
                        >
                            <div className="p-6 space-y-6">
                                {/* Insight Block */}
                                <div className="space-y-3">
                                    <div className="flex items-center gap-2 text-purple-400 text-[10px] font-black uppercase tracking-widest">
                                        <Info className="w-3 h-3" />
                                        <span>AI Analysis</span>
                                    </div>
                                    <p className="text-sm text-zinc-200 leading-relaxed italic pr-4">
                                        "{log.insight || "Metabolic tracking active for this session."}"
                                    </p>
                                </div>

                                {/* Action Block */}
                                {log.action && (
                                    <div className="space-y-4 pt-2">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-2 text-blue-400 text-[10px] font-black uppercase tracking-widest">
                                                <Sparkles className="w-3 h-3" />
                                                <span>Corrective Action</span>
                                            </div>
                                            <div className={clsx(
                                                "flex items-center gap-1.5 px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-tighter",
                                                log.actionCompleted ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" : "bg-zinc-800 text-zinc-500"
                                            )}>
                                                {log.actionCompleted ? (
                                                    <><CheckCircle2 className="w-3 h-3" /> Completed</>
                                                ) : (
                                                    <><Circle className="w-3 h-3" /> Pending</>
                                                )}
                                            </div>
                                        </div>
                                        <div className="bg-zinc-900/80 border border-zinc-800 p-4 rounded-2xl flex items-center justify-between group/action">
                                            <p className="text-xs text-zinc-300">{log.action}</p>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </motion.div>
    );
};

const History = () => {
  const navigate = useNavigate();
  const { user, API_URL } = useUser();
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAllLogs = async () => {
      if (!user?.deviceId) return;
      try {
        const res = await axios.get(`${API_URL}/logs/${user.deviceId}`);
        setLogs(res.data);
      } catch (error) {
        console.error("Fetch all logs error:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchAllLogs();
  }, [user, API_URL]);

  if (!user?.email) {
    return (
      <div className="min-h-screen bg-zinc-950 text-white flex flex-col items-center justify-center p-6 text-center space-y-6">
        <div className="w-24 h-24 bg-zinc-900 border border-zinc-800 rounded-full flex items-center justify-center relative shadow-2xl overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-tr from-purple-500/20 to-blue-500/20 opacity-0 group-hover:opacity-100 transition-opacity" />
            <Lock className="w-10 h-10 text-zinc-500 group-hover:text-purple-400 transition-colors" />
        </div>
        <div className="space-y-2">
            <h2 className="text-2xl font-black italic">History is Locked</h2>
            <p className="text-zinc-400 text-sm max-w-xs leading-relaxed">
                Full activity tracking and health trends are exclusive features for upgraded accounts.
            </p>
        </div>
        <button 
          onClick={() => navigate('/account')}
          className="bg-white text-black font-black px-10 py-4 rounded-2xl hover:bg-zinc-200 transition-all flex items-center gap-2 group shadow-xl shadow-white/5"
        >
          <Sparkles className="w-5 h-5" />
          Upgrade to Unlock
        </button>
        <button 
          onClick={() => navigate('/')}
          className="text-zinc-500 hover:text-white text-sm font-medium transition-colors"
        >
          Back to Dashboard
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-white p-6 font-sans">
      <div className="max-w-xl mx-auto space-y-8 pb-12">
        {/* Header */}
        <div className="flex items-center justify-between">
            <button 
                onClick={() => navigate('/')}
                className="p-3 bg-zinc-900 border border-zinc-800 rounded-2xl hover:bg-zinc-800 transition-colors"
            >
                <ArrowLeft className="w-5 h-5" />
            </button>
            <div className="flex items-center gap-2 text-zinc-100 font-black italic text-xl">
                <HistoryIcon className="w-6 h-6 text-purple-500" />
                <span>Journal</span>
            </div>
            <div className="w-11" />
        </div>

        {/* Dynamic Stats View */}
        <div className="grid grid-cols-2 gap-4">
             <div className="bg-gradient-to-br from-zinc-900 to-zinc-950 border border-zinc-800 p-6 rounded-[2.5rem] space-y-1 relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                    <Activity className="w-12 h-12" />
                </div>
                <p className="text-[10px] font-black text-zinc-500 tracking-widest uppercase">Total Activity</p>
                <div className="flex items-baseline gap-1">
                    <p className="text-3xl font-black italic text-zinc-200">{logs.length}</p>
                    <p className="text-[10px] font-bold text-zinc-600">LOGS</p>
                </div>
            </div>
            <div className="bg-gradient-to-br from-zinc-900 to-zinc-950 border border-zinc-800 p-6 rounded-[2.5rem] space-y-1 relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                    <Sparkles className="w-12 h-12" />
                </div>
                <p className="text-[10px] font-black text-zinc-500 tracking-widest uppercase">Current XP</p>
                <div className="flex items-baseline gap-1">
                    <p className="text-3xl font-black italic text-orange-500">{user.points}</p>
                    <p className="text-[10px] font-bold text-zinc-600">XP</p>
                </div>
            </div>
        </div>

        {/* Scrollable Journal Section */}
        <div className="space-y-4">
            <div className="flex items-center justify-between px-2">
                <h3 className="text-xs font-black uppercase tracking-[0.2em] text-zinc-600">Recent Activity</h3>
                <Filter className="w-4 h-4 text-zinc-700" />
            </div>

            {loading ? (
                <div className="text-center py-24 text-zinc-600 italic animate-pulse">Scanning neural patterns...</div>
            ) : logs.length === 0 ? (
                <div className="bg-zinc-900/20 border border-dashed border-zinc-800 rounded-[2.5rem] py-24 text-center px-6 space-y-4">
                    <HistoryIcon className="w-12 h-12 text-zinc-800 mx-auto" />
                    <div className="space-y-1">
                        <p className="text-zinc-500 font-bold italic">No data synced yet.</p>
                        <p className="text-[10px] text-zinc-600 uppercase tracking-widest">Start logging to see history</p>
                    </div>
                </div>
            ) : (
                <div className="space-y-3">
                    {logs.map((log, i) => (
                        <HistoryItem key={log._id} log={log} index={i} />
                    ))}
                </div>
            )}
        </div>
      </div>
    </div>
  );
};

export default History;
