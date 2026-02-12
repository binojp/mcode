import React, { useState } from 'react';
import { useUser } from '../context/UserContext';
import { motion } from 'framer-motion';
import { Flame, Droplet, Coffee, Cookie, Zap, Trophy, History } from 'lucide-react';
import axios from 'axios';
import LogModal from '../components/LogModal';
import clsx from 'clsx';
import toast from 'react-hot-toast';

import VoiceLogger from '../components/VoiceLogger';

const Dashboard = () => {
  const { user, API_URL, refreshUser } = useUser();
  const [loading, setLoading] = useState(false);
  const [modalData, setModalData] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [logs, setLogs] = useState([]);

  const fetchLogs = async () => {
    try {
      if (!user?.deviceId) return;
      const res = await axios.get(`${API_URL}/logs/${user.deviceId}`);
      setLogs(res.data);
    } catch (err) {
      console.error("Error fetching logs:", err);
    }
  };

  React.useEffect(() => {
    fetchLogs();
  }, [user?.deviceId]);

  // Quick Log Items
  const logItems = [
    { id: 'chai', name: 'Chai / Coffee', icon: Coffee, intensity: 2, color: 'bg-orange-500' },
    { id: 'sweet', name: 'Sweet / Dessert', icon: Cookie, intensity: 5, color: 'bg-pink-500' },
    { id: 'cold_drink', name: 'Cold Drink', icon: Droplet, intensity: 4, color: 'bg-blue-500' },
    { id: 'snack', name: 'Packaged Snack', icon: Zap, intensity: 3, color: 'bg-yellow-500' },
  ];

  const handleLog = async (item) => {
    setLoading(true);
    try {
      // Mock data for passive sync simulation
      const mockSteps = Math.floor(Math.random() * 10000); 
      const mockSleep = Math.floor(Math.random() * 5) + 4; // 4-9 hours

      const res = await axios.post(`${API_URL}/logs`, {
        deviceId: user.deviceId,
        type: item.name,
        intensity: item.intensity,
        steps: mockSteps,
        sleepHours: mockSleep
      });

      // Update local user state
      refreshUser();
      fetchLogs();

      // Show Feedback
      setModalData(res.data);
      setIsModalOpen(true);
    } catch (error) {
      console.error("Log error:", error);
      toast.error("Failed to log. Try again.");
    } finally {
      setLoading(false);
    }
  };
  
  const handleCompleteAction = async (logId) => {
      try {
          const res = await axios.post(`${API_URL}/logs/${logId}/complete`);
          toast.success(`Action Completed! +7 XP`);
          // Refresh to show updated points and hide the action
          refreshUser();
          fetchLogs();
      } catch (error) {
          console.error("Error completing action:", error);
          toast.error(error.response?.data?.message || "Failed to complete action");
      }
  };

  const handleVoiceLog = (type, icon, intensity) => {
      // Find matching item or create ad-hoc
      const item = logItems.find(i => i.name.toLowerCase().includes(type.toLowerCase())) || {
          name: type,
          intensity: intensity || 3
      };
      handleLog(item);
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-white pb-20 relative overflow-hidden">
        {/* Decorative BG */}
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-purple-600/10 rounded-full blur-[100px] pointer-events-none" />

      {/* Header */}
      <header className="fixed top-0 w-full z-40 bg-zinc-950/80 backdrop-blur-md border-b border-zinc-800/50 p-4">
        <div className="flex justify-between items-center max-w-md mx-auto">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-purple-500 to-blue-500 flex items-center justify-center font-bold text-xs">
              {user.gender === 'Male' ? 'M' : 'F'}
            </div>
            <div className="flex flex-col">
                <span className="text-xs text-zinc-400">Level {Math.floor(user.points / 100) + 1}</span>
                <span className="text-sm font-bold">{user.points} XP</span>
            </div>
          </div>
          
          <div className="flex items-center gap-2 bg-zinc-900 px-3 py-1.5 rounded-full border border-zinc-800">
            <Flame className="w-4 h-4 text-orange-500 fill-orange-500" />
            <span className="font-bold text-orange-400">{user.streak}</span>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-md mx-auto pt-24 px-4 space-y-8">
        
        {/* Hero / CTA */}
        <section className="text-center space-y-4">
            <div className="space-y-2">
                <h1 className="text-2xl font-bold">What did you have?</h1>
                <p className="text-zinc-500 text-sm">Tap to log or use voice.</p>
            </div>
            
            {/* Voice Logger */}
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

        {/* Actionable Insights Section */}
        {logs.length > 0 && !logs[0].actionCompleted && logs[0].action && (
            <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-indigo-900/30 border border-indigo-500/30 p-4 rounded-2xl relative overflow-hidden"
            >
                <div className="absolute top-0 right-0 p-3 opacity-20">
                    <Zap className="w-16 h-16 text-indigo-400" />
                </div>
                <h4 className="font-bold text-indigo-200 mb-2 flex items-center gap-2">
                    <Zap className="w-4 h-4" /> Suggested Action
                </h4>
                <p className="text-sm text-zinc-300 mb-4 pr-8">
                    {logs[0].action}
                </p>
                <button 
                    onClick={() => handleCompleteAction(logs[0]._id)}
                    className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-2 rounded-xl text-sm transition-colors shadow-lg shadow-indigo-500/20"
                >
                    Complete (+7 XP)
                </button>
            </motion.div>
        )}

        {/* Signup / Premium CTA (Optional) */}
        {!user.email && user.streak > 2 && (
             <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-gradient-to-r from-blue-900/40 to-purple-900/40 border border-blue-500/30 p-4 rounded-xl flex items-center justify-between"
             >
                <div>
                    <h4 className="font-bold text-sm text-blue-200">Unlock Advanced Insights?</h4>
                    <p className="text-xs text-blue-300/70">Save your streak forever.</p>
                </div>
                <button className="bg-blue-600 hover:bg-blue-500 text-white text-xs px-4 py-2 rounded-lg font-bold shadow-lg shadow-blue-500/20">
                    Connect
                </button>
             </motion.div>
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

      {/* Modal */}
      <LogModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        data={modalData} 
      />
    </div>
  );
};

export default Dashboard;
