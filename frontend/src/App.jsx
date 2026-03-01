import { useState, useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import Sidebar from './components/Sidebar';
import Dashboard from './pages/Dashboard';
import Assets from './pages/Assets';
import Maintenance from './pages/Maintenance';
import Reports from './pages/Reports';
import Login from './pages/Login';
import { Bell, Search, ChevronDown, LogOut, Landmark, ShieldCheck, Sparkles, Command } from 'lucide-react';

const pageVariants = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -20 }
};

function App() {
    const [activeTab, setActiveTab] = useState('dashboard');
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const savedUser = localStorage.getItem('user');
        if (savedUser) {
            setUser(JSON.parse(savedUser));
        }
        setLoading(false);
    }, []);

    const handleLogin = (userData) => {
        setUser(userData);
        localStorage.setItem('user', JSON.stringify(userData));
    };

    const handleLogout = () => {
        localStorage.removeItem('user');
        setUser(null);
    };

    if (loading) return null;

    if (!user) {
        return <Login onLogin={handleLogin} />;
    }

    const isCitizen = user.role !== 'admin';

    const pages = {
        dashboard: <Dashboard userRole={user.role} username={user.username} />,
        assets: <Dashboard userRole={user.role} username={user.username} forcedSection="assets" />,
        report: <Dashboard userRole={user.role} username={user.username} forcedSection="report" />,
        maintenance: <Dashboard userRole={user.role} username={user.username} forcedSection="maintenance" />,
        issues: <Dashboard userRole={user.role} username={user.username} forcedSection="issues" />,
        create: <Dashboard userRole={user.role} username={user.username} forcedSection="create" />,
        reports: <Reports />
    };

    const pageLabels = {
        dashboard: 'City Hub',
        assets: 'Infrastructure Data',
        report: 'My Reports',
        maintenance: 'Service Records',
        issues: 'Issue Tracker',
        create: 'Deployment Hub',
        reports: 'Data Analytics'
    };

    return (
        <div className="flex min-h-screen font-sans selection:bg-indigo-600 selection:text-white" style={{ background: 'linear-gradient(160deg, #0f0c29 0%, #302b63 40%, #24243e 100%)' }}>
            <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} user={user} />

            <main className="flex-1 flex flex-col h-screen overflow-y-auto relative no-scrollbar">
                {/* Dynamic Background Accents */}
                <div className="fixed top-0 right-0 w-[60%] h-[600px] bg-indigo-600/[0.05] blur-[150px] pointer-events-none -z-10" />
                <div className="fixed bottom-0 left-0 w-[40%] h-[500px] bg-emerald-600/[0.05] blur-[120px] pointer-events-none -z-10" />

                {/* Glassmorphic Global Header - Ultra Streamlined */}
                <header className="h-24 flex items-center justify-between px-16 sticky top-0 z-50">
                    <div className="flex flex-col">
                        <h2 className="text-4xl font-black text-white tracking-tighter leading-none">{pageLabels[activeTab]}</h2>
                    </div>

                    <div className="flex items-center gap-10">
                        <div className="flex items-center gap-5">
                            <div className="h-10 w-px bg-white/10 mx-2"></div>

                            {/* User Profile Capsule */}
                            <div className="flex items-center gap-5">
                                <div className="flex items-center gap-4 py-2 pl-2 pr-6 bg-white/5 border border-white/10 rounded-[1.5rem] shadow-sm hover:shadow-md transition-all cursor-default group backdrop-blur-md">
                                    <div className={`w-12 h-12 rounded-[1.1rem] ${user.role === 'admin' ? 'bg-indigo-600' : 'bg-emerald-600'} flex items-center justify-center shadow-lg shadow-black/20 transition-transform group-hover:scale-105 group-hover:rotate-3`}>
                                        <span className="text-white text-sm font-black uppercase tracking-tighter">{user.username?.charAt(0) || user.role?.charAt(0)}</span>
                                    </div>
                                    <div className="text-left">
                                        <p className="text-[11px] font-black text-white leading-tight uppercase tracking-widest">{user.username || user.role}</p>
                                        <div className="flex items-center gap-2 mt-1">
                                            <ShieldCheck className={`w-3.5 h-3.5 ${user.role === 'admin' ? 'text-indigo-400' : 'text-emerald-400'}`} />
                                            <p className="text-[10px] text-white/60 uppercase tracking-widest font-black">
                                                {user.role === 'admin' ? 'Strategic Admin' : 'Citizen Resident'}
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                <button
                                    onClick={handleLogout}
                                    className="p-4 bg-white/5 hover:bg-rose-500/10 border border-white/10 hover:border-rose-500/30 text-white/60 hover:text-rose-500 rounded-[1.25rem] transition-all shadow-sm active:scale-95 group backdrop-blur-md"
                                    title="De-authenticate Session"
                                >
                                    <LogOut className="w-5 h-5 group-hover:translate-x-0.5 transition-transform" />
                                </button>
                            </div>
                        </div>
                    </div>
                </header>

                {/* Main Content Area */}
                <div className={`flex-1 ${(activeTab === 'dashboard' && isCitizen) ? '' : 'px-16 py-8'}`}>
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={activeTab}
                            variants={pageVariants}
                            initial="initial"
                            animate="animate"
                            exit="exit"
                            transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
                        >
                            {pages[activeTab]}
                        </motion.div>
                    </AnimatePresence>
                </div>
            </main>
        </div>
    );
}

export default App;
