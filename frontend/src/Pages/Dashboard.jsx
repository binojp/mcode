import React, { useState } from 'react';
import { useUser } from '../context/UserContext';
import { motion } from 'framer-motion';
import { Flame, Droplet, Coffee, Cookie, Zap, Trophy, History, Camera, Sparkles } from 'lucide-react';
import axios from 'axios';
import LogModal from '../components/LogModal';
import clsx from 'clsx';
import toast from 'react-hot-toast';

import VoiceLogger from '../components/VoiceLogger';
import SignupModal from '../components/SignupModal';

const Dashboard = () => {
  const { user, API_URL, refreshUser } = useUser();
  const [loading, setLoading] = useState(false);
  const [modalData, setModalData] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSignupModalOpen, setIsSignupModalOpen] = useState(false);
  const [logs, setLogs] = useState([]);
  const [healthData, setHealthData] = useState({ steps: 0, sleep: 0, hr: 0, isSyncing: false });

  // Passive Sync Simulation
  const simulateSync = () => {
    setHealthData(prev => ({ ...prev, isSyncing: true }));
    setTimeout(() => {
        setHealthData({
            steps: Math.floor(Math.random() * 8000) + 2000,
            sleep: (Math.random() * 3 + 5).toFixed(1), // 5-8 hours
            hr: Math.floor(Math.random() * 20) + 65, // 65-85 bpm
            isSyncing: false,
            lastSync: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        });
        toast.success("Health Data Synced!");
    }, 2000);
  };

  const fetchLogs = async () => {
    try {
      const res = await axios.get(`${API_URL}/logs/${user.deviceId}`);
      setLogs(res.data);
    } catch (error) {
      console.error("Fetch logs error:", error);
    }
  };

  const handleCompleteAction = async (logId) => {
    try {
      const res = await axios.post(`${API_URL}/logs/${logId}/complete`);
      toast.success(res.data.message);
      refreshUser();
      fetchLogs();
    } catch (error) {
      console.error("Complete action error:", error);
      toast.error(error.response?.data?.message || "Failed to complete action");
    }
  };

  const handleVoiceLog = (data) => {
    handleLog(data);
  };

  React.useEffect(() => {
    if (user?.deviceId) {
        fetchLogs();
        simulateSync(); // Auto sync on load
    }
  }, [user?.deviceId]);

  // Quick Log Items
  const logItems = [
    { id: 'chai', name: 'Chai / Coffee', icon: Coffee, intensity: 2, color: 'bg-orange-500' },
    { id: 'sweet', name: 'Sweet / Dessert', icon: Cookie, intensity: 5, color: 'bg-pink-500' },
    { id: 'cold_drink', name: 'Cold Drink', icon: Droplet, intensity: 4, color: 'bg-blue-500' },
    { id: 'snack', name: 'Packaged Snack', icon: Zap, intensity: 3, color: 'bg-yellow-500' },
    { id: 'camera', name: 'Snap a Photo', icon: Camera, intensity: null, color: 'bg-indigo-500', isImage: true },
  ];

  const fileInputRef = React.useRef(null);

  const handleLog = async (item, file = null) => {
    if (item?.isImage && !file) {
      fileInputRef.current.click();
      return;
    }

    if (!user?.deviceId) {
      toast.error("User not found. Please re-login.");
      return;
    }

    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('deviceId', user.deviceId);
      formData.append('steps', healthData.steps || 0);
      formData.append('sleepHours', parseFloat(healthData.sleep) || 0);

      if (file) {
        formData.append('file', file);
      } else if (item) {
        formData.append('type', item.name);
        if (item.intensity !== null && item.intensity !== undefined) {
          formData.append('intensity', Number(item.intensity));
        }
        if (item.isCustom) {
          formData.append('isCustomText', 'true');
        }
      }

      console.log("Logging with data:", Object.fromEntries(formData.entries()));

      const res = await axios.post(`${API_URL}/logs`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      refreshUser();
      fetchLogs();
      setModalData(res.data);
      setIsModalOpen(true);
    } catch (error) {
      console.error("Log error details:", error.response?.data || error.message);
      toast.error(error.response?.data?.message || "Failed to log. Try again.");
    } finally {
      setLoading(false);
    }
  };

  const onFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      handleLog(null, file);
    }
  };
  
  // ... handleCompleteAction ...

  return (
    <div className="min-h-screen bg-zinc-950 text-white pb-20 relative overflow-hidden">
        {/* Decorative BG */}
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-purple-600/10 rounded-full blur-[100px] pointer-events-none" />

      {/* Header */}
      <header className="fixed top-0 w-full z-40 bg-zinc-950/80 backdrop-blur-md border-b border-zinc-800/50 p-4">
        <div className="flex justify-between items-center max-w-md mx-auto">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-purple-500 to-blue-500 flex items-center justify-center font-bold text-xs uppercase">
              {user.gender?.charAt(0) || 'U'}
            </div>
            <div className="flex flex-col">
                <span className="text-[10px] text-zinc-500 uppercase tracking-tighter">Level {Math.floor(user.points / 100) + 1}</span>
                <span className="text-sm font-bold leading-none">{user.points} XP</span>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
              <div className="flex items-center gap-1.5 bg-zinc-900 px-3 py-1 rounded-full border border-zinc-800">
                <Flame className="w-4 h-4 text-orange-500 fill-orange-500" />
                <span className="font-bold text-orange-400 text-sm">{user.streak}</span>
              </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-md mx-auto pt-24 px-4 space-y-6">
        
        {/* Passive Sync Card */}
        <section className="bg-zinc-900 border border-zinc-800 rounded-3xl p-5 shadow-xl">
             <div className="flex justify-between items-center mb-4">
                <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                    <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-widest">Health Sync</h3>
                </div>
                <button 
                    onClick={simulateSync}
                    className="text-[10px] bg-zinc-800 hover:bg-zinc-700 px-2 py-1 rounded-md text-zinc-400 transition-colors"
                >
                    {healthData.isSyncing ? 'Syncing...' : 'Sync Now'}
                </button>
             </div>
             
             <div className="grid grid-cols-3 gap-3">
                 <div className="flex flex-col items-center p-3 bg-zinc-800/50 rounded-2xl border border-zinc-800">
                     <Zap className="w-4 h-4 text-yellow-500 mb-2" />
                     <span className="text-lg font-bold">{healthData.isSyncing ? '--' : healthData.steps}</span>
                     <span className="text-[10px] text-zinc-500 uppercase">Steps</span>
                 </div>
                 <div className="flex flex-col items-center p-3 bg-zinc-800/50 rounded-2xl border border-zinc-800">
                     <Droplet className="w-4 h-4 text-blue-500 mb-2" />
                     <span className="text-lg font-bold">{healthData.isSyncing ? '--' : healthData.hr}</span>
                     <span className="text-[10px] text-zinc-500 uppercase">BPM</span>
                 </div>
                 <div className="flex flex-col items-center p-3 bg-zinc-800/50 rounded-2xl border border-zinc-800">
                     <Coffee className="w-4 h-4 text-purple-500 mb-2" />
                     <span className="text-lg font-bold">{healthData.isSyncing ? '--' : healthData.sleep}h</span>
                     <span className="text-[10px] text-zinc-500 uppercase">Sleep</span>
                 </div>
             </div>
        </section>

        {/* Hero / CTA */}
        <section className="text-center space-y-4 pt-4">
            <h2 className="text-2xl font-bold">What did you have?</h2>
            <VoiceLogger onLog={handleVoiceLog} />
        </section>

        {/* Quick Log Grid */}
        <div className="grid grid-cols-2 gap-4">
            {logItems.map((item) => (
                <button
                    key={item.id}
                    onClick={() => handleLog(item)}
                    disabled={loading}
                    className="relative group bg-zinc-900 border border-zinc-800 hover:border-zinc-700 p-6 rounded-2xl flex flex-col items-center gap-3 transition-all active:scale-95"
                >
                    <div className={clsx("w-14 h-14 rounded-full flex items-center justify-center shadow-lg mb-2 transition-all group-hover:scale-110", item.color)}>
                        <item.icon className="w-7 h-7 text-white" />
                    </div>
                    <span className="font-medium text-zinc-300">{item.name}</span>
                    
                    {loading && (
                        <div className="absolute inset-0 bg-black/50 rounded-2xl flex items-center justify-center">
                            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        </div>
                    )}
                </button>
            ))}
        </div>

        {/* Daily Stats & Milestones */}
        <section className="bg-zinc-900/50 border border-zinc-800 rounded-2xl p-6 relative overflow-hidden">
            <div className="absolute top-0 right-0 p-4 opacity-10">
                <Trophy className="w-20 h-20 text-yellow-500" />
            </div>
            
            <div className="flex justify-between items-end mb-4">
                 <h3 className="text-lg font-bold">Your Habit Loop</h3>
                 <span className="text-xs text-zinc-400">Streak: {user.streak} Days</span>
            </div>

            {/* Streak Milestones */}
            <div className="flex justify-between items-center text-xs text-zinc-500 mb-2 px-1">
                <span className={clsx(user.streak >= 1 && "text-orange-400 font-bold")}>Day 1</span>
                <span className={clsx(user.streak >= 3 && "text-orange-400 font-bold")}>Day 3</span>
                <span className={clsx(user.streak >= 7 && "text-orange-400 font-bold")}>Day 7</span>
                <span className={clsx(user.streak >= 30 && "text-orange-400 font-bold")}>Day 30</span>
            </div>
            <div className="w-full bg-zinc-800 rounded-full h-1.5 mb-6">
                <div 
                    className="bg-orange-500 h-1.5 rounded-full transition-all duration-1000" 
                    style={{ width: `${Math.min((user.streak / 30) * 100, 100)}%` }} 
                />
            </div>
            
            <div className="space-y-4">
                <div className="flex justify-between items-center text-sm">
                    <span className="text-zinc-400">Level Progress</span>
                    <span className="text-purple-400 font-bold">{Math.floor(user.points / 100) + 1}</span>
                </div>
                 <div className="w-full bg-zinc-800 rounded-full h-2">
                    <div 
                        className="bg-purple-600 h-2 rounded-full transition-all duration-1000" 
                        style={{ width: `${Math.min(user.points % 100, 100)}%` }} 
                    />
                </div>
                <p className="text-xs text-zinc-500 pt-2">
                    {100 - (user.points % 100)} XP to next level
                </p>
            </div>
        </section>

        {/* Actionable Insights Section - Cause -> Effect */}
        {logs.length > 0 && logs[0].insight && (
            <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-indigo-900/30 border border-indigo-500/30 p-5 rounded-3xl relative overflow-hidden"
            >
                <div className="absolute top-0 right-0 p-4 opacity-10">
                    <Zap className="w-16 h-16 text-indigo-400" />
                </div>
                
                <div className="flex items-center gap-2 text-indigo-300 text-[10px] font-bold uppercase tracking-widest mb-3">
                    <Sparkles className="w-3 h-3" />
                    <span>AI Insight</span>
                </div>

                <div className="space-y-4">
                    <div className="relative pl-4 border-l-2 border-indigo-500/50">
                        <p className="text-sm text-zinc-200 leading-relaxed font-medium italic">
                            "{logs[0].insight}"
                        </p>
                    </div>

                    {!logs[0].actionCompleted && logs[0].action && (
                        <div className="space-y-3 pt-2">
                            <p className="text-xs text-zinc-400">
                                Suggested Action: <span className="text-zinc-200">{logs[0].action}</span>
                            </p>
                             <button 
                                onClick={() => handleCompleteAction(logs[0]._id)}
                                className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-2.5 rounded-2xl text-xs transition-colors shadow-lg shadow-indigo-500/20"
                            >
                                Complete (+7 XP)
                            </button>
                        </div>
                    )}
                </div>
            </motion.div>
        )}

        {/* Signup / Premium CTA - Optimized "Upgrade" Nudge */}
        {!user.email && logs.length >= 3 && (
             <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-gradient-to-r from-zinc-900 to-zinc-950 border border-zinc-800 p-6 rounded-3xl relative overflow-hidden group"
             >
                <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/5 rounded-full blur-3xl -mr-10 -mt-10 group-hover:bg-purple-500/10 transition-colors" />
                
                <div className="relative flex items-center justify-between gap-6">
                    <div className="space-y-1">
                        <h4 className="font-bold text-base text-zinc-100 italic">Want deeper insights & rewards?</h4>
                        <p className="text-xs text-zinc-500">Enable history across devices & unlock advanced features.</p>
                    </div>
                    <button 
                        onClick={() => setIsSignupModalOpen(true)}
                        className="flex-shrink-0 bg-white text-black text-xs px-5 py-2.5 rounded-xl font-bold hover:scale-105 active:scale-95 transition-all shadow-lg shadow-white/5"
                    >
                        Upgrade
                    </button>
                </div>
             </motion.div>
        )}

        {/* Badges Section */}
        {user.badges?.length > 0 && (
            <section className="space-y-4">
                <div className="flex items-center gap-2 text-zinc-500 px-2">
                    <Trophy className="w-4 h-4" />
                    <span className="text-sm font-medium uppercase tracking-wider">Your Badges</span>
                </div>
                <div className="flex flex-wrap gap-3 px-2">
                    {user.badges.map((badge, i) => (
                        <motion.div 
                            key={i}
                            whileHover={{ scale: 1.1 }}
                            className="flex flex-col items-center gap-1"
                            title={badge.name}
                        >
                            <div className="w-12 h-12 rounded-2xl bg-zinc-900 border border-zinc-800 flex items-center justify-center text-2xl shadow-lg">
                                {badge.icon || '🏅'}
                            </div>
                            <span className="text-[10px] text-zinc-500 max-w-[50px] text-center leading-tight truncate">
                                {badge.name}
                            </span>
                        </motion.div>
                    ))}
                </div>
            </section>
        )}

        {/* Recent History */}
        <div className="pt-2">
            <div className="flex items-center gap-2 text-zinc-500 mb-4 px-2">
                <History className="w-4 h-4" />
                <span className="text-sm font-medium uppercase tracking-wider">Recent Logs</span>
            </div>
             <div className="space-y-3">
                {logs.length === 0 ? (
                    <div className="text-center py-6 border border-dashed border-zinc-800 rounded-xl text-zinc-600 text-sm">
                        Your activity history will build up here.
                    </div>
                ) : (
                    logs.map((log) => (
                        <div key={log._id} className="bg-zinc-900 border border-zinc-800 p-3 rounded-xl flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className={clsx("w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold", 
                                    log.type.includes('Chai') ? 'bg-orange-900/50 text-orange-400' :
                                    log.type.includes('Sweet') ? 'bg-pink-900/50 text-pink-400' :
                                    log.type.includes('Cold') ? 'bg-blue-900/50 text-blue-400' :
                                    'bg-yellow-900/50 text-yellow-400'
                                )}>
                                    {log.type.charAt(0)}
                                </div>
                                <div className="flex flex-col">
                                    <span className="text-sm font-medium">{log.type}</span>
                                    <span className="text-xs text-zinc-500">
                                        {new Date(log.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    </span>
                                </div>
                            </div>
                            <div className="text-xs font-bold text-zinc-500">
                                {log.intensity > 3 ? 'High Sugar' : 'Moderate'}
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>

      </main>

      {/* Hidden File Input */}
      <input 
        type="file" 
        ref={fileInputRef} 
        onChange={onFileChange} 
        accept="image/*,audio/*" 
        className="hidden" 
      />

      {/* Modal */}
      <LogModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        data={modalData} 
      />

      <SignupModal 
        isOpen={isSignupModalOpen} 
        onClose={() => setIsSignupModalOpen(false)} 
      />
    </div>
  );
};

export default Dashboard;
