import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { assetService, maintenanceService } from '../services/api';
import {
    Search, MapPin, AlertCircle, X, CheckCircle,
    Eye, Navigation, Building2, Zap, Droplets,
    Send, Filter, ChevronDown, Cpu, ArrowRight,
    Camera, Sparkles, Clock, AlertTriangle, ThumbsUp,
    Wrench, CalendarDays, Activity
} from 'lucide-react';

/* ─── Meta ──────────────────────────────────────────────────── */
const TYPE_META = {
    'Public Facility': { icon: Building2, color: '#a78bfa', bg: 'from-violet-500 to-purple-600', lightBg: 'bg-violet-500/20', tag: 'Facility' },
    'Utility': { icon: Zap, color: '#fbbf24', bg: 'from-yellow-400 to-orange-500', lightBg: 'bg-yellow-500/20', tag: 'Utility' },
    'Water Utility': { icon: Droplets, color: '#38bdf8', bg: 'from-sky-400 to-blue-600', lightBg: 'bg-sky-500/20', tag: 'Water' },
    'Road': { icon: Navigation, color: '#94a3b8', bg: 'from-slate-400 to-slate-600', lightBg: 'bg-slate-500/20', tag: 'Road' },
};
const STATUS_STYLE = {
    Good: { cls: 'bg-emerald-900/40 text-emerald-300 border-emerald-700', dot: 'bg-emerald-400' },
    Moderate: { cls: 'bg-amber-900/40 text-amber-300 border-amber-700', dot: 'bg-amber-400' },
    Poor: { cls: 'bg-rose-900/40 text-rose-300 border-rose-700', dot: 'bg-rose-400' },
};

/* ─── Section Header ─────────────────────────────────────────── */
const SectionHeader = ({ icon: Icon, n, title, sub, accent }) => (
    <div className="flex items-center gap-5 mb-7">
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

/* ─── Asset Card ────────────────────────────────────────────── */
const AssetCard = ({ asset, onReport, index }) => {
    const meta = TYPE_META[asset.asset_type] || TYPE_META['Public Facility'];
    const sts = STATUS_STYLE[asset.condition_status] || STATUS_STYLE.Good;
    const Icon = meta.icon;
    const [expanded, setExpanded] = useState(false);

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            transition={{ delay: Math.min(index * 0.04, 0.4) }}
            className="rounded-2xl overflow-hidden relative group"
            style={{ background: 'rgba(30,27,75,0.95)', border: '1px solid rgba(139,92,246,0.15)' }}
        >
            <div className={`absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b ${meta.bg} rounded-l-2xl`} />
            <div className="pl-5 pr-4 pt-4 pb-4">
                <div className="flex items-start gap-3">
                    <div className={`w-10 h-10 rounded-xl ${meta.lightBg} flex items-center justify-center flex-shrink-0 border border-white/10`}>
                        <Icon className="w-5 h-5" style={{ color: meta.color }} />
                    </div>
                    <div className="flex-1 min-w-0">
                        <h3 className="font-black text-white text-sm leading-tight truncate">{asset.asset_name}</h3>
                        <div className="flex items-center gap-1.5 mt-0.5">
                            <MapPin className="w-3 h-3 text-white/30 flex-shrink-0" />
                            <span className="text-xs text-white/40 font-medium truncate">{asset.location}</span>
                        </div>
                    </div>
                    <span className={`flex-shrink-0 inline-flex items-center gap-1 px-2 py-1 rounded-lg text-[9px] font-black uppercase tracking-wider border ${sts.cls}`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${sts.dot}`} />
                        {asset.condition_status}
                    </span>
                </div>
                <div className="mt-2.5 mb-3">
                    <span className={`text-[9px] font-black px-2.5 py-1 rounded-full bg-gradient-to-r ${meta.bg} text-white uppercase tracking-widest`}>{meta.tag}</span>
                </div>

                <AnimatePresence>
                    {expanded && (
                        <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
                            <div className="pt-3 pb-2 border-t border-white/5 space-y-2">
                                {[
                                    ['Type', asset.asset_type],
                                    ['Ward', `Ward ${asset.ward_no}`],
                                    ['Department', asset.responsible_department],
                                ].map(([k, v]) => (
                                    <div key={k} className="flex items-center justify-between text-xs">
                                        <span className="font-bold text-white/30 uppercase tracking-wider text-[9px]">{k}</span>
                                        <span className="font-bold text-white/70 text-right max-w-[55%]">{v}</span>
                                    </div>
                                ))}
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                <div className="flex gap-2 mt-3">
                    <button onClick={() => setExpanded(!expanded)}
                        className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-[10px] font-black text-white/60 hover:text-white uppercase tracking-wider transition-all border border-white/5 hover:border-white/10"
                        style={{ background: 'rgba(255,255,255,0.05)' }}>
                        <Eye className="w-3.5 h-3.5" />
                        {expanded ? 'Hide' : 'Details'}
                    </button>
                    {onReport && (
                        <button onClick={() => onReport(asset)}
                            className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-[10px] font-black text-rose-400 hover:text-white uppercase tracking-wider transition-all border border-rose-500/20 hover:border-rose-500/50"
                            style={{ background: 'rgba(244,63,94,0.1)' }}>
                            <AlertCircle className="w-3.5 h-3.5" />
                            Report
                        </button>
                    )}
                </div>
            </div>
        </motion.div>
    );
};

/* ─── Citizen Dashboard ─────────────────────────────────────── */
const CitizenDashboard = ({ username, forcedSection }) => {
    const [assets, setAssets] = useState([]);
    const [maintenanceLogs, setMaintenanceLogs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [maintLoading, setMaintLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [typeFilter, setTypeFilter] = useState('');
    const [statusFilter, setStatusFilter] = useState('');
    const [reportAsset, setReportAsset] = useState(null);
    const [reportForm, setReportForm] = useState({ type: 'Road Damage', desc: '', image: null });
    const [submitting, setSubmitting] = useState(false);
    const [submitted, setSubmitted] = useState(false);

    const greet = () => {
        const h = new Date().getHours();
        if (h < 12) return 'Good Morning';
        if (h < 17) return 'Good Afternoon';
        if (h < 21) return 'Good Evening';
        return 'Good Night';
    };

    useEffect(() => {
        assetService.getAll().then(r => { setAssets(r.data); setLoading(false); }).catch(() => setLoading(false));
        maintenanceService.getAll().then(r => { setMaintenanceLogs(r.data); setMaintLoading(false); }).catch(() => setMaintLoading(false));
    }, []);

    const filtered = assets.filter(a => {
        const q = search.toLowerCase();
        return (
            (!q || a.asset_name.toLowerCase().includes(q) || a.location.toLowerCase().includes(q) || a.asset_type.toLowerCase().includes(q)) &&
            (!typeFilter || a.asset_type === typeFilter) &&
            (!statusFilter || a.condition_status === statusFilter)
        );
    });

    const handleImageUpload = (e) => {
        const file = e.target.files[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = () => setReportForm(f => ({ ...f, image: reader.result }));
        reader.readAsDataURL(file);
    };

    const handleSubmitReport = async (e) => {
        e.preventDefault();
        if (!reportAsset) return;
        setSubmitting(true);
        try {
            await maintenanceService.add({
                asset_id: reportAsset.asset_id,
                maintenance_date: new Date().toISOString().split('T')[0],
                maintenance_cost: 0,
                remarks: `[CITIZEN REPORT - ${reportForm.type}]: ${reportForm.desc}`,
                image_data: reportForm.image || null,
                issue_status: 'Open',
                new_status: reportAsset.condition_status,
            });
            setSubmitted(true);
            setReportAsset(null);
            setReportForm({ type: 'Road Damage', desc: '', image: null });
            setTimeout(() => setSubmitted(false), 4000);
        } catch (err) { console.error(err); }
        finally { setSubmitting(false); }
    };

    const name = username || 'Citizen';
    const inp = "w-full px-4 py-3.5 rounded-2xl font-bold text-sm outline-none transition-all text-white/90 placeholder:text-white/25";
    const inpS = { background: 'rgba(139,92,246,0.08)', border: '1px solid rgba(139,92,246,0.2)' };

    const ISSUE_STATUS = {
        Open: { cls: 'bg-rose-900/30 text-rose-300 border-rose-700' },
        'In Progress': { cls: 'bg-amber-900/30 text-amber-300 border-amber-700' },
        Resolved: { cls: 'bg-emerald-900/30 text-emerald-300 border-emerald-700' },
    };

    return (
        <div className="min-h-screen bg-transparent text-white font-sans">
            {/* ── Hero Header (only on main dashboard) ──────────── */}
            <div className="relative overflow-hidden px-6 lg:px-12 pt-10 pb-12"
                style={{ background: 'linear-gradient(135deg, rgba(124,58,237,0.15) 0%, rgba(49,46,129,0.4) 100%)' }}>
                <div className="absolute top-0 left-1/4 w-96 h-96 rounded-full opacity-20 blur-3xl"
                    style={{ background: 'radial-gradient(circle, #7c3aed, transparent)' }} />

                {!forcedSection ? (
                    <div className="relative z-10 max-w-5xl mx-auto">
                        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
                            <div className="inline-flex items-center gap-2 bg-white/5 border border-white/10 rounded-full px-4 py-1.5 mb-5 backdrop-blur-sm">
                                <Sparkles className="w-3.5 h-3.5 text-yellow-400 animate-pulse" />
                                <span className="text-white/60 text-[10px] font-black uppercase tracking-[0.4em]">Coimbatore Smart City Portal</span>
                            </div>
                        </motion.div>
                        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="flex flex-wrap gap-3 mt-7">
                            {[
                                { label: 'Total Infrastructure', val: assets.length, border: 'border-indigo-500/30', text: 'text-indigo-300', bg: 'from-indigo-500/20 to-violet-500/10' },
                                { label: 'Working Fine', val: assets.filter(a => a.condition_status === 'Good').length, border: 'border-emerald-500/30', text: 'text-emerald-300', bg: 'from-emerald-500/20 to-teal-500/10' },
                                { label: 'Need Action', val: assets.filter(a => a.condition_status === 'Poor').length, border: 'border-rose-500/30', text: 'text-rose-300', bg: 'from-rose-500/20 to-pink-500/10' },
                            ].map(s => (
                                <div key={s.label} className={`bg-gradient-to-br ${s.bg} backdrop-blur-md border ${s.border} px-5 py-3 rounded-2xl flex items-center gap-3`}>
                                    <span className={`${s.text} font-black text-2xl leading-none`}>{s.val}</span>
                                    <span className="text-white/40 text-[10px] font-bold uppercase tracking-wider leading-tight">{s.label}</span>
                                </div>
                            ))}
                        </motion.div>
                    </div>
                ) : (
                    <div className="relative z-10 max-w-5xl mx-auto">
                        <div className="inline-flex items-center gap-2 bg-white/5 border border-white/10 rounded-full px-4 py-1.5 backdrop-blur-sm">
                            <Sparkles className="w-3.5 h-3.5 text-yellow-400 animate-pulse" />
                            <span className="text-white/60 text-[10px] font-black uppercase tracking-[0.4em]">Coimbatore Smart City Portal</span>
                        </div>
                    </div>
                )}
            </div>

            {/* ── Sections ──────────────────────────────────────── */}
            <div className="max-w-5xl mx-auto px-6 py-10 space-y-14 pb-32">

                {/* SECTION 1: INFRASTRUCTURE DATA */}
                {(!forcedSection || forcedSection === 'assets') && (
                    <section>
                        {forcedSection === 'assets' && (
                            <>
                                <SectionHeader icon={Search} n="01" title="Search Data"
                                    sub="Search by location, name or type"
                                    accent="bg-gradient-to-br from-indigo-600 to-violet-700 shadow-indigo-900/50" />

                                <div className="rounded-3xl p-6 mb-6" style={{ background: 'rgba(30,27,75,0.95)', border: '1px solid rgba(139,92,246,0.2)' }}>
                                    <div className="flex flex-col md:flex-row gap-3">
                                        <div className="flex-1 relative">
                                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-violet-400" />
                                            <input className={`${inp} pl-11`} style={inpS} placeholder="Search by name, location or type…" value={search} onChange={e => setSearch(e.target.value)} />
                                        </div>
                                        <div className="relative">
                                            <Filter className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-violet-400" />
                                            <select className="appearance-none pl-10 pr-8 py-3.5 rounded-2xl font-bold text-sm outline-none text-white/80 cursor-pointer" style={{ ...inpS, minWidth: '150px' }} value={typeFilter} onChange={e => setTypeFilter(e.target.value)}>
                                                <option value="" className="bg-indigo-950">All Types</option>
                                                {Object.keys(TYPE_META).map(t => <option key={t} className="bg-indigo-950">{t}</option>)}
                                            </select>
                                            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30 pointer-events-none" />
                                        </div>
                                        <div className="relative">
                                            <select className="appearance-none px-4 py-3.5 rounded-2xl font-bold text-sm outline-none text-white/80 cursor-pointer" style={{ ...inpS, minWidth: '130px' }} value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
                                                <option value="" className="bg-indigo-950">All Status</option>
                                                <option className="bg-indigo-950">Good</option>
                                                <option className="bg-indigo-950">Moderate</option>
                                                <option className="bg-indigo-950">Poor</option>
                                            </select>
                                            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30 pointer-events-none" />
                                        </div>
                                        {(search || typeFilter || statusFilter) && (
                                            <button onClick={() => { setSearch(''); setTypeFilter(''); setStatusFilter(''); }}
                                                className="px-4 py-3.5 rounded-2xl text-xs font-black text-rose-400 flex items-center gap-1.5 transition-all"
                                                style={{ background: 'rgba(244,63,94,0.1)', border: '1px solid rgba(244,63,94,0.25)' }}>
                                                <X className="w-3.5 h-3.5" /> Clear
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </>
                        )}

                        {!forcedSection && (
                            <div className="mb-5 flex items-center justify-between pl-2">
                                <h2 className="text-2xl font-black text-white flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-xl bg-indigo-500/20 flex items-center justify-center border border-indigo-500/30">
                                        <Search className="w-4 h-4 text-indigo-300" />
                                    </div>
                                    City Infrastructure
                                </h2>
                            </div>
                        )}

                        {loading ? (
                            <div className="flex items-center justify-center py-20">
                                <div className="relative w-12 h-12">
                                    <div className="w-12 h-12 rounded-full border-4 border-violet-900 border-t-violet-400 animate-spin" />
                                    <Cpu className="w-5 h-5 text-violet-400 absolute inset-0 m-auto animate-pulse" />
                                </div>
                            </div>
                        ) : (forcedSection === 'assets' && !search && !typeFilter && !statusFilter) ? (
                            <div className="text-center py-16">
                                <Search className="w-10 h-10 text-white/10 mx-auto mb-3" />
                                <p className="text-white/30 font-black uppercase text-sm">Please search to view infrastructure data</p>
                            </div>
                        ) : filtered.length === 0 ? (
                            <div className="text-center py-16">
                                <Search className="w-10 h-10 text-white/10 mx-auto mb-3" />
                                <p className="text-white/30 font-black uppercase text-sm">No results found</p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                                {filtered.map((asset, i) => <AssetCard key={asset.asset_id} asset={asset} onReport={setReportAsset} index={i} />)}
                            </div>
                        )}
                    </section>
                )}

                {/* SECTION 2: REPORTED ISSUES HISTORY */}
                {(forcedSection === 'report') && (
                    <section>
                        <SectionHeader icon={AlertCircle} n="02" title="Reported Issues"
                            sub="History of infrastructure complaints submitted"
                            accent="bg-gradient-to-br from-rose-600 to-pink-700 shadow-rose-900/50" />

                        <div className="rounded-3xl p-6" style={{ background: 'rgba(30,27,75,0.95)', border: '1px solid rgba(244,63,94,0.2)' }}>
                            {maintLoading ? (
                                <div className="flex items-center justify-center py-12">
                                    <div className="w-10 h-10 rounded-full border-4 border-rose-900 border-t-rose-400 animate-spin" />
                                </div>
                            ) : maintenanceLogs.filter(log => log.remarks && log.remarks.startsWith('[CITIZEN REPORT') && log.issue_status === 'Open').length === 0 ? (
                                <div className="text-center py-12">
                                    <AlertCircle className="w-10 h-10 text-white/10 mx-auto mb-3" />
                                    <p className="text-white/30 font-black uppercase text-sm">No open issues reported yet</p>
                                    <p className="text-white/20 text-xs mt-2">You can report issues directly from the Infrastructure Data page.</p>
                                </div>
                            ) : (
                                <div className="space-y-3 max-h-[600px] overflow-y-auto pr-1">
                                    {maintenanceLogs
                                        .filter(log => log.remarks && log.remarks.startsWith('[CITIZEN REPORT') && log.issue_status === 'Open')
                                        .map((log, i) => {
                                            const statusMeta = ISSUE_STATUS[log.issue_status || 'Open'] || ISSUE_STATUS.Open;
                                            const asset = assets.find(a => a.asset_id === log.asset_id);
                                            const assetName = asset ? asset.asset_name : `Asset #${log.asset_id}`;
                                            const issueTypeMatch = log.remarks.match(/\[CITIZEN REPORT - (.*?)\]/);
                                            const issueType = issueTypeMatch ? issueTypeMatch[1] : 'Issue';
                                            const description = log.remarks.replace(/\[CITIZEN REPORT - .*?\]: /, '');

                                            return (
                                                <motion.div key={log.maintenance_id || i}
                                                    initial={{ opacity: 0, x: -12 }} animate={{ opacity: 1, x: 0 }}
                                                    transition={{ delay: i * 0.03 }}
                                                    className="flex items-start gap-4 p-4 rounded-2xl"
                                                    style={{ background: 'rgba(244,63,94,0.06)', border: '1px solid rgba(244,63,94,0.15)' }}>
                                                    <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 bg-rose-500/20">
                                                        <AlertCircle className="w-4 h-4 text-rose-400" />
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <div className="flex justify-between items-start mb-1">
                                                            <p className="text-white/80 text-sm font-bold leading-snug">{issueType}</p>
                                                            {log.issue_status && (
                                                                <span className={`text-[9px] font-black px-2 py-0.5 rounded-full border uppercase tracking-widest ${statusMeta.cls}`}>
                                                                    {log.issue_status}
                                                                </span>
                                                            )}
                                                        </div>
                                                        <p className="text-rose-400/80 text-xs font-bold mb-1">{assetName}</p>
                                                        <p className="text-white/50 text-xs truncate mb-2">{description}</p>
                                                        <div className="flex items-center gap-3">
                                                            <span className="text-white/30 text-[10px] font-bold flex items-center gap-1">
                                                                <CalendarDays className="w-3 h-3" />
                                                                {new Date(log.maintenance_date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                                                            </span>
                                                        </div>
                                                    </div>
                                                    {log.image_data && (
                                                        <div className="w-16 h-16 rounded-xl overflow-hidden flex-shrink-0 border border-white/10 shadow-lg cursor-pointer hover:scale-105 transition-transform" onClick={() => window.open(log.image_data)}>
                                                            <img src={log.image_data} alt="Issue" className="w-full h-full object-cover" />
                                                        </div>
                                                    )}
                                                </motion.div>
                                            );
                                        })}
                                </div>
                            )}
                        </div>
                    </section>
                )}

                {/* SECTION 3: MAINTENANCE RECORDS */}
                {(forcedSection === 'maintenance') && (
                    <section>
                        <SectionHeader icon={Wrench} n="03" title="Maintenance Records"
                            sub="Recent city infrastructure service history"
                            accent="bg-gradient-to-br from-amber-600 to-orange-700 shadow-amber-900/50" />

                        <div className="rounded-3xl p-6" style={{ background: 'rgba(30,27,75,0.95)', border: '1px solid rgba(251,191,36,0.2)' }}>
                            {maintLoading ? (
                                <div className="flex items-center justify-center py-12">
                                    <div className="w-10 h-10 rounded-full border-4 border-amber-900 border-t-amber-400 animate-spin" />
                                </div>
                            ) : maintenanceLogs.filter(log => !log.remarks || !log.remarks.startsWith('[CITIZEN REPORT') || log.issue_status !== 'Open').length === 0 ? (
                                <div className="text-center py-12">
                                    <Wrench className="w-10 h-10 text-white/10 mx-auto mb-3" />
                                    <p className="text-white/30 font-black uppercase text-sm">No maintenance records yet</p>
                                </div>
                            ) : (
                                <div className="space-y-3 max-h-[600px] overflow-y-auto pr-1">
                                    {maintenanceLogs.filter(log => !log.remarks || !log.remarks.startsWith('[CITIZEN REPORT') || log.issue_status !== 'Open').map((log, i) => {
                                        const isReport = log.remarks && log.remarks.startsWith('[CITIZEN REPORT');
                                        const statusMeta = ISSUE_STATUS[log.issue_status || 'Open'] || ISSUE_STATUS.Open;
                                        return (
                                            <motion.div key={log.maintenance_id || i}
                                                initial={{ opacity: 0, x: -12 }} animate={{ opacity: 1, x: 0 }}
                                                transition={{ delay: i * 0.03 }}
                                                className="flex items-start gap-4 p-4 rounded-2xl"
                                                style={{ background: isReport ? 'rgba(244,63,94,0.06)' : 'rgba(251,191,36,0.05)', border: isReport ? '1px solid rgba(244,63,94,0.15)' : '1px solid rgba(251,191,36,0.12)' }}>
                                                <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${isReport ? 'bg-rose-500/20' : 'bg-amber-500/20'}`}>
                                                    {isReport ? <AlertCircle className="w-4 h-4 text-rose-400" /> : <Wrench className="w-4 h-4 text-amber-400" />}
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-white/80 text-sm font-bold leading-snug">{log.remarks || 'Maintenance performed'}</p>
                                                    <div className="flex items-center gap-3 mt-1.5">
                                                        <span className="text-white/30 text-[10px] font-bold flex items-center gap-1">
                                                            <CalendarDays className="w-3 h-3" />
                                                            {new Date(log.maintenance_date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                                                        </span>
                                                        {log.issue_status && (
                                                            <span className={`text-[9px] font-black px-2 py-0.5 rounded-full border uppercase tracking-widest ${statusMeta.cls}`}>
                                                                {log.issue_status}
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>
                                            </motion.div>
                                        );
                                    })}
                                </div>
                            )}
                        </div>
                    </section>
                )}
            </div>

            {/* ── Report Modal ──────────────────────────────────── */}
            <AnimatePresence>
                {reportAsset && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[200] flex items-center justify-center p-4"
                        style={{ background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(8px)' }}
                        onClick={() => setReportAsset(null)}>
                        <motion.div initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9 }}
                            className="w-full max-w-lg rounded-3xl p-8 relative"
                            style={{ background: 'rgba(15,12,41,0.98)', border: '1px solid rgba(244,63,94,0.3)' }}
                            onClick={e => e.stopPropagation()}>
                            <button onClick={() => setReportAsset(null)} className="absolute top-6 right-6 w-8 h-8 bg-white/5 hover:bg-white/10 rounded-xl flex items-center justify-center transition-all">
                                <X className="w-4 h-4 text-white/60" />
                            </button>
                            <h3 className="text-xl font-black text-white mb-1">Report Issue</h3>
                            <p className="text-rose-400 text-xs font-bold mb-6 uppercase tracking-wider">{reportAsset.asset_name} · {reportAsset.location}</p>
                            <form onSubmit={handleSubmitReport} className="space-y-4">
                                <div>
                                    <label className="block text-[10px] font-black text-white/40 uppercase tracking-wider mb-1.5">Issue Type</label>
                                    <div className="relative">
                                        <select className="w-full appearance-none px-4 py-3.5 rounded-2xl font-bold text-sm outline-none text-white/80 cursor-pointer" style={{ background: 'rgba(244,63,94,0.08)', border: '1px solid rgba(244,63,94,0.25)' }} value={reportForm.type} onChange={e => setReportForm(f => ({ ...f, type: e.target.value }))}>
                                            {['Road Damage', 'Water Leakage', 'Power Failure', 'Structural Issue', 'Other'].map(t => <option key={t} className="bg-slate-900">{t}</option>)}
                                        </select>
                                        <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30 pointer-events-none" />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-[10px] font-black text-white/40 uppercase tracking-wider mb-1.5">Description *</label>
                                    <textarea className="w-full px-4 py-3.5 rounded-2xl font-bold text-sm outline-none text-white/90 placeholder:text-white/25 resize-none" style={{ background: 'rgba(244,63,94,0.08)', border: '1px solid rgba(244,63,94,0.25)' }} rows={3} placeholder="Describe the issue in detail…" required value={reportForm.desc} onChange={e => setReportForm(f => ({ ...f, desc: e.target.value }))} />
                                </div>
                                <div>
                                    <label className="block text-[10px] font-black text-white/40 uppercase tracking-wider mb-1.5">Photo (optional)</label>
                                    <label className="flex items-center gap-3 px-4 py-3.5 rounded-2xl cursor-pointer transition-all" style={{ background: 'rgba(244,63,94,0.05)', border: '1px dashed rgba(244,63,94,0.3)' }}>
                                        <Camera className="w-4 h-4 text-rose-400" />
                                        <span className="text-white/40 text-xs font-bold">{reportForm.image ? '✓ Photo attached' : 'Click to upload photo'}</span>
                                        <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
                                    </label>
                                </div>
                                <button type="submit" disabled={submitting}
                                    className="w-full flex items-center justify-center gap-3 py-4 rounded-2xl font-black text-sm uppercase tracking-widest text-white transition-all"
                                    style={{ background: submitting ? 'rgba(255,255,255,0.1)' : 'linear-gradient(90deg, #e11d48, #be185d)', boxShadow: submitting ? 'none' : '0 8px 32px rgba(225,29,72,0.4)' }}>
                                    {submitting ? 'Submitting…' : <><Send className="w-4 h-4" /> Submit Report</>}
                                </button>
                            </form>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* ── Success Toast ─────────────────────────────────── */}
            <AnimatePresence>
                {submitted && (
                    <motion.div initial={{ y: 100, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 100, opacity: 0 }}
                        className="fixed bottom-8 right-8 z-[300] flex items-center gap-3 px-5 py-4 rounded-2xl shadow-2xl"
                        style={{ background: 'rgba(16,185,129,0.9)', backdropFilter: 'blur(12px)' }}>
                        <CheckCircle className="w-5 h-5 text-white" />
                        <p className="text-white font-black text-sm">Report submitted successfully!</p>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default CitizenDashboard;
