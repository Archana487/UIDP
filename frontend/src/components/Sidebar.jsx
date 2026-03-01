import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    LayoutDashboard,
    Database,
    Wrench,
    BarChart3,
    Landmark,
    ChevronRight,
    LogOut,
    ShieldCheck,
    Cpu,
    Compass,
    Settings,
    Activity,
    BellRing
} from 'lucide-react';
import { maintenanceService } from '../services/api';

const Sidebar = ({ activeTab, setActiveTab, user }) => {
    const isAdmin = user?.role === 'admin';
    const [pendingIssues, setPendingIssues] = useState(0);
    const [showToast, setShowToast] = useState(false);

    React.useEffect(() => {
        if (!isAdmin) return;

        const fetchIssues = async () => {
            try {
                const res = await maintenanceService.getAll();
                const count = res.data.filter(m => m.issue_status === 'Open' && m.remarks && m.remarks.startsWith('[CITIZEN REPORT')).length;
                setPendingIssues(prev => {
                    if (count > prev) {
                        setShowToast(true);
                        setTimeout(() => setShowToast(false), 5000);
                    }
                    return count;
                });
            } catch (err) { }
        };
        fetchIssues();
        const interval = setInterval(fetchIssues, 5000); // Polling every 5 seconds
        return () => clearInterval(interval);
    }, [isAdmin]);

    const menuItems = isAdmin ? [
        { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
        { id: 'issues', label: 'Issue Tracker', icon: Activity },
        { id: 'create', label: 'Create Asset', icon: Settings },
    ] : [
        { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
        { id: 'assets', label: 'Infrastructure Data', icon: Database },
        { id: 'report', label: 'My Reports', icon: Activity },
        { id: 'maintenance', label: 'Maintenance', icon: Wrench },
    ];

    return (
        <aside className="w-80 bg-[#020617] h-screen sticky top-0 border-r border-white/5 flex flex-col z-[100] overflow-hidden">
            {/* Dynamic Background Glows */}
            <div className="absolute top-0 left-0 w-full h-1/2 bg-indigo-600/[0.08] blur-[120px] pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-full h-1/4 bg-emerald-600/[0.04] blur-[80px] pointer-events-none" />

            <div className="p-10 relative z-10 flex flex-col h-full">
                {/* Branding Section */}
                <div className="flex items-center gap-5 mb-16 px-2">
                    <div className="w-14 h-14 bg-gradient-to-tr from-indigo-700 via-indigo-600 to-indigo-400 rounded-2xl flex items-center justify-center shadow-2xl shadow-indigo-600/20 group cursor-pointer relative">
                        <div className="absolute inset-0 bg-white/10 rounded-2xl animate-pulse" />
                        <Landmark className="w-7 h-7 text-white group-hover:scale-110 transition-transform duration-500 relative z-10" />
                    </div>
                    <div>
                        <h1 className="text-xl font-black tracking-tighter text-white leading-[0.8]">SMART CITY</h1>
                        <p className="text-[10px] uppercase tracking-[0.5em] font-black text-indigo-400 mt-2 flex items-center gap-1.5">
                            <Cpu className="w-3 h-3" /> Management
                        </p>
                    </div>
                </div>

                {/* Main Navigation */}
                <nav className="space-y-4 flex-1">
                    <p className="text-[10px] font-black text-slate-600 uppercase tracking-[0.4em] mb-8 px-4 flex items-center gap-2">
                        <Compass className="w-3 h-3" /> Core Protocols
                    </p>
                    {menuItems.map((item) => {
                        const isActive = activeTab === item.id;
                        return (
                            <button
                                key={item.id}
                                onClick={() => setActiveTab(item.id)}
                                className="w-full relative group outline-none"
                            >
                                {isActive && (
                                    <motion.div
                                        layoutId="sidebar-active-glow"
                                        className="absolute inset-x-2 inset-y-0 bg-indigo-600/[0.08] blur-xl rounded-full"
                                        transition={{ type: "spring", bounce: 0.15, duration: 0.6 }}
                                    />
                                )}
                                {isActive && (
                                    <motion.div
                                        layoutId="sidebar-active-border"
                                        className="absolute inset-0 bg-white/[0.03] rounded-2xl border border-white/10 shadow-[inset_0_0_12px_rgba(255,255,255,0.02)]"
                                        transition={{ type: "spring", bounce: 0.15, duration: 0.6 }}
                                    />
                                )}

                                <div className={`relative flex items-center justify-between px-6 py-4.5 rounded-2xl transition-all duration-300 ${isActive ? 'text-white' : 'text-slate-500 hover:text-slate-300'
                                    }`}>
                                    <div className="flex items-center gap-5">
                                        <div className={`p-2.5 rounded-xl transition-all duration-500 ${isActive ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20 scale-110' : 'bg-white/5 text-slate-500 group-hover:bg-white/10'}`}>
                                            <item.icon className={`w-4 h-4 ${isActive ? 'animate-pulse' : ''}`} />
                                        </div>
                                        <span className={`text-[11px] font-black uppercase tracking-[0.2em] transition-opacity duration-300 ${isActive ? 'opacity-100' : 'opacity-40 group-hover:opacity-80'}`}>{item.label}</span>
                                    </div>

                                    {isAdmin && item.id === 'issues' && pendingIssues > 0 && (
                                        <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="absolute right-6 w-5 h-5 bg-rose-500 rounded-full flex items-center justify-center shadow-[0_0_12px_rgba(244,63,94,0.8)]">
                                            <span className="text-[10px] font-black text-white leading-none">{pendingIssues}</span>
                                        </motion.div>
                                    )}

                                    {isActive && !(isAdmin && item.id === 'issues' && pendingIssues > 0) && (
                                        <motion.div initial={{ opacity: 0, scale: 0 }} animate={{ opacity: 1, scale: 1 }} className="absolute right-6">
                                            <div className="w-1.5 h-1.5 bg-indigo-400 rounded-full shadow-[0_0_8px_rgba(129,140,248,0.8)]" />
                                        </motion.div>
                                    )}
                                </div>
                            </button>
                        );
                    })}
                </nav>

                <AnimatePresence>
                    {showToast && (
                        <motion.div initial={{ opacity: 0, y: 50, scale: 0.9 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 20, scale: 0.9 }}
                            className="absolute bottom-10 left-1/2 -translate-x-1/2 w-[85%] bg-rose-500/90 backdrop-blur-md rounded-2xl p-4 shadow-[0_10px_40px_rgba(244,63,94,0.4)] border border-rose-400/50 z-50 flex items-center gap-3">
                            <BellRing className="w-7 h-7 text-white animate-bounce flex-shrink-0" />
                            <div>
                                <p className="text-white font-black text-xs uppercase tracking-wider mb-0.5">Alert</p>
                                <p className="text-white/90 font-bold text-[10px] uppercase tracking-wider leading-tight">NEW ISSUES WAS ARISE!</p>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </aside>
    );
};

export default Sidebar;
