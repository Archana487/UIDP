import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { assetService, maintenanceService } from '../services/api';
import {
    Wrench,
    History,
    CheckCircle,
    ChevronRight,
    DollarSign,
    CalendarDays,
    ClipboardList,
    Activity,
    Landmark,
    ShieldAlert,
    Clock,
    Zap,
    MessageSquare,
    User,
    Shield,
    Sparkles,
    ListFilter
} from 'lucide-react';

const Maintenance = ({ username, userRole }) => {
    const isCitizen = userRole !== 'admin';

    const [assets, setAssets] = useState([]);
    const [selectedAsset, setSelectedAsset] = useState(null);
    const [history, setHistory] = useState([]);
    const [myReports, setMyReports] = useState([]);
    const [view, setView] = useState(isCitizen ? 'myreports' : 'assets'); // citizen default: my reports
    const [submitting, setSubmitting] = useState(false);
    const [success, setSuccess] = useState(false);
    const [formData, setFormData] = useState({
        maintenance_date: new Date().toISOString().split('T')[0],
        maintenance_cost: '',
        remarks: '',
        new_status: 'Good'
    });

    // Load assets and citizen's reports
    useEffect(() => {
        const fetchAssets = async () => {
            const res = await assetService.getAll();
            setAssets(res.data);
        };
        fetchAssets();

        if (isCitizen) {
            fetchMyReports();
        }
    }, []);

    const fetchMyReports = async () => {
        try {
            const res = await maintenanceService.getAll(username);
            setMyReports(res.data);
        } catch (err) {
            console.error(err);
        }
    };

    const handleAssetSelect = async (asset) => {
        setSelectedAsset(asset);
        setSuccess(false);
        const res = await maintenanceService.getHistory(asset.asset_id);
        setHistory(res.data);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            await maintenanceService.add({
                asset_id: selectedAsset.asset_id,
                ...formData,
                reported_by: username || 'admin'
            });
            setSuccess(true);
            handleAssetSelect(selectedAsset);
            if (isCitizen) fetchMyReports();
            setFormData({ maintenance_date: new Date().toISOString().split('T')[0], maintenance_cost: '', remarks: '', new_status: 'Good' });
            setTimeout(() => setSuccess(false), 5000);
        } catch (err) {
            console.error(err);
        } finally {
            setSubmitting(false);
        }
    };

    const handleStatusChange = async (maintenanceId, newStatus) => {
        try {
            await maintenanceService.updateStatus(maintenanceId, newStatus);
            const res = await maintenanceService.getHistory(selectedAsset.asset_id);
            setHistory(res.data);
            if (isCitizen) fetchMyReports();
        } catch (err) {
            console.error(err);
        }
    };

    const statusMeta = {
        'Good': { cls: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20', dot: 'bg-emerald-500' },
        'Moderate': { cls: 'bg-amber-500/10 text-amber-500 border-amber-500/20', dot: 'bg-amber-500' },
        'Poor': { cls: 'bg-rose-500/10 text-rose-500 border-rose-500/20', dot: 'bg-rose-500' }
    };

    const issueStatusColor = {
        'Open': 'bg-rose-500/10 text-rose-500 border-rose-500/20',
        'In Progress': 'bg-amber-500/10 text-amber-500 border-amber-500/20',
        'Resolved': 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20',
    };

    const inputCls = "w-full pl-12 pr-6 py-5 bg-white/50 border border-slate-200 focus:border-indigo-500 rounded-3xl font-black text-xs uppercase tracking-[0.15em] outline-none transition-all focus:ring-8 focus:ring-indigo-600/5 placeholder:text-slate-400 shadow-sm";
    const labelCls = "block text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] mb-4 ml-2";

    return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="p-4 lg:p-12 pb-24">

            {/* ── Tab Toggle (citizens only) ─── */}
            {isCitizen && (
                <div className="flex gap-3 mb-10 max-w-xs">
                    <button
                        onClick={() => setView('myreports')}
                        className={`flex-1 py-3 px-5 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all border ${view === 'myreports' ? 'bg-indigo-600 text-white border-indigo-600 shadow-xl shadow-indigo-600/20' : 'bg-white/60 text-slate-500 border-slate-200 hover:border-indigo-300'}`}
                    >
                        My Reports
                    </button>
                    <button
                        onClick={() => setView('assets')}
                        className={`flex-1 py-3 px-5 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all border ${view === 'assets' ? 'bg-indigo-600 text-white border-indigo-600 shadow-xl shadow-indigo-600/20' : 'bg-white/60 text-slate-500 border-slate-200 hover:border-indigo-300'}`}
                    >
                        Submit Report
                    </button>
                </div>
            )}

            {/* ── CITIZEN: MY REPORTS VIEW ─── */}
            {isCitizen && view === 'myreports' && (
                <div className="max-w-4xl mx-auto">
                    {/* Header */}
                    <div className="flex items-center justify-between mb-8">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-2xl bg-indigo-600/10 border border-indigo-600/20 flex items-center justify-center">
                                <ListFilter className="w-6 h-6 text-indigo-600" />
                            </div>
                            <div>
                                <h2 className="text-2xl font-black text-slate-900 tracking-tighter">My Reports</h2>
                                <p className="text-[10px] font-black text-indigo-500 uppercase tracking-widest">Reports submitted by you</p>
                            </div>
                        </div>
                        <div className="px-4 py-2 bg-slate-900 text-white rounded-xl text-[10px] font-black tracking-widest shadow-xl">
                            {myReports.length} Reports
                        </div>
                    </div>

                    <AnimatePresence>
                        {myReports.length === 0 ? (
                            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                                className="bg-white/70 backdrop-blur-2xl rounded-[4rem] p-24 text-center border border-white shadow-2xl">
                                <div className="w-20 h-20 bg-indigo-600/10 rounded-full flex items-center justify-center mx-auto mb-6">
                                    <ClipboardList className="w-9 h-9 text-indigo-400" />
                                </div>
                                <h4 className="text-2xl font-black text-slate-700 tracking-tighter mb-3">No Reports Yet</h4>
                                <p className="text-[11px] text-slate-400 font-black uppercase tracking-widest">
                                    Switch to "Submit Report" tab to file your first report.
                                </p>
                            </motion.div>
                        ) : (
                            <div className="grid gap-5">
                                {myReports.map((record, i) => (
                                    <motion.div key={record.maintenance_id}
                                        initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: i * 0.06 }}
                                        className="bg-white/80 backdrop-blur-xl p-8 rounded-[2.5rem] border border-white shadow-xl hover:-translate-y-1 transition-all duration-300">
                                        <div className="flex items-center justify-between gap-6">
                                            <div className="flex items-center gap-6">
                                                <div className="w-14 h-14 rounded-2xl bg-orange-50 border border-orange-100 flex items-center justify-center flex-shrink-0">
                                                    <User className="w-6 h-6 text-orange-500" />
                                                </div>
                                                <div>
                                                    <div className="flex items-center gap-3 mb-2">
                                                        <p className="text-sm font-black text-slate-900 uppercase tracking-widest">
                                                            {new Date(record.maintenance_date).toLocaleDateString('en-US', { day: 'numeric', month: 'long', year: 'numeric' })}
                                                        </p>
                                                        <span className={`text-[8px] font-black px-2.5 py-1 rounded-lg border uppercase tracking-[0.2em] ${issueStatusColor[record.issue_status] || 'bg-slate-100 text-slate-500 border-slate-200'}`}>
                                                            {record.issue_status}
                                                        </span>
                                                    </div>
                                                    <p className="text-[12px] text-slate-500 font-bold leading-relaxed max-w-xl">
                                                        {record.remarks || 'No remarks provided.'}
                                                    </p>
                                                    {record.image_data && (
                                                        <img src={record.image_data} alt="Evidence" className="mt-4 w-40 h-28 object-cover rounded-xl border border-slate-200 shadow-sm" />
                                                    )}
                                                </div>
                                            </div>
                                            <div className="text-right pl-6 border-l border-slate-100 min-w-[110px] flex-shrink-0">
                                                <p className="text-xl font-black text-slate-900 tracking-tighter">₹{Number(record.maintenance_cost).toLocaleString()}</p>
                                                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mt-1">Est. Cost</p>
                                            </div>
                                        </div>
                                    </motion.div>
                                ))}
                            </div>
                        )}
                    </AnimatePresence>
                </div>
            )}

            {/* ── ASSET SELECTOR + SUBMIT FORM + HISTORY (admin always, citizen on "Submit" tab) ─── */}
            {(!isCitizen || view === 'assets') && (
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 max-w-7xl mx-auto">

                    {/* Asset Selector */}
                    <div className="lg:col-span-4 space-y-8">
                        <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 rounded-2xl bg-indigo-600/10 flex items-center justify-center border border-indigo-600/20 shadow-lg shadow-indigo-100/50">
                                    <Landmark className="w-6 h-6 text-indigo-600" />
                                </div>
                                <div>
                                    <h2 className="text-2xl font-black text-slate-900 tracking-tighter">System Units</h2>
                                    <p className="text-[10px] font-black text-indigo-500 uppercase tracking-widest leading-tight">Operational Inventory</p>
                                </div>
                            </div>
                            <div className="px-4 py-2 bg-slate-900 text-white rounded-xl text-[10px] font-black tracking-widest shadow-xl">
                                {assets.length} Active
                            </div>
                        </div>

                        <div className="overflow-hidden rounded-[3rem] border border-slate-200/60 shadow-2xl shadow-slate-200/40 bg-white/70 backdrop-blur-xl">
                            <div className="max-h-[75vh] overflow-y-auto no-scrollbar">
                                {assets.map((asset) => {
                                    const isSelected = selectedAsset?.asset_id === asset.asset_id;
                                    const sm = statusMeta[asset.condition_status] || statusMeta['Good'];
                                    return (
                                        <button
                                            key={asset.asset_id}
                                            onClick={() => handleAssetSelect(asset)}
                                            className={`w-full text-left p-8 border-b border-slate-100 last:border-0 transition-all duration-500 flex items-center justify-between group 
                                                ${isSelected ? 'bg-indigo-600' : 'hover:bg-slate-50/80'}`}
                                        >
                                            <div className="flex items-center gap-6">
                                                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center border transition-all duration-500
                                                    ${isSelected ? 'bg-white/15 border-white/30 rotate-6' : 'bg-slate-50/50 border-slate-100 group-hover:bg-white group-hover:scale-110 group-hover:-rotate-3'}`}>
                                                    <Activity className={`w-6 h-6 ${isSelected ? 'text-white' : 'text-slate-400'}`} />
                                                </div>
                                                <div>
                                                    <p className={`text-base font-black tracking-tight leading-tight transition-colors ${isSelected ? 'text-white' : 'text-slate-900 group-hover:text-indigo-600'}`}>{asset.asset_name}</p>
                                                    <div className="flex items-center gap-2.5 mt-2">
                                                        <span className={`text-[8px] font-black uppercase tracking-[0.2em] px-2.5 py-1 rounded-lg border ${isSelected ? 'bg-white/20 text-white border-white/30' : sm.cls}`}>
                                                            {asset.condition_status}
                                                        </span>
                                                        <span className={`text-[9px] font-black tracking-widest uppercase ${isSelected ? 'text-indigo-100' : 'text-slate-400'}`}>{asset.location}</span>
                                                    </div>
                                                </div>
                                            </div>
                                            <ChevronRight className={`w-6 h-6 transition-transform duration-500 ${isSelected ? 'text-white translate-x-1' : 'text-slate-200 group-hover:text-indigo-500 group-hover:translate-x-2'}`} />
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                    </div>

                    {/* Right Panel */}
                    <div className="lg:col-span-8 space-y-10">
                        <AnimatePresence mode="wait">
                            {selectedAsset ? (
                                <motion.div key={selectedAsset.asset_id} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }} className="space-y-12">

                                    {/* Asset Header Card */}
                                    <div className="bg-[#020617] rounded-[4rem] p-12 relative overflow-hidden shadow-3xl shadow-indigo-950/20">
                                        <div className="absolute top-0 right-0 w-[50%] h-full bg-indigo-600/10 blur-[120px] -mr-32 -mt-32" />
                                        <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-10">
                                            <div className="flex items-center gap-8">
                                                <div className="w-24 h-24 bg-white/5 rounded-[2.5rem] border border-white/10 flex items-center justify-center backdrop-blur-3xl shadow-2xl">
                                                    <Zap className="w-12 h-12 text-indigo-400" />
                                                </div>
                                                <div className="space-y-2">
                                                    <div className="flex items-center gap-3">
                                                        <ShieldAlert className="w-4 h-4 text-emerald-400" />
                                                        <span className="text-[10px] font-black text-emerald-400 uppercase tracking-[0.4em]">Active Asset Monitoring</span>
                                                    </div>
                                                    <h3 className="text-5xl font-black text-white tracking-tighter leading-none">{selectedAsset.asset_name}</h3>
                                                    <div className="flex items-center gap-4 text-slate-500 font-bold uppercase tracking-[0.2em] text-[10px] pt-1">
                                                        <span>Node: #{selectedAsset.asset_id}</span>
                                                        <div className="w-1 h-1 rounded-full bg-slate-800" />
                                                        <span>Sector: {selectedAsset.location}</span>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className={`px-6 py-2.5 rounded-2xl text-[10px] font-black uppercase tracking-widest border-2 shadow-lg ${statusMeta[selectedAsset.condition_status].cls}`}>
                                                System Health: {selectedAsset.condition_status}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Submit Form */}
                                    <div className="bg-white/70 backdrop-blur-2xl rounded-[4rem] p-14 border border-white shadow-2xl">
                                        <div className="flex items-center justify-between mb-12">
                                            <div className="flex items-center gap-4">
                                                <div className="w-12 h-12 rounded-[1.25rem] bg-orange-500/10 flex items-center justify-center border border-orange-500/20">
                                                    <ClipboardList className="w-6 h-6 text-orange-600" />
                                                </div>
                                                <div>
                                                    <h3 className="text-3xl font-black text-slate-900 tracking-tighter leading-none">Submit Report</h3>
                                                    <p className="text-[10px] text-slate-400 font-black uppercase tracking-[0.3em] mt-2">
                                                        {isCitizen ? `Reporting as: ${username}` : 'Log City Activity & Maintenance'}
                                                    </p>
                                                </div>
                                            </div>
                                            {success && (
                                                <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
                                                    className="bg-emerald-50 text-emerald-700 px-8 py-4 rounded-[2rem] border border-emerald-200 flex items-center gap-4 shadow-xl">
                                                    <CheckCircle className="w-5 h-5" />
                                                    <span className="text-[10px] font-black uppercase tracking-widest">Protocol Sync Complete</span>
                                                </motion.div>
                                            )}
                                        </div>

                                        <form onSubmit={handleSubmit} className="space-y-10">
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                                                <div className="space-y-2">
                                                    <label className={labelCls}>Protocol Timestamp</label>
                                                    <div className="relative group">
                                                        <CalendarDays className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-indigo-500 transition-colors" />
                                                        <input type="date" className={inputCls} value={formData.maintenance_date} onChange={e => setFormData({ ...formData, maintenance_date: e.target.value })} required />
                                                    </div>
                                                </div>
                                                <div className="space-y-2">
                                                    <label className={labelCls}>Estimated Cost (₹)</label>
                                                    <div className="relative group">
                                                        <DollarSign className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-emerald-500 transition-colors" />
                                                        <input type="number" placeholder="0" className={inputCls} value={formData.maintenance_cost} onChange={e => setFormData({ ...formData, maintenance_cost: e.target.value })} required />
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                                                <div className="space-y-2">
                                                    <label className={labelCls}>Condition After Report</label>
                                                    <div className="relative group">
                                                        <Shield className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-indigo-500" />
                                                        <select className={inputCls + " appearance-none"} value={formData.new_status} onChange={e => setFormData({ ...formData, new_status: e.target.value })}>
                                                            <option value="Good">🟢 Good</option>
                                                            <option value="Moderate">🟡 Moderate</option>
                                                            <option value="Poor">🔴 Poor / Critical</option>
                                                        </select>
                                                    </div>
                                                </div>
                                                <div className="flex items-end">
                                                    <button type="submit" disabled={submitting}
                                                        className="w-full bg-slate-900 hover:bg-indigo-600 disabled:bg-slate-400 text-white font-black py-5 rounded-[1.75rem] transition-all shadow-2xl shadow-indigo-100 flex items-center justify-center gap-4 uppercase tracking-[0.2em] text-[11px] hover:-translate-y-1 active:scale-[0.98]">
                                                        {submitting ? 'Submitting...' : <><Zap className="w-5 h-5" /> Submit Report</>}
                                                    </button>
                                                </div>
                                            </div>

                                            <div className="space-y-2">
                                                <label className={labelCls}>Description / Remarks</label>
                                                <div className="relative group">
                                                    <MessageSquare className="absolute left-5 top-8 w-5 h-5 text-slate-400 group-focus-within:text-indigo-500" />
                                                    <textarea className={inputCls + " h-40 py-8 scrollbar-hide resize-none"} placeholder="Describe the issue in detail..." value={formData.remarks} onChange={e => setFormData({ ...formData, remarks: e.target.value })} />
                                                </div>
                                            </div>
                                        </form>
                                    </div>

                                    {/* History — only shown to admin */}
                                    {!isCitizen && (
                                        <div className="space-y-10 pb-10">
                                            <div className="flex items-center gap-5 ml-4">
                                                <div className="w-12 h-12 rounded-2xl bg-white border border-slate-200 shadow-sm flex items-center justify-center">
                                                    <Clock className="w-6 h-6 text-slate-400" />
                                                </div>
                                                <div>
                                                    <h4 className="text-2xl font-black text-slate-900 tracking-tighter leading-none">Activity Log</h4>
                                                    <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest mt-2">All reports for this asset</p>
                                                </div>
                                            </div>

                                            <div className="grid grid-cols-1 gap-6">
                                                {history.length > 0 ? history.map((record, i) => (
                                                    <motion.div key={record.maintenance_id} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.08 }}
                                                        className="bg-white/80 backdrop-blur-xl p-8 rounded-[3rem] border border-white flex items-center justify-between shadow-2xl hover:-translate-y-1 transition-all duration-500 group">
                                                        <div className="flex items-center gap-8">
                                                            <div className={`w-16 h-16 rounded-[1.5rem] flex items-center justify-center border transition-all duration-500
                                                                ${record.remarks?.includes('[CITIZEN REPORT') || record.reported_by !== 'admin'
                                                                    ? 'bg-orange-50 border-orange-100 group-hover:bg-orange-600'
                                                                    : 'bg-indigo-50 border-indigo-100 group-hover:bg-indigo-600'}`}>
                                                                {record.reported_by !== 'admin'
                                                                    ? <User className="w-7 h-7 text-orange-500 group-hover:text-white transition-colors duration-500" />
                                                                    : <History className="w-7 h-7 text-indigo-500 group-hover:text-white transition-colors duration-500" />}
                                                            </div>
                                                            <div className="space-y-1.5">
                                                                <div className="flex items-center gap-3">
                                                                    <p className="text-sm font-black text-slate-900 uppercase tracking-widest leading-none">
                                                                        {new Date(record.maintenance_date).toLocaleDateString('en-US', { day: 'numeric', month: 'long', year: 'numeric' })}
                                                                    </p>
                                                                    {record.reported_by && record.reported_by !== 'admin' && (
                                                                        <span className="text-[8px] font-black bg-orange-500 text-white px-2 py-0.5 rounded-md uppercase tracking-[0.2em] shadow-lg shadow-orange-200">
                                                                            {record.reported_by}
                                                                        </span>
                                                                    )}
                                                                </div>
                                                                <p className="text-[12px] text-slate-500 font-bold leading-relaxed max-w-xl">
                                                                    {record.remarks || 'Standard maintenance protocol executed.'}
                                                                </p>
                                                                {record.image_data && (
                                                                    <img src={record.image_data} alt="Evidence" className="mt-4 w-48 h-32 object-cover rounded-xl border border-slate-200 shadow-sm" />
                                                                )}
                                                            </div>
                                                        </div>
                                                        <div className="text-right pl-6 border-l border-slate-100 ml-6 flex flex-col justify-center min-w-[140px] gap-2">
                                                            {record.reported_by !== 'admin' ? (
                                                                <>
                                                                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1 text-center">Issue Status</p>
                                                                    <select
                                                                        className="text-xs font-bold bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 outline-none text-slate-700 cursor-pointer shadow-sm focus:ring-2 focus:ring-indigo-500/20"
                                                                        value={record.issue_status}
                                                                        onChange={(e) => handleStatusChange(record.maintenance_id, e.target.value)}>
                                                                        <option value="Open">🔴 Open</option>
                                                                        <option value="In Progress">🟡 In Progress</option>
                                                                        <option value="Resolved">🟢 Resolved</option>
                                                                    </select>
                                                                </>
                                                            ) : (
                                                                <>
                                                                    <p className="text-2xl font-black text-slate-900 tracking-tighter">₹{Number(record.maintenance_cost).toLocaleString()}</p>
                                                                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mt-1">Resource Value</p>
                                                                </>
                                                            )}
                                                        </div>
                                                    </motion.div>
                                                )) : (
                                                    <div className="bg-slate-50/50 border-4 border-dashed border-slate-200/50 rounded-[4rem] p-24 text-center">
                                                        <History className="w-10 h-10 text-slate-200 mx-auto mb-5" />
                                                        <h5 className="text-lg font-black text-slate-400 uppercase tracking-[0.3em]">No Records Found</h5>
                                                        <p className="text-[11px] text-slate-300 font-bold uppercase tracking-widest mt-3">No maintenance events recorded for this unit.</p>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    )}

                                </motion.div>
                            ) : (
                                <motion.div key="empty" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.8 }}
                                    className="bg-white/70 backdrop-blur-2xl rounded-[5rem] h-[75vh] flex flex-col items-center justify-center text-center p-24 border border-white shadow-3xl">
                                    <div className="relative mb-12">
                                        <div className="w-32 h-32 bg-indigo-600 rounded-[3.5rem] flex items-center justify-center shadow-3xl shadow-indigo-600/30 relative z-10">
                                            <Wrench className="w-14 h-14 text-white animate-spin-slow" />
                                        </div>
                                        <div className="absolute -top-6 -right-6 w-14 h-14 bg-emerald-500 rounded-[1.5rem] border-[6px] border-white flex items-center justify-center shadow-2xl z-20">
                                            <CheckCircle className="w-6 h-6 text-white" />
                                        </div>
                                    </div>
                                    <h3 className="text-5xl font-black text-slate-900 tracking-tighter mb-6 leading-tight">Select an Asset<br />to Report</h3>
                                    <p className="text-slate-400 font-black uppercase tracking-[0.3em] text-[11px] max-w-sm leading-[1.8]">
                                        Pick an infrastructure unit from the left panel to file a maintenance report.
                                    </p>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                </div>
            )}
        </motion.div>
    );
};

export default Maintenance;
