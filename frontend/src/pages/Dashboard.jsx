import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { assetService, maintenanceService } from '../services/api';
import CitizenDashboard from './CitizenDashboard';
import {
    AlertCircle, Plus, BarChart3, CheckCircle, Clock, ZapOff,
    MessageSquare, ChevronDown, Shield, Database, Activity, Radio,
    X, RefreshCw, Navigation, Building2, Zap, Droplets, Wrench,
    ArrowUpRight, Cpu, TrendingUp, Sparkles, Bell
} from 'lucide-react';

/* ─── Constants ─────────────────────────────────────────────── */
const ASSET_TYPES = ['Public Facility', 'Utility', 'Water Utility', 'Road'];
const DEPARTMENTS = ['Coimbatore Corporation', 'Public Works Department', 'TWAD Board'];
const STATUSES = ['Good', 'Moderate', 'Poor'];
const ISSUE_STATUS_META = {
    Open: { cls: 'bg-rose-900/30 text-rose-300 border-rose-700', dot: 'bg-rose-400' },
    'In Progress': { cls: 'bg-amber-900/30 text-amber-300 border-amber-700', dot: 'bg-amber-400' },
    Resolved: { cls: 'bg-emerald-900/30 text-emerald-300 border-emerald-700', dot: 'bg-emerald-400' },
};
const TYPE_ICONS = {
    'Public Facility': Building2,
    'Utility': Zap,
    'Water Utility': Droplets,
    'Road': Navigation,
};

/* ─── Section Header ────────────────────────────────────────── */
const SectionHeader = ({ icon: Icon, n, title, sub, accent }) => (
    <div className="flex items-center gap-5 mb-8">
        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-lg ${accent}`}>
            <Icon className="w-6 h-6 text-white" />
        </div>
        <div>
            <p className="text-[9px] font-black uppercase tracking-[0.4em] text-white/30">Section {n}</p>
            <h2 className="text-2xl font-black text-white tracking-tight">{title}</h2>
            <p className="text-white/40 text-xs font-medium">{sub}</p>
        </div>
        <div className="flex-1 h-px bg-white/5 ml-4" />
    </div>
);

/* ─── Admin Dashboard ───────────────────────────────────────── */
const AdminDashboard = ({ username, forcedSection }) => {
    const [stats, setStats] = useState(null);
    const [reports, setReports] = useState([]);
    const [assets, setAssets] = useState([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [saved, setSaved] = useState(false);
    const [editingAsset, setEditingAsset] = useState(null); // Determines if edit modal is open
    const [form, setForm] = useState({
        asset_name: '', asset_type: 'Public Facility', location: '',
        ward_no: '', installation_date: new Date().toISOString().split('T')[0],
        condition_status: 'Good', responsible_department: 'Coimbatore Corporation',
    });

    const fetchAll = async () => {
        setLoading(true);
        try {
            const [sRes, mRes, aRes] = await Promise.all([
                assetService.getStats(),
                maintenanceService.getAll(),
                assetService.getAll(),
            ]);
            setStats(sRes.data);
            setAssets(aRes.data);
            const citizenReports = mRes.data
                .filter(m => m.remarks && m.remarks.startsWith('[CITIZEN REPORT'))
                .sort((a, b) => new Date(b.maintenance_date) - new Date(a.maintenance_date));
            setReports(citizenReports);
        } catch (err) { console.error(err); }
        finally { setLoading(false); }
    };

    useEffect(() => { fetchAll(); }, []);

    const handleCreate = async e => {
        e.preventDefault();
        setSaving(true);
        try {
            await assetService.create(form);
            setSaved(true);
            setForm({
                asset_name: '', asset_type: 'Public Facility', location: '', ward_no: '',
                installation_date: new Date().toISOString().split('T')[0],
                condition_status: 'Good', responsible_department: 'Coimbatore Corporation'
            });
            fetchAll();
            setTimeout(() => setSaved(false), 3000);
        } catch (err) { console.error(err); }
        finally { setSaving(false); }
    };

    const updateIssueStatus = async (id, status) => {
        try {
            await maintenanceService.updateStatus(id, status);
            setReports(prev => prev.map(r => r.maintenance_id === id ? { ...r, issue_status: status } : r));
        } catch (err) { console.error(err); }
    };

    const handleDeleteAsset = async (id) => {
        if (!window.confirm("Are you sure you want to delete this asset? This action cannot be undone.")) return;
        try {
            await assetService.delete(id);
            fetchAll();
        } catch (err) { console.error('Error deleting asset:', err); }
    };

    const handleUpdateAsset = async (e) => {
        e.preventDefault();
        setSaving(true);
        try {
            await assetService.update(editingAsset.asset_id, form);
            setEditingAsset(null);
            setForm({
                asset_name: '', asset_type: 'Public Facility', location: '', ward_no: '',
                installation_date: new Date().toISOString().split('T')[0],
                condition_status: 'Good', responsible_department: 'Coimbatore Corporation'
            });
            fetchAll();
        } catch (err) { console.error('Error updating asset:', err); }
        finally { setSaving(false); }
    };

    const startEdit = (asset) => {
        const dateStr = asset.installation_date ? new Date(asset.installation_date).toISOString().split('T')[0] : '';
        setForm({ ...asset, installation_date: dateStr });
        setEditingAsset(asset);
    };

    const inp = "w-full px-4 py-3 rounded-xl font-bold text-sm outline-none transition-all text-white/90 placeholder:text-white/25";
    const inpStyle = { background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(139,92,246,0.2)' };

    if (loading) return (
        <div className="flex items-center justify-center h-[60vh]">
            <div className="flex flex-col items-center gap-5">
                <div className="relative w-16 h-16">
                    <div className="w-16 h-16 rounded-full border-4 border-violet-900 border-t-violet-400 animate-spin" />
                    <Cpu className="w-7 h-7 text-violet-400 absolute inset-0 m-auto animate-pulse" />
                </div>
                <p className="text-white/30 font-black uppercase tracking-widest text-[10px]">Loading Admin Data...</p>
            </div>
        </div>
    );

    const statCards = [
        { label: 'Total Assets', val: stats?.total || 0, icon: Database, color: 'from-indigo-600 to-violet-700', glow: 'shadow-indigo-900/40' },
        { label: 'Active / Working', val: stats?.working || 0, icon: Radio, color: 'from-emerald-600 to-teal-700', glow: 'shadow-emerald-900/40' },
        { label: 'Damaged', val: stats?.damaged || 0, icon: ZapOff, color: 'from-rose-600 to-pink-700', glow: 'shadow-rose-900/40' },
        { label: 'Pending Issues', val: stats?.pendingIssues || 0, icon: MessageSquare, color: 'from-fuchsia-600 to-purple-700', glow: 'shadow-fuchsia-900/40' },
        { label: 'In Maintenance', val: stats?.underMaintenance || 0, icon: Wrench, color: 'from-amber-600 to-orange-700', glow: 'shadow-amber-900/40' },
    ];

    const getGreeting = () => {
        const hour = new Date().getHours();
        if (hour < 12) return 'Good Morning';
        if (hour < 17) return 'Good Afternoon';
        if (hour < 21) return 'Good Evening';
        return 'Good Night';
    };

    return (
        <div className="space-y-12 pb-24" style={{ color: 'white' }}>

            {/* Premium Hero Section with Greeting */}
            {!forcedSection && (
                <div className="relative overflow-hidden mb-12">
                    <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
                        <div className="inline-flex items-center gap-2 bg-indigo-500/10 border border-indigo-500/20 rounded-full px-4 py-1.5 mb-5 backdrop-blur-sm">
                            <Sparkles className="w-3.5 h-3.5 text-indigo-400 animate-pulse" />
                            <span className="text-indigo-300 text-[10px] font-black uppercase tracking-[0.4em]">Strategic Control Center</span>
                        </div>
                    </motion.div>

                    {/* Add stat cards directly to dashboard so it's not empty */}
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 mt-8">
                        {statCards.map((card, i) => (
                            <div key={i} className={`rounded-2xl p-4 border border-white/10 flex flex-col items-center justify-center text-center backdrop-blur-sm bg-gradient-to-br ${card.color} shadow-lg ${card.glow}`}>
                                <card.icon className={`w-6 h-6 mb-2 text-white`} />
                                <span className="text-2xl font-black text-white mb-1">{card.val}</span>
                                <span className={`text-[9px] font-black uppercase tracking-wider text-white/90`}>{card.label}</span>
                            </div>
                        ))}
                    </motion.div>
                </div>
            )}

            {/* FULL ASSET LIST ON MAIN DASHBOARD View */}
            {!forcedSection && (
                <div className="mb-12">
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-2xl font-black text-white flex items-center gap-3">
                            <div className="w-8 h-8 rounded-xl bg-indigo-500/20 flex items-center justify-center border border-indigo-500/30">
                                <Database className="w-4 h-4 text-indigo-300" />
                            </div>
                            Infrastructure Data Vault
                        </h2>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        {assets.map((asset, i) => {
                            const meta = TYPE_ICONS[asset.asset_type] || Building2;
                            const Ico = meta;
                            return (
                                <motion.div key={asset.asset_id} initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: i * 0.05 }}
                                    className="p-5 rounded-2xl border border-white/10 bg-white/5 backdrop-blur-sm group hover:border-indigo-500/30 transition-all flex flex-col">
                                    <div className="flex justify-between items-start mb-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-xl bg-indigo-900/50 flex flex-col items-center justify-center border border-indigo-700/50">
                                                <Ico className="w-5 h-5 text-indigo-300" />
                                            </div>
                                            <div>
                                                <h3 className="font-bold text-white leading-tight">{asset.asset_name}</h3>
                                                <span className="text-[10px] uppercase font-black tracking-wider text-indigo-300/70">{asset.asset_type}</span>
                                            </div>
                                        </div>
                                        <span className={`px-2 py-1 text-[9px] font-black uppercase tracking-widest rounded-lg border 
                                        ${asset.condition_status === 'Good' ? 'bg-emerald-900/30 text-emerald-300 border-emerald-700' :
                                                asset.condition_status === 'Poor' ? 'bg-rose-900/30 text-rose-300 border-rose-700' :
                                                    'bg-amber-900/30 text-amber-300 border-amber-700'}`}>
                                            {asset.condition_status}
                                        </span>
                                    </div>
                                    <div className="text-xs text-white/50 font-medium mb-4 flex-1">
                                        <p><strong className="text-white/70">Location:</strong> {asset.location} (Ward {asset.ward_no})</p>
                                        <p><strong className="text-white/70">Dept:</strong> {asset.responsible_department}</p>
                                    </div>

                                    <div className="grid grid-cols-2 gap-2 mt-auto">
                                        <button onClick={() => startEdit(asset)}
                                            className="px-3 py-2 rounded-xl text-xs font-black uppercase tracking-widest text-indigo-300 bg-indigo-500/10 border border-indigo-500/20 hover:bg-indigo-500/20 hover:text-white transition-all">
                                            Edit
                                        </button>
                                        <button onClick={() => handleDeleteAsset(asset.asset_id)}
                                            className="px-3 py-2 rounded-xl text-xs font-black uppercase tracking-widest text-rose-400 bg-rose-500/10 border border-rose-500/20 hover:bg-rose-500/20 hover:text-white transition-all">
                                            Delete
                                        </button>
                                    </div>
                                </motion.div>
                            );
                        })}
                    </div>
                </div>
            )}

            {/* EDIT ASSET MODAL */}
            <AnimatePresence>
                {editingAsset && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
                        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }}
                            className="bg-indigo-950 border border-indigo-500/30 p-8 rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
                            <div className="flex justify-between items-center mb-6">
                                <h2 className="text-2xl font-black text-white">Update Asset</h2>
                                <button onClick={() => setEditingAsset(null)} className="p-2 bg-white/5 rounded-full hover:bg-white/10 text-white/50 hover:text-white">
                                    <X className="w-5 h-5" />
                                </button>
                            </div>
                            <form onSubmit={handleUpdateAsset} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-[10px] font-black text-white/30 uppercase tracking-wider mb-1.5">Asset Name *</label>
                                    <input className={inp} style={inpStyle} placeholder="e.g. RS Puram Water Plant" required
                                        value={form.asset_name} onChange={e => setForm(f => ({ ...f, asset_name: e.target.value }))} />
                                </div>
                                <div>
                                    <label className="block text-[10px] font-black text-white/30 uppercase tracking-wider mb-1.5">Location *</label>
                                    <input className={inp} style={inpStyle} placeholder="e.g. RS Puram" required
                                        value={form.location} onChange={e => setForm(f => ({ ...f, location: e.target.value }))} />
                                </div>
                                <div>
                                    <label className="block text-[10px] font-black text-white/30 uppercase tracking-wider mb-1.5">Asset Type</label>
                                    <div className="relative">
                                        <select className={`${inp} appearance-none pr-8 cursor-pointer`} style={inpStyle}
                                            value={form.asset_type} onChange={e => setForm(f => ({ ...f, asset_type: e.target.value }))}>
                                            {ASSET_TYPES.map(t => <option key={t} className="bg-slate-900">{t}</option>)}
                                        </select>
                                        <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30 pointer-events-none" />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-[10px] font-black text-white/30 uppercase tracking-wider mb-1.5">Ward No.</label>
                                    <input className={inp} style={inpStyle} type="number" placeholder="e.g. 12"
                                        value={form.ward_no} onChange={e => setForm(f => ({ ...f, ward_no: e.target.value }))} />
                                </div>
                                <div>
                                    <label className="block text-[10px] font-black text-white/30 uppercase tracking-wider mb-1.5">Department</label>
                                    <div className="relative">
                                        <select className={`${inp} appearance-none pr-8 cursor-pointer`} style={inpStyle}
                                            value={form.responsible_department} onChange={e => setForm(f => ({ ...f, responsible_department: e.target.value }))}>
                                            {DEPARTMENTS.map(d => <option key={d} className="bg-slate-900">{d}</option>)}
                                        </select>
                                        <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30 pointer-events-none" />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-[10px] font-black text-white/30 uppercase tracking-wider mb-1.5">Condition Status</label>
                                    <div className="relative">
                                        <select className={`${inp} appearance-none pr-8 cursor-pointer`} style={inpStyle}
                                            value={form.condition_status} onChange={e => setForm(f => ({ ...f, condition_status: e.target.value }))}>
                                            {STATUSES.map(s => <option key={s} className="bg-slate-900">{s}</option>)}
                                        </select>
                                        <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30 pointer-events-none" />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-[10px] font-black text-white/30 uppercase tracking-wider mb-1.5">Installation Date</label>
                                    <input className={inp} style={inpStyle} type="date"
                                        value={form.installation_date} onChange={e => setForm(f => ({ ...f, installation_date: e.target.value }))} />
                                </div>
                                <div className="md:col-span-2 flex justify-end gap-3 pt-4">
                                    <button type="button" onClick={() => setEditingAsset(null)}
                                        className="px-6 py-3.5 rounded-2xl font-black text-sm uppercase tracking-widest text-white/50 border border-white/10 hover:bg-white/5 transition-all">
                                        Cancel
                                    </button>
                                    <button type="submit" disabled={saving}
                                        className="flex items-center gap-2.5 px-8 py-3.5 rounded-2xl font-black text-sm uppercase tracking-widest transition-all shadow-lg"
                                        style={{ background: saving ? 'rgba(255,255,255,0.1)' : 'linear-gradient(90deg, #059669, #0d9488)', boxShadow: saving ? 'none' : '0 8px 32px rgba(5,150,105,0.35)' }}>
                                        {saving ? <RefreshCw className="w-4 h-4 animate-spin" /> : <CheckCircle className="w-4 h-4" />}
                                        {saving ? 'Updating...' : 'Save Changes'}
                                    </button>
                                </div>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* ═══════════════════════════════════════════════════════════
                SECTION 1 — ISSUE REPORTS FROM USERS
            ════════════════════════════════════════════════════════════ */}
            {
                (forcedSection === 'issues') && (
                    <section>
                        <SectionHeader icon={AlertCircle} n="01" title="Issue Reports from Citizens"
                            sub="Review and resolve issues raised by the public"
                            accent="bg-gradient-to-br from-rose-600 to-pink-700 shadow-rose-900/50" />

                        {reports.length === 0 ? (
                            <div className="rounded-2xl p-12 text-center" style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)' }}>
                                <CheckCircle className="w-12 h-12 text-emerald-400/40 mx-auto mb-3" />
                                <p className="font-black text-white/30 uppercase tracking-widest text-sm">No open issues — all clear!</p>
                            </div>
                        ) : (
                            <div className="space-y-3">
                                {reports.map((report, i) => {
                                    const match = report.remarks.match(/\[CITIZEN REPORT - (.*?)\]:\s*(.*)/);
                                    const type = match ? match[1] : 'General';
                                    const msg = match ? match[2] : report.remarks;
                                    const asset = assets.find(a => a.asset_id === report.asset_id);
                                    const statusMeta = ISSUE_STATUS_META[report.issue_status || 'Open'];

                                    return (
                                        <motion.div key={report.maintenance_id || i}
                                            initial={{ opacity: 0, x: -16 }} animate={{ opacity: 1, x: 0 }}
                                            transition={{ delay: i * 0.05 }}
                                            className="flex flex-col sm:flex-row sm:items-center gap-4 p-5 rounded-2xl backdrop-blur-md"
                                            style={{ background: 'rgba(244,63,94,0.06)', border: '1px solid rgba(244,63,94,0.15)' }}
                                        >
                                            {/* Info */}
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center gap-2 mb-2">
                                                    <span className="text-[9px] font-black px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-300 uppercase tracking-widest border border-rose-500/30">{type}</span>
                                                    <span className="text-[10px] text-white/40 font-bold">{new Date(report.maintenance_date).toLocaleDateString('en-IN')}</span>
                                                </div>
                                                <p className="text-white text-base font-bold leading-snug">{msg}</p>
                                                {asset && <p className="text-indigo-300/60 text-[10px] font-black mt-1.5 uppercase tracking-wider">{asset.asset_name} · {asset.location}</p>}
                                                {report.image_data && (
                                                    <div className="mt-3 relative group">
                                                        <img src={report.image_data} alt="Evidence" className="h-24 rounded-xl object-cover border border-white/10 shadow-lg group-hover:scale-105 transition-transform duration-300" />
                                                    </div>
                                                )}
                                            </div>

                                            {/* Status Selector */}
                                            <div className="flex items-center gap-3 flex-shrink-0">
                                                <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider border ${statusMeta.cls}`}>
                                                    <span className={`w-1.5 h-1.5 rounded-full ${statusMeta.dot}`} />
                                                    {report.issue_status || 'Open'}
                                                </span>
                                                <div className="relative">
                                                    <select
                                                        className="appearance-none pl-3 pr-7 py-2 rounded-xl font-bold text-xs outline-none text-white/70 cursor-pointer"
                                                        style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.12)' }}
                                                        value={report.issue_status || 'Open'}
                                                        onChange={e => updateIssueStatus(report.maintenance_id, e.target.value)}
                                                    >
                                                        <option className="bg-slate-900">Open</option>
                                                        <option className="bg-slate-900">In Progress</option>
                                                        <option className="bg-slate-900">Resolved</option>
                                                    </select>
                                                    <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-3 h-3 text-white/30 pointer-events-none" />
                                                </div>
                                            </div>
                                        </motion.div>
                                    );
                                })}
                            </div>
                        )}
                    </section>
                )
            }

            {/* ═══════════════════════════════════════════════════════════
                SECTION 2 — CREATE NEW ASSET
            ════════════════════════════════════════════════════════════ */}
            {
                (forcedSection === 'create') && (
                    <section>
                        <SectionHeader icon={Plus} n="02" title="Create New Infrastructure"
                            sub="Add a new city asset to the management system"
                            accent="bg-gradient-to-br from-emerald-600 to-teal-700 shadow-emerald-900/50" />

                        <div className="rounded-3xl p-7" style={{ background: 'rgba(16,185,129,0.04)', border: '1px solid rgba(16,185,129,0.12)' }}>
                            <AnimatePresence>
                                {saved && (
                                    <motion.div initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                                        className="flex items-center gap-3 mb-5 px-4 py-3 rounded-2xl"
                                        style={{ background: 'rgba(16,185,129,0.15)', border: '1px solid rgba(16,185,129,0.3)' }}>
                                        <CheckCircle className="w-4 h-4 text-emerald-400" />
                                        <span className="text-emerald-300 font-black text-sm uppercase tracking-wider">Asset Created Successfully!</span>
                                    </motion.div>
                                )}
                            </AnimatePresence>

                            <form onSubmit={handleCreate} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-[10px] font-black text-white/30 uppercase tracking-wider mb-1.5">Asset Name *</label>
                                    <input className={inp} style={inpStyle} placeholder="e.g. RS Puram Water Plant" required
                                        value={form.asset_name} onChange={e => setForm(f => ({ ...f, asset_name: e.target.value }))} />
                                </div>

                                <div>
                                    <label className="block text-[10px] font-black text-white/30 uppercase tracking-wider mb-1.5">Location *</label>
                                    <input className={inp} style={inpStyle} placeholder="e.g. RS Puram" required
                                        value={form.location} onChange={e => setForm(f => ({ ...f, location: e.target.value }))} />
                                </div>

                                <div>
                                    <label className="block text-[10px] font-black text-white/30 uppercase tracking-wider mb-1.5">Asset Type</label>
                                    <div className="relative">
                                        <select className={`${inp} appearance-none pr-8 cursor-pointer`} style={inpStyle}
                                            value={form.asset_type} onChange={e => setForm(f => ({ ...f, asset_type: e.target.value }))}>
                                            {ASSET_TYPES.map(t => <option key={t} className="bg-slate-900">{t}</option>)}
                                        </select>
                                        <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30 pointer-events-none" />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-[10px] font-black text-white/30 uppercase tracking-wider mb-1.5">Ward No.</label>
                                    <input className={inp} style={inpStyle} type="number" placeholder="e.g. 12"
                                        value={form.ward_no} onChange={e => setForm(f => ({ ...f, ward_no: e.target.value }))} />
                                </div>

                                <div>
                                    <label className="block text-[10px] font-black text-white/30 uppercase tracking-wider mb-1.5">Department</label>
                                    <div className="relative">
                                        <select className={`${inp} appearance-none pr-8 cursor-pointer`} style={inpStyle}
                                            value={form.responsible_department} onChange={e => setForm(f => ({ ...f, responsible_department: e.target.value }))}>
                                            {DEPARTMENTS.map(d => <option key={d} className="bg-slate-900">{d}</option>)}
                                        </select>
                                        <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30 pointer-events-none" />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-[10px] font-black text-white/30 uppercase tracking-wider mb-1.5">Condition Status</label>
                                    <div className="relative">
                                        <select className={`${inp} appearance-none pr-8 cursor-pointer`} style={inpStyle}
                                            value={form.condition_status} onChange={e => setForm(f => ({ ...f, condition_status: e.target.value }))}>
                                            {STATUSES.map(s => <option key={s} className="bg-slate-900">{s}</option>)}
                                        </select>
                                        <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30 pointer-events-none" />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-[10px] font-black text-white/30 uppercase tracking-wider mb-1.5">Installation Date</label>
                                    <input className={inp} style={inpStyle} type="date"
                                        value={form.installation_date} onChange={e => setForm(f => ({ ...f, installation_date: e.target.value }))} />
                                </div>

                                <div className="md:col-span-2 flex justify-end pt-2">
                                    <button type="submit" disabled={saving}
                                        className="flex items-center gap-2.5 px-8 py-3.5 rounded-2xl font-black text-sm uppercase tracking-widest transition-all shadow-lg"
                                        style={{ background: saving ? 'rgba(255,255,255,0.1)' : 'linear-gradient(90deg, #059669, #0d9488)', boxShadow: saving ? 'none' : '0 8px 32px rgba(5,150,105,0.35)' }}>
                                        {saving ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                                        {saving ? 'Creating...' : 'Create Asset'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </section>
                )
            }

            {/* ═══════════════════════════════════════════════════════════
                SECTION 3 — OVERALL DATA STATS
            ════════════════════════════════════════════════════════════ */}
            {
                (forcedSection === 'assets') && (
                    <section>
                        <SectionHeader icon={BarChart3} n="03" title="Overall Infrastructure Data"
                            sub="City-wide asset statistics at a glance"
                            accent="bg-gradient-to-br from-indigo-600 to-violet-700 shadow-indigo-900/50" />

                        {/* 5 stat cards */}
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 mb-8">
                            {statCards.map((card, i) => (
                                <motion.div key={card.label}
                                    initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: i * 0.08 }}
                                    className={`relative overflow-hidden p-5 rounded-2xl bg-gradient-to-br ${card.color} shadow-xl ${card.glow} group hover:-translate-y-1 transition-all duration-300`}
                                >
                                    <div className="absolute -bottom-4 -right-4 w-20 h-20 bg-white/10 rounded-full" />
                                    <div className="w-9 h-9 bg-white/20 rounded-xl flex items-center justify-center mb-4 border border-white/20">
                                        <card.icon className="w-4 h-4 text-white" />
                                    </div>
                                    <h3 className="text-3xl font-black text-white tracking-tight">{card.val}</h3>
                                    <p className="text-white/70 text-[10px] font-black uppercase tracking-widest mt-1">{card.label}</p>
                                </motion.div>
                            ))}
                        </div>

                        {/* Asset breakdown by type */}
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            {ASSET_TYPES.map(type => {
                                const count = assets.filter(a => a.asset_type === type).length;
                                const goodC = assets.filter(a => a.asset_type === type && a.condition_status === 'Good').length;
                                const IcoComp = TYPE_ICONS[type] || Building2;
                                const pct = count > 0 ? Math.round((goodC / count) * 100) : 0;
                                return (
                                    <div key={type} className="rounded-2xl p-4" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
                                        <div className="flex items-center gap-2 mb-3">
                                            <div className="w-8 h-8 bg-indigo-500/20 rounded-lg flex items-center justify-center border border-indigo-500/20">
                                                <IcoComp className="w-4 h-4 text-indigo-300" />
                                            </div>
                                            <span className="text-[10px] font-black text-white/40 uppercase tracking-wider">{type.split(' ')[0]}</span>
                                        </div>
                                        <p className="text-2xl font-black text-white">{count}</p>
                                        <p className="text-[10px] text-white/30 font-bold uppercase tracking-wider mb-2">Total Assets</p>
                                        {/* Health bar */}
                                        <div className="h-1.5 rounded-full bg-white/5 overflow-hidden">
                                            <motion.div className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-teal-400"
                                                initial={{ width: 0 }} animate={{ width: `${pct}%` }} transition={{ delay: 0.3, duration: 0.8 }} />
                                        </div>
                                        <p className="text-[9px] text-emerald-400/60 font-bold uppercase tracking-wider mt-1">{pct}% healthy</p>
                                    </div>
                                );
                            })}
                        </div>
                    </section>
                )
            }
        </div >
    );
};

/* ─── Root export ──────────────────────────────────────────── */
const Dashboard = ({ userRole, username, forcedSection }) => {
    if (userRole !== 'admin') return <CitizenDashboard username={username} forcedSection={forcedSection} />;
    return <AdminDashboard username={username} forcedSection={forcedSection} />;
};

export default Dashboard;
