import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Shield, User, Lock, ArrowRight, Loader2, Landmark, CheckCircle, Smartphone, Globe, Briefcase } from 'lucide-react';
import { authService } from '../services/api';

const Login = ({ onLogin }) => {
    const [isLogin, setIsLogin] = useState(true);
    const [credentials, setCredentials] = useState({ username: '', password: '', role: 'user' });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        setSuccess('');

        try {
            if (isLogin) {
                const response = await authService.login(credentials);
                onLogin(response.data.user);
            } else {
                await authService.register(credentials);
                setSuccess('Registration successful! Please login.');
                setIsLogin(true);
            }
        } catch (err) {
            setError(err.response?.data?.message || 'Authentication failed. Please check your credentials.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#020617] flex items-center justify-center p-6 relative overflow-hidden font-sans">
            {/* Animated Background Elements */}
            <div className="absolute inset-0">
                <motion.div
                    animate={{
                        scale: [1, 1.2, 1],
                        opacity: [0.1, 0.2, 0.1],
                        rotate: [0, 90, 0]
                    }}
                    transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                    className="absolute -top-[20%] -left-[10%] w-[60%] h-[60%] bg-indigo-600/20 blur-[120px] rounded-full"
                />
                <motion.div
                    animate={{
                        scale: [1, 1.3, 1],
                        opacity: [0.1, 0.15, 0.1],
                        rotate: [0, -90, 0]
                    }}
                    transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
                    className="absolute -bottom-[20%] -right-[10%] w-[60%] h-[60%] bg-emerald-600/20 blur-[120px] rounded-full"
                />
            </div>

            <motion.div
                initial={{ opacity: 0, y: 40 }}
                animate={{ opacity: 1, y: 0 }}
                className="w-full max-w-[480px] relative z-10"
            >
                {/* Logo Branding */}
                <div className="flex flex-col items-center mb-10">
                    <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ type: "spring", stiffness: 260, damping: 20 }}
                        className="w-20 h-20 bg-gradient-to-tr from-indigo-600 to-indigo-400 rounded-3xl flex items-center justify-center shadow-2xl shadow-indigo-500/20 mb-6 group cursor-default"
                    >
                        <Landmark className="w-10 h-10 text-white group-hover:scale-110 transition-transform duration-300" />
                    </motion.div>
                    <h1 className="text-4xl font-black text-white tracking-tighter mb-2">SMART CITY</h1>
                    <p className="text-indigo-400 font-bold uppercase tracking-[0.3em] text-[10px]">Management Portal</p>
                </div>

                {/* Auth Card */}
                <div className="bg-white/5 backdrop-blur-2xl border border-white/10 rounded-[3rem] overflow-hidden shadow-3xl">
                    {/* Mode Toggle Tabs */}
                    <div className="flex border-b border-white/5">
                        <button
                            onClick={() => { setIsLogin(true); setError(''); setSuccess(''); }}
                            className={`flex-1 py-5 text-[11px] font-black uppercase tracking-widest transition-all ${isLogin ? 'text-white bg-white/5 border-b-2 border-indigo-500' : 'text-slate-500 hover:text-slate-300'}`}
                        >
                            Existing Access
                        </button>
                        <button
                            onClick={() => { setIsLogin(false); setError(''); setSuccess(''); }}
                            className={`flex-1 py-5 text-[11px] font-black uppercase tracking-widest transition-all ${!isLogin ? 'text-white bg-white/5 border-b-2 border-indigo-500' : 'text-slate-500 hover:text-slate-300'}`}
                        >
                            New Enrollment
                        </button>
                    </div>

                    <div className="p-10 space-y-8">
                        {/* Header Stats / Info */}

                        <form onSubmit={handleSubmit} className="space-y-6">
                            {/* Role Selection */}
                            <div className="space-y-3">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Select Authority Level</label>
                                <div className="grid grid-cols-2 gap-4">
                                    <button
                                        type="button"
                                        onClick={() => setCredentials({ ...credentials, role: 'user' })}
                                        className={`flex items-center justify-center gap-3 p-4 rounded-2xl border transition-all ${credentials.role === 'user'
                                            ? 'bg-indigo-600/10 border-indigo-500/50 text-white'
                                            : 'bg-white/5 border-white/10 text-slate-500 hover:border-white/20'}`}
                                    >
                                        <User className={`w-4 h-4 ${credentials.role === 'user' ? 'text-indigo-400' : 'text-slate-600'}`} />
                                        <span className="text-[10px] font-black uppercase tracking-widest">Citizen / User</span>
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setCredentials({ ...credentials, role: 'admin' })}
                                        className={`flex items-center justify-center gap-3 p-4 rounded-2xl border transition-all ${credentials.role === 'admin'
                                            ? 'bg-emerald-600/10 border-emerald-500/50 text-white'
                                            : 'bg-white/5 border-white/10 text-slate-500 hover:border-white/20'}`}
                                    >
                                        <Briefcase className={`w-4 h-4 ${credentials.role === 'admin' ? 'text-emerald-400' : 'text-slate-600'}`} />
                                        <span className="text-[10px] font-black uppercase tracking-widest">Official / Admin</span>
                                    </button>
                                </div>
                            </div>

                            {/* Credentials */}
                            <div className="space-y-4">
                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Identity Tag</label>
                                    <div className="relative group">
                                        <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 group-focus-within:text-indigo-400 transition-colors" />
                                        <input
                                            type="text"
                                            required
                                            placeholder="Enter username"
                                            className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-4 text-white font-medium outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500/50 transition-all placeholder:text-slate-600 text-sm"
                                            value={credentials.username}
                                            onChange={e => setCredentials({ ...credentials, username: e.target.value })}
                                        />
                                    </div>
                                </div>

                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Security Key</label>
                                    <div className="relative group">
                                        <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 group-focus-within:text-indigo-400 transition-colors" />
                                        <input
                                            type="password"
                                            required
                                            placeholder="••••••••"
                                            className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-4 text-white font-medium outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500/50 transition-all placeholder:text-slate-600 text-sm"
                                            value={credentials.password}
                                            onChange={e => setCredentials({ ...credentials, password: e.target.value })}
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-4">
                                {error && (
                                    <div className="bg-rose-500/10 border border-rose-500/20 text-rose-400 p-4 rounded-2xl text-[10px] font-black uppercase tracking-widest flex items-center gap-3">
                                        <Shield className="w-4 h-4 flex-shrink-0" />
                                        {error}
                                    </div>
                                )}
                                {success && (
                                    <div className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 p-4 rounded-2xl text-[10px] font-black uppercase tracking-widest flex items-center gap-3">
                                        <CheckCircle className="w-4 h-4 flex-shrink-0" />
                                        {success}
                                    </div>
                                )}
                            </div>

                            <button
                                type="submit"
                                disabled={loading}
                                className={`w-full font-black py-5 rounded-2xl transition-all shadow-xl flex items-center justify-center gap-3 group overflow-hidden relative active:scale-[0.98]
                                    ${isLogin ? 'bg-indigo-600 hover:bg-indigo-500 shadow-indigo-600/20' : 'bg-white text-slate-900 shadow-white/10'}`}
                            >
                                {loading ? (
                                    <Loader2 className="w-5 h-5 animate-spin" />
                                ) : (
                                    <>
                                        <span className="text-xs uppercase tracking-[0.2em]">{isLogin ? 'Establish Secure Connection' : 'Register New Protocol'}</span>
                                        <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                                    </>
                                )}
                                <motion.div
                                    className={`absolute inset-0 ${isLogin ? 'bg-white/10' : 'bg-slate-900/5'}`}
                                    initial={{ x: '-100%' }}
                                    whileHover={{ x: '100%' }}
                                    transition={{ duration: 0.6 }}
                                />
                            </button>
                        </form>
                    </div>
                </div>

                {/* Secure Footer */}
                <div className="mt-10 flex flex-col items-center gap-4">
                    <p className="text-[8px] font-black text-slate-600 uppercase tracking-widest">© 2026 Smart City Management Intelligence</p>
                </div>
            </motion.div>
        </div>
    );
};

export default Login;
