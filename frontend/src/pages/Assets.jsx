import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { assetService, maintenanceService } from '../services/api';
import {
    MapPin, Search, Plus, Edit3, Trash2, X,
    Building2, Droplets, ChevronDown, CheckCircle,
    Activity, Landmark, Zap, ChevronRight,
    Map, Navigation, Filter, AlertCircle, Sparkles, Send
} from 'lucide-react';

/* ─── Constants ─────────────────────────────────────────────── */
const KNOWN_LOCATIONS = [
    'RS Puram', 'Saravanampatti', 'Ganapathy', 'Podanur', 'Saibaba Colony',
    'Kalapatti', 'Kuniamuthur', 'Race Course', 'Thudiyalur', 'Singanallur',
    'Peelamedu', 'Sundarapuram', 'Gandhipuram', 'Ukkadam', 'Kovaipudur'
];

const TYPE_META = {
    'Public Facility': { icon: Building2, color: '#6366f1', bg: '#eef2ff', label: 'Facility' },
    'Utility': { icon: Zap, color: '#f59e0b', bg: '#fffbeb', label: 'Utility' },
    'Water Utility': { icon: Droplets, color: '#0ea5e9', bg: '#f0f9ff', label: 'Water' },
    'Road': { icon: Navigation, color: '#64748b', bg: '#f8fafc', label: 'Road' },
};

const ASSET_TYPES = Object.keys(TYPE_META);
const DEPARTMENTS = ['Coimbatore Corporation', 'Public Works Department', 'TWAD Board'];
const STATUSES = ['Good', 'Moderate', 'Poor'];
const STATUS_META = {
    Good: { cls: 'status-good', dot: '#10b981' },
    Moderate: { cls: 'status-moderate', dot: '#f59e0b' },
    Poor: { cls: 'status-poor', dot: '#f43f5e' },
};

const EMPTY_FORM = {
    asset_name: '', asset_type: 'Public Facility', location: '',
    ward_no: '', installation_date: new Date().toISOString().split('T')[0],
    condition_status: 'Good', responsible_department: 'Coimbatore Corporation',
};

/* ─── Small helpers ──────────────────────────────────────────── */
const Field = ({ label, children }) => (
    <div>
        {label && <label className="block text-xs font-black text-slate-400 uppercase tracking-wider mb-1.5">{label}</label>}
        {children}
    </div>
);
const inputCls = "w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl font-medium text-sm outline-none transition-all focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/10";
const Inp = (p) => <input className={inputCls} {...p} />;
const Sel = ({ label, children, ...p }) => (
    <Field label={label}>
        <div className="relative">
            <select className={inputCls + " appearance-none pr-10 font-bold"} {...p}>{children}</select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
        </div>
    </Field>
);

/* ─── Citizen Report Modal ────────────────────────────────────── */
const ReportModal = ({ asset, onClose, onSaved }) => {
    const [remarks, setRemarks] = useState('');
    const [type, setType] = useState('Cleanliness');
    const [submitting, setSubmitting] = useState(false);
    const [done, setDone] = useState(false);
    const [image, setImage] = useState('');

    const handleImageUpload = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => setImage(reader.result);
            reader.readAsDataURL(file);
        }
    };

    const submit = async e => {
        e.preventDefault();
        setSubmitting(true);
        try {
            await maintenanceService.add({
                asset_id: asset.asset_id,
                maintenance_date: new Date().toISOString().split('T')[0],
                maintenance_cost: 0,
                remarks: `[CITIZEN REPORT - ${type}]: ${remarks}`,
                new_status: asset.condition_status,
                image_data: image
            });
            setDone(true);
            setTimeout(() => { onSaved(); onClose(); }, 1000);
        } catch (err) { console.error(err); } finally { setSubmitting(false); }
    };

    return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            style={{ background: 'rgba(2, 6, 23, 0.85)', backdropFilter: 'blur(16px)' }}
            onClick={onClose}
        >
            <motion.div initial={{ scale: 0.9, y: 40 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 40 }}
                className="bg-white rounded-[3rem] shadow-3xl w-full max-w-lg overflow-hidden border border-white/20"
                onClick={e => e.stopPropagation()}
            >
                <div className="relative p-10">
                    <div className="flex items-start justify-between mb-8">
                        <div>
                            <div className="flex items-center gap-2 mb-2">
                                <Sparkles className="w-4 h-4 text-indigo-500" />
                                <span className="text-[10px] font-black text-indigo-500 uppercase tracking-[0.3em]">Citizen Feedback Loop</span>
                            </div>
                            <h3 className="text-3xl font-black text-slate-900 tracking-tighter">Report Issue</h3>
                            <p className="text-slate-400 font-bold uppercase tracking-widest text-[9px] mt-2">Asset: {asset.asset_name}</p>
                        </div>
                        <button onClick={onClose} className="p-3 bg-slate-50 hover:bg-rose-50 hover:text-rose-500 rounded-2xl text-slate-400 transition-all active:scale-95 shadow-sm">
                            <X className="w-5 h-5" />
                        </button>
                    </div>

                    <form onSubmit={submit} className="space-y-6">
                        <Sel label="Issue Category" value={type} onChange={e => setType(e.target.value)}>
                            <option>Cleanliness</option>
                            <option>Damaged Infrastructure</option>
                            <option>Safety Hazard</option>
                            <option>Functionality Issue</option>
                            <option>Other</option>
                        </Sel>

                        <Field label="Description">
                            <textarea
                                className={inputCls + " h-32 resize-none py-4"}
                                placeholder="Describe the issue in detail (e.g., 'The road has a large pothole', 'Park needs cleaning')..."
                                value={remarks}
                                onChange={e => setRemarks(e.target.value)}
                                required
                            />
                        </Field>

                        <Field label="Photo Evidence (Optional)">
                            <input type="file" accept="image/*" onChange={handleImageUpload}
                                className="w-full text-sm text-slate-500 file:mr-4 file:py-3 file:px-6 file:rounded-[1.25rem] file:border-0 file:text-xs file:font-black file:uppercase file:tracking-widest file:bg-indigo-50 file:text-indigo-600 hover:file:bg-indigo-100 transition-all cursor-pointer" />
                            {image && <img src={image} alt="Preview" className="w-full h-32 object-cover rounded-2xl mt-4 border border-slate-100 shadow-sm" />}
                        </Field>

                        <button type="submit" disabled={submitting || done}
                            className="w-full bg-slate-900 hover:bg-indigo-600 disabled:bg-slate-400 text-white font-black py-5 rounded-[1.5rem] transition-all shadow-xl shadow-slate-200 uppercase tracking-[0.2em] text-xs flex items-center justify-center gap-3 active:scale-[0.98]">
                            {done ? <><CheckCircle className="w-5 h-5 text-emerald-400" /> Report Submitted</> :
                                submitting ? 'Syncing...' :
                                    <><Send className="w-4 h-4" /> Finalize Report</>}
                        </button>
                    </form>
                </div>
            </motion.div>
        </motion.div>
    );
};

/* ─── CRUD Modal ─────────────────────────────────────────────── */
const AssetModal = ({ asset, prefillLoc, onClose, onSaved }) => {
    const isEdit = !!asset;
    const [form, setForm] = useState(isEdit ? { ...asset } : { ...EMPTY_FORM, location: prefillLoc || '' });
    const [locSugg, setLocSugg] = useState([]);
    const [saving, setSaving] = useState(false);
    const [done, setDone] = useState(false);
    const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

    const submit = async e => {
        e.preventDefault(); setSaving(true);
        try {
            isEdit ? await assetService.update(asset.asset_id, form) : await assetService.create(form);
            setDone(true);
            setTimeout(() => { onSaved(); onClose(); }, 700);
        } catch (err) { console.error(err); } finally { setSaving(false); }
    };

    return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            style={{ background: 'rgba(2, 6, 23, 0.8)', backdropFilter: 'blur(12px)' }}
            onClick={onClose}
        >
            <motion.div initial={{ scale: 0.9, y: 40 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 40 }}
                className="bg-white rounded-[3rem] shadow-3xl w-full max-w-2xl overflow-hidden border border-white/20"
                onClick={e => e.stopPropagation()}
            >
                <div className="relative p-10">
                    <div className="flex items-start justify-between mb-8">
                        <div>
                            <div className="flex items-center gap-2 mb-2">
                                <Activity className="w-4 h-4 text-indigo-500" />
                                <span className="text-[10px] font-black text-indigo-500 uppercase tracking-[0.3em]">Update details</span>
                            </div>
                            <h3 className="text-3xl font-black text-slate-900 tracking-tighter">
                                {isEdit ? 'Update Asset' : 'Add New Asset'}
                            </h3>
                        </div>
                        <button onClick={onClose} className="p-3 bg-slate-50 hover:bg-rose-50 hover:text-rose-500 rounded-2xl text-slate-400 transition-all active:scale-95 shadow-sm">
                            <X className="w-5 h-5" />
                        </button>
                    </div>

                    <form onSubmit={submit} className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <Field label="Asset Name">
                                <Inp placeholder="Enter name" value={form.asset_name} onChange={e => set('asset_name', e.target.value)} required />
                            </Field>
                            <Sel label="Type" value={form.asset_type} onChange={e => set('asset_type', e.target.value)}>
                                {ASSET_TYPES.map(t => <option key={t}>{t}</option>)}
                            </Sel>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <Field label="Location">
                                <div className="relative group">
                                    <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-indigo-400" />
                                    <input className={inputCls + " pl-12"} placeholder="Location"
                                        value={form.location} onChange={e => {
                                            set('location', e.target.value);
                                            setLocSugg(e.target.value.length > 1 ? KNOWN_LOCATIONS.filter(l => l.toLowerCase().includes(e.target.value.toLowerCase())) : []);
                                        }} required />
                                    <AnimatePresence>
                                        {locSugg.length > 0 && (
                                            <motion.div initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -5 }}
                                                className="absolute top-full mt-2 left-0 right-0 bg-white rounded-2xl shadow-3xl border border-slate-100 z-50 overflow-hidden">
                                                {locSugg.map(l => (
                                                    <button key={l} type="button"
                                                        className="w-full text-left px-5 py-3.5 hover:bg-slate-50 text-xs font-black uppercase tracking-widest text-slate-600 border-b border-slate-50 last:border-0 transition-all flex items-center justify-between group/loc"
                                                        onClick={() => { set('location', l); setLocSugg([]); }}>
                                                        {l} <ChevronRight className="w-3 h-3 text-slate-300 group-hover/loc:text-indigo-500" />
                                                    </button>
                                                ))}
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </div>
                            </Field>
                            <Field label="Sector / Ward">
                                <Inp type="number" min="1" max="100" placeholder="01" value={form.ward_no} onChange={e => set('ward_no', e.target.value)} required />
                            </Field>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <Field label="Installation Date"><Inp type="date" value={form.installation_date} onChange={e => set('installation_date', e.target.value)} required /></Field>
                            <Sel label="Current Status" value={form.condition_status} onChange={e => set('condition_status', e.target.value)}>
                                {STATUSES.map(s => <option key={s}>{s}</option>)}
                            </Sel>
                        </div>

                        <Sel label="Supervising Department" value={form.responsible_department} onChange={e => set('responsible_department', e.target.value)}>
                            {DEPARTMENTS.map(d => <option key={d}>{d}</option>)}
                        </Sel>

                        <button type="submit" disabled={saving || done}
                            className="w-full bg-slate-900 hover:bg-indigo-600 disabled:bg-slate-400 text-white font-black py-5 rounded-[1.5rem] transition-all shadow-xl shadow-slate-200 uppercase tracking-[0.2em] text-xs flex items-center justify-center gap-3 active:scale-[0.98]">
                            {done ? <><CheckCircle className="w-5 h-5 text-emerald-400" /> Protocol Executed</> :
                                saving ? 'Processing...' :
                                    isEdit ? <><Edit3 className="w-4 h-4" /> Commit Changes</> :
                                        <><Landmark className="w-4 h-4" /> Initialize Deployment</>}
                        </button>
                    </form>
                </div>
            </motion.div>
        </motion.div>
    );
};

/* ─── View Modal (Read Only) ─────────────────────────────────── */
const ViewModal = ({ asset, onClose }) => {
    const meta = TYPE_META[asset.asset_type] || TYPE_META.Facility;
    const TypeIcon = meta.icon;
    const sm = STATUS_META[asset.condition_status] || STATUS_META.Good;

    return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            style={{ background: 'rgba(2, 6, 23, 0.8)', backdropFilter: 'blur(12px)' }}
            onClick={onClose}
        >
            <motion.div initial={{ scale: 0.9, y: 40 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 40 }}
                className="bg-white rounded-[3rem] shadow-3xl w-full max-w-2xl overflow-hidden border border-white/20"
                onClick={e => e.stopPropagation()}
            >
                <div className="relative p-10">
                    <div className="flex items-start justify-between mb-8">
                        <div>
                            <div className="flex items-center gap-2 mb-2">
                                <Search className="w-4 h-4 text-indigo-500" />
                                <span className="text-[10px] font-black text-indigo-500 uppercase tracking-[0.3em]">Infrastructure Details</span>
                            </div>
                            <h3 className="text-3xl font-black text-slate-900 tracking-tighter mb-2">{asset.asset_name}</h3>
                            <div className="flex items-center gap-3">
                                <span className="text-[10px] font-black px-3 py-1.5 rounded-xl uppercase tracking-widest border" style={{
                                    background: sm.cls === 'status-good' ? '#f0fdf4' : sm.cls === 'status-moderate' ? '#fffbeb' : '#fef2f2',
                                    color: sm.cls === 'status-good' ? '#166534' : sm.cls === 'status-moderate' ? '#92400e' : '#991b1b',
                                    borderColor: sm.cls === 'status-good' ? '#bcf0da' : sm.cls === 'status-moderate' ? '#fde68a' : '#fecdd3',
                                }}>{asset.condition_status} Condition</span>
                                <span className="text-[10px] font-black uppercase tracking-widest px-3 py-1.5 rounded-xl bg-slate-50 text-slate-500 border border-slate-200">ID: #{asset.asset_id}</span>
                            </div>
                        </div>
                        <button onClick={onClose} className="p-3 bg-slate-50 hover:bg-rose-50 hover:text-rose-500 rounded-2xl text-slate-400 transition-all active:scale-95 shadow-sm">
                            <X className="w-5 h-5" />
                        </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                        <div className="bg-slate-50 p-6 rounded-[2rem] border border-slate-100/50">
                            <p className="text-[10px] uppercase font-black tracking-widest text-slate-400 mb-2">Location Data</p>
                            <p className="font-bold text-slate-900">{asset.location}</p>
                            <p className="text-sm text-slate-500 mt-1">Ward No. {asset.ward_no}</p>
                        </div>
                        <div className="bg-slate-50 p-6 rounded-[2rem] border border-slate-100/50">
                            <p className="text-[10px] uppercase font-black tracking-widest text-slate-400 mb-2">Administrative Info</p>
                            <p className="font-bold text-slate-900">{asset.responsible_department}</p>
                            <p className="text-sm text-slate-500 mt-1">Type: {asset.asset_type}</p>
                        </div>
                    </div>

                    <div className="bg-slate-50 p-6 rounded-[2rem] border border-slate-100/50 mb-8">
                        <p className="text-[10px] uppercase font-black tracking-widest text-slate-400 mb-2">Description</p>
                        <p className="text-sm font-medium text-slate-600 leading-relaxed">
                            {asset.description || 'No detailed description available for this infrastructure asset.'}
                        </p>
                    </div>

                    <div className="flex justify-between items-center text-xs font-bold text-slate-400 mt-4 pt-6 border-t border-slate-100">
                        <span>Installed: {asset.installation_date || 'N/A'}</span>
                        <span>Last Maintained: {asset.last_maintenance_date ? new Date(asset.last_maintenance_date).toLocaleDateString() : 'Never'}</span>
                    </div>
                </div>
            </motion.div>
        </motion.div>
    );
};

/* ─── Asset Card Component ───────────────────────────────────── */
const AssetCard = ({ asset, index, onEdit, onDelete, onReport, onView, userRole }) => {
    const meta = TYPE_META[asset.asset_type] || TYPE_META.Facility;
    const TypeIcon = meta.icon;
    const sm = STATUS_META[asset.condition_status] || STATUS_META.Good;

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: index * 0.05 }}
            className="group relative bg-white/70 backdrop-blur-xl rounded-[2rem] border border-white/40 p-6 flex flex-col gap-6 hover:shadow-2xl hover:shadow-indigo-900/10 hover:-translate-y-2 transition-all duration-300"
        >
            {/* Background Glow */}
            <div className={`absolute -inset-px rounded-[2rem] bg-gradient-to-br opacity-0 group-hover:opacity-10 transition-opacity duration-500 pointer-events-none -z-10 ${asset.condition_status === 'Poor' ? 'from-rose-500 to-rose-600' : 'from-indigo-500 to-indigo-600'
                }`} />

            <div className="cursor-pointer space-y-6" onClick={() => onView(asset)}>
                <div className="flex items-start justify-between">
                    <div className="w-14 h-14 rounded-2xl flex items-center justify-center flex-shrink-0 transition-transform group-hover:scale-110 duration-500 shadow-sm"
                        style={{ background: `${meta.color}15` }}>
                        <TypeIcon className="w-7 h-7" style={{ color: meta.color }} />
                    </div>
                    <div className="flex flex-col items-end gap-2">
                        <span className="text-[9px] font-black px-2.5 py-1 rounded-lg uppercase tracking-tighter border shadow-sm" style={{
                            background: sm.cls === 'status-good' ? '#f0fdf4' : sm.cls === 'status-moderate' ? '#fffbeb' : '#fef2f2',
                            color: sm.cls === 'status-good' ? '#166534' : sm.cls === 'status-moderate' ? '#92400e' : '#991b1b',
                            borderColor: sm.cls === 'status-good' ? '#bcf0da' : sm.cls === 'status-moderate' ? '#fde68a' : '#fecdd3',
                        }}>
                            {asset.condition_status}
                        </span>
                        <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest">ID: #{asset.asset_id}</span>
                    </div>
                </div>

                <div className="space-y-1">
                    <p className="text-lg font-black text-slate-900 leading-tight group-hover:text-indigo-600 transition-colors line-clamp-1">{asset.asset_name}</p>
                    <div className="flex items-center gap-2">
                        <div className="w-1 h-1 rounded-full bg-slate-300" />
                        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">{asset.asset_type}</p>
                    </div>
                </div>

                <div className="space-y-3 py-4 border-y border-slate-100/50">
                    <div className="flex items-center gap-3">
                        <div className="p-1.5 bg-slate-50 rounded-lg">
                            <MapPin className="w-3 h-3 text-slate-400" />
                        </div>
                        <span className="text-[11px] font-bold text-slate-600">{asset.location} <span className="text-slate-300 mx-1">/</span> Ward {asset.ward_no}</span>
                    </div>
                    <div className="flex items-center gap-3">
                        <div className="p-1.5 bg-slate-50 rounded-lg">
                            <Landmark className="w-3 h-3 text-slate-400" />
                        </div>
                        <span className="text-[11px] font-bold text-slate-500 line-clamp-1">{asset.responsible_department}</span>
                    </div>
                    {asset.condition_status === 'Poor' && (
                        <div className="flex items-center gap-3 text-rose-500 bg-rose-50/50 p-2 rounded-xl border border-rose-100/50">
                            <Activity className="w-3 h-3 animate-pulse" />
                            <span className="text-[10px] font-black uppercase tracking-widest">Efficiency Alert</span>
                        </div>
                    )}
                </div>
            </div>

            {userRole === 'admin' ? (
                <div className="grid grid-cols-2 gap-3 pt-2">
                    <button onClick={() => onEdit(asset)}
                        className="flex-1 py-3 bg-slate-50 hover:bg-indigo-50 hover:text-indigo-600 text-slate-900 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center justify-center gap-2 border border-slate-100 active:scale-95">
                        <Edit3 className="w-3.5 h-3.5" /> Edit
                    </button>
                    <button onClick={() => onDelete(asset.asset_id, asset.asset_name)}
                        className="flex-1 py-3 bg-rose-50 hover:bg-rose-500 hover:text-white text-rose-500 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center justify-center gap-2 border border-rose-100 active:scale-95 group/del">
                        <Trash2 className="w-3.5 h-3.5" /> Remove
                    </button>
                </div>
            ) : (
                <button onClick={() => onReport(asset)}
                    className="w-full py-4 bg-gradient-to-r from-fuchsia-600 to-rose-500 hover:from-fuchsia-500 hover:to-rose-400 text-white rounded-xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center justify-center gap-3 shadow-xl shadow-fuchsia-900/20 hover:shadow-2xl hover:shadow-fuchsia-900/30 active:scale-95 group border border-white/20">
                    <AlertCircle className="w-4 h-4 group-hover:rotate-12 transition-transform" />
                    Report Issue / Maintenance
                </button>
            )}
        </motion.div>
    );
};

/* ─── Main Page ──────────────────────────────────────────────── */
const Assets = ({ userRole }) => {
    const [assets, setAssets] = useState([]);
    const [loading, setLoading] = useState(false);
    const [locQuery, setLocQuery] = useState('');
    const [typeFilter, setTypeFilter] = useState('');
    const [statusFilter, setStatusFilter] = useState('');
    const [suggestions, setSugg] = useState([]);
    const [showSugg, setShowSugg] = useState(false);
    const [modal, setModal] = useState(null);
    const [reportModalAsset, setReportModalAsset] = useState(null);
    const [toast, setToast] = useState('');
    const [searched, setSearched] = useState(false);
    const inputRef = useRef(null);

    const fetch = async (loc = locQuery, type = typeFilter, status = statusFilter) => {
        setLoading(true);
        try {
            const res = await assetService.getAll({ search: loc, type, status });
            setAssets(res.data);
            setSearched(true);
        } catch (e) { console.error(e); } finally { setLoading(false); }
    };

    useEffect(() => { if (searched) fetch(); }, [typeFilter, statusFilter]);

    const onLocChange = v => {
        setLocQuery(v);
        setSugg(v.length > 1 ? KNOWN_LOCATIONS.filter(l => l.toLowerCase().includes(v.toLowerCase())) : []);
        setShowSugg(true);
    };
    const pickSugg = loc => { setLocQuery(loc); setSugg([]); setShowSugg(false); fetch(loc, typeFilter, statusFilter); };
    const handleSearch = e => { e.preventDefault(); if (locQuery.trim()) { setSugg([]); setShowSugg(false); fetch(locQuery, typeFilter, statusFilter); } };

    const handleDelete = async (id, name) => {
        if (!window.confirm(`Decommission "${name}"?`)) return;
        await assetService.delete(id);
        flash('Asset decommissioned.');
        fetch();
    };
    const flash = msg => { setToast(msg); setTimeout(() => setToast(''), 3000); };
    const onSaved = () => { fetch(); flash('Record Synchronized.'); };

    const grouped = ASSET_TYPES.reduce((acc, t) => {
        acc[t] = assets.filter(a => a.asset_type === t);
        return acc;
    }, {});
    const noResults = searched && !loading && assets.length === 0;

    return (
        <>
            {/* Toast */}
            <AnimatePresence>
                {toast && (
                    <motion.div initial={{ opacity: 0, y: 50, scale: 0.9 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 50 }}
                        className="fixed bottom-12 left-1/2 -translate-x-1/2 z-50 flex items-center gap-4 px-8 py-4 bg-slate-900/90 backdrop-blur-xl text-white rounded-[2rem] shadow-3xl font-black text-xs uppercase tracking-widest border border-white/10">
                        <div className="w-8 h-8 rounded-xl bg-emerald-500/20 flex items-center justify-center border border-emerald-500/30">
                            <CheckCircle className="w-4 h-4 text-emerald-400" />
                        </div>
                        {toast}
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Modals */}
            <AnimatePresence>
                {modal && modal.mode !== 'view' && <AssetModal asset={modal.asset || null} prefillLoc={locQuery} onClose={() => setModal(null)} onSaved={onSaved} />}
                {modal && modal.mode === 'view' && <ViewModal asset={modal.asset} onClose={() => setModal(null)} />}
                {reportModalAsset && <ReportModal asset={reportModalAsset} onClose={() => setReportModalAsset(null)} onSaved={onSaved} />}
            </AnimatePresence>

            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-12 pb-12">

                {/* ── HERO MANAGEMENT CONSOLE ─────────────────────────── */}
                <div className={`relative rounded-[4rem] overflow-hidden shadow-2xl ${userRole === 'admin' ? 'shadow-indigo-900/30' : 'shadow-fuchsia-900/30'}`}
                    style={{
                        background: userRole === 'admin'
                            ? 'linear-gradient(135deg, #020617 0%, #1e1b4b 50%, #312e81 100%)'
                            : 'linear-gradient(135deg, #09090b 0%, #4a044e 50%, #9d174d 100%)',
                        minHeight: '380px'
                    }}>

                    {/* Animated grid overlay */}
                    <div className="absolute inset-0 opacity-[0.05]"
                        style={{ backgroundImage: `linear-gradient(${userRole === 'admin' ? '#6366f1' : '#f472b6'} 1px, transparent 1px), linear-gradient(90deg, ${userRole === 'admin' ? '#6366f1' : '#f472b6'} 1px, transparent 1px)`, backgroundSize: '60px 60px' }} />

                    {/* Glowing orbs */}
                    <div className={`absolute top-0 right-0 w-[60%] h-[100%] ${userRole === 'admin' ? 'bg-indigo-500/20' : 'bg-fuchsia-500/20'} blur-[140px] rounded-full -translate-y-1/2 translate-x-1/2`} />
                    <div className={`absolute bottom-0 left-0 w-[40%] h-[60%] ${userRole === 'admin' ? 'bg-emerald-500/10' : 'bg-rose-500/10'} blur-[120px] rounded-full translate-y-1/2 -translate-x-1/2`} />
                    <div className={`absolute top-1/2 left-1/2 w-[30%] h-[30%] ${userRole === 'admin' ? 'bg-rose-500/10' : 'bg-amber-500/10'} blur-[100px] rounded-full -translate-x-1/2 -translate-y-1/2`} />

                    <div className="relative z-10 p-16">
                        <div className="flex flex-col md:flex-row items-center justify-between gap-10 mb-12">
                            <div className="text-center md:text-left">
                                <div className="flex items-center justify-center md:justify-start gap-3 mb-6">
                                    <div className={`w-10 h-10 rounded-2xl ${userRole === 'admin' ? 'bg-indigo-500/20 shadow-indigo-500/20 border-indigo-500/30' : 'bg-fuchsia-500/20 shadow-fuchsia-500/20 border-fuchsia-500/30'} flex items-center justify-center border shadow-lg`}>
                                        <Landmark className={`w-5 h-5 ${userRole === 'admin' ? 'text-indigo-400' : 'text-fuchsia-400'}`} />
                                    </div>
                                    <span className={`${userRole === 'admin' ? 'text-indigo-400' : 'text-fuchsia-400'} text-[10px] font-black uppercase tracking-[0.4em]`}>
                                        {userRole === 'admin' ? 'City Asset Management' : 'Neighborhood Watch'}
                                    </span>
                                </div>
                                <h1 className="text-6xl font-black text-white leading-[0.9] tracking-tighter mb-6">
                                    {userRole === 'admin' ? (
                                        <>Your City<br /><span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-indigo-100">Fleet</span></>
                                    ) : (
                                        <>Explore Your<br /><span className="text-transparent bg-clip-text bg-gradient-to-r from-fuchsia-400 to-rose-200">Neighborhood</span></>
                                    )}
                                </h1>
                                <p className="text-slate-400 font-bold uppercase tracking-[0.2em] text-[10px] max-w-md leading-relaxed mx-auto md:mx-0">
                                    {userRole === 'admin' ? 'Manage and monitor all deployed city assets and infrastructure.' : 'Find public facilities, report issues, and help keep Coimbatore beautiful.'}
                                </p>
                            </div>
                            {userRole === 'admin' && (
                                <button onClick={() => setModal({ mode: 'create' })}
                                    className="group relative flex items-center gap-4 px-10 py-5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-[2rem] font-black text-xs transition-all shadow-2xl shadow-indigo-600/30 overflow-hidden active:scale-95">
                                    <Plus className="w-5 h-5 group-hover:rotate-90 transition-transform duration-500" />
                                    <span>Deploy New Asset</span>
                                    <div className="absolute inset-0 bg-white/10 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />
                                </button>
                            )}
                        </div>

                        {/* Search Console */}
                        <form onSubmit={handleSearch} className="relative max-w-4xl mx-auto md:mx-0">
                            <div className="flex flex-col md:flex-row gap-5">
                                <div className="flex-1 relative group">
                                    <Search className={`absolute left-7 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500 ${userRole === 'admin' ? 'group-focus-within:text-indigo-400' : 'group-focus-within:text-fuchsia-400'} transition-colors`} />
                                    <input
                                        ref={inputRef}
                                        type="text"
                                        placeholder={userRole === 'admin' ? "Search fleet by location (e.g. RS Puram...)" : "Where are you looking? (e.g. Saravanampatti...)"}
                                        className={`w-full pl-16 pr-8 py-6 bg-white/10 border border-white/10 ${userRole === 'admin' ? 'focus:border-indigo-500/50 focus:ring-indigo-500/5' : 'focus:border-fuchsia-500/50 focus:ring-fuchsia-500/5'} rounded-[2.5rem] font-bold text-white text-sm outline-none transition-all focus:ring-8 placeholder:text-slate-500`}
                                        value={locQuery}
                                        onChange={e => onLocChange(e.target.value)}
                                        onFocus={() => setShowSugg(true)}
                                        onBlur={() => setTimeout(() => setShowSugg(false), 200)}
                                    />

                                    {/* Dropdown suggestions */}
                                    <AnimatePresence>
                                        {showSugg && suggestions.length > 0 && (
                                            <motion.div initial={{ opacity: 0, y: -10, scale: 0.98 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: -10, scale: 0.98 }}
                                                className="absolute top-full mt-4 left-0 right-0 bg-[#0f172a]/95 backdrop-blur-3xl rounded-[3rem] shadow-3xl border border-white/10 z-50 overflow-hidden p-3">
                                                {suggestions.map((loc, i) => (
                                                    <button key={loc} type="button"
                                                        onMouseDown={() => pickSugg(loc)}
                                                        className="w-full text-left px-8 py-5 hover:bg-white/5 rounded-[2rem] flex items-center justify-between transition-all group border-b border-white/5 last:border-0">
                                                        <div className="flex items-center gap-5">
                                                            <div className={`w-12 h-12 rounded-2xl ${userRole === 'admin' ? 'bg-indigo-500/10 border-indigo-500/20' : 'bg-fuchsia-500/10 border-fuchsia-500/20'} flex items-center justify-center border group-hover:scale-110 transition-transform`}>
                                                                <MapPin className={`w-5 h-5 ${userRole === 'admin' ? 'text-indigo-400' : 'text-fuchsia-400'}`} />
                                                            </div>
                                                            <div>
                                                                <p className="font-black text-white text-base tracking-tight">{loc}</p>
                                                                <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-1">Coimbatore Area</p>
                                                            </div>
                                                        </div>
                                                        <ChevronRight className={`w-5 h-5 text-slate-600 ${userRole === 'admin' ? 'group-hover:text-indigo-400' : 'group-hover:text-fuchsia-400'} transition-colors`} />
                                                    </button>
                                                ))}
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </div>
                                <button type="submit"
                                    className="px-12 py-6 bg-white text-slate-900 rounded-[2.5rem] font-black text-xs uppercase tracking-[0.2em] transition-all hover:bg-slate-100 hover:scale-[1.02] active:scale-[0.98] shadow-2xl flex items-center justify-center gap-3">
                                    {userRole === 'admin' ? 'Scan Fleet' : 'Explore Area'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>

                {/* ── RESULTS ──────────────────────────────────────────── */}
                <AnimatePresence mode="wait">
                    {/* Loading */}
                    {loading && (
                        <motion.div key="loader" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                            className="flex flex-col items-center justify-center py-32 gap-6">
                            <div className="relative">
                                <div className="w-20 h-20 rounded-full border-4 border-indigo-100" />
                                <div className="w-20 h-20 rounded-full border-4 border-indigo-600 border-t-transparent animate-spin absolute inset-0 shadow-lg shadow-indigo-200" />
                                <Sparkles className="absolute inset-0 m-auto w-6 h-6 text-indigo-400 animate-pulse" />
                            </div>
                            <p className="text-slate-400 font-black uppercase tracking-[0.4em] text-[10px] animate-pulse">Loading city data...</p>
                        </motion.div>
                    )}

                    {!loading && !searched && (
                        <motion.div key="idle" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                            className="text-center py-24">
                            <div className="w-24 h-24 bg-indigo-50 rounded-[2.5rem] flex items-center justify-center mx-auto mb-8 shadow-inner">
                                <Map className="w-12 h-12 text-indigo-300" />
                            </div>
                            <h3 className="text-2xl font-black text-slate-900 tracking-tighter">Enter Protocol Location</h3>
                            <p className="text-slate-400 font-bold uppercase tracking-widest text-xs mt-3">Infrastructure visibility requires a spatial target</p>
                        </motion.div>
                    )}

                    {noResults && (
                        <motion.div key="empty" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                            className="bg-white/50 backdrop-blur-md rounded-[4rem] p-24 text-center border-2 border-dashed border-slate-200">
                            <MapPin className="w-20 h-20 mx-auto text-slate-200 mb-8" />
                            <h3 className="text-2xl font-black text-slate-400 uppercase tracking-tighter">Inventory Zero in "{locQuery}"</h3>
                            <p className="text-xs text-slate-400 mt-4 font-bold uppercase tracking-[0.2em] leading-relaxed max-w-sm mx-auto">No registered infrastructure detected within the specified geospatial boundary.</p>
                            {userRole === 'admin' && (
                                <button onClick={() => setModal({ mode: 'create' })}
                                    className="mt-10 px-10 py-5 bg-slate-900 hover:bg-indigo-600 text-white rounded-[2rem] font-black text-xs uppercase tracking-widest transition-all shadow-xl hover:-translate-y-1 mx-auto flex items-center gap-3">
                                    <Plus className="w-4 h-4" /> Initialize Deployment
                                </button>
                            )}
                        </motion.div>
                    )}

                    {!loading && searched && assets.length > 0 && (
                        <motion.div key="results" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-12">

                            {/* Summary bar */}
                            <div className="flex flex-col lg:flex-row items-center justify-between gap-8 px-4">
                                <div>
                                    <h2 className="text-3xl font-black text-slate-900 tracking-tighter">
                                        {locQuery ? `Target: ${locQuery}` : (userRole === 'admin' ? 'City-Wide Fleet' : 'Public Infrastructure Index')}
                                    </h2>
                                    <div className="flex items-center gap-2 mt-2">
                                        <div className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse" />
                                        <p className="text-slate-400 font-black uppercase tracking-widest text-[10px]">{assets.length} Active System Nodes Found</p>
                                    </div>
                                </div>
                                {/* Filters */}
                                <div className="flex gap-4 flex-wrap justify-center mt-6 lg:mt-0">
                                    <div className="relative">
                                        <select value={typeFilter} onChange={e => setTypeFilter(e.target.value)}
                                            className="appearance-none pl-6 pr-10 py-3 bg-white border border-slate-200 rounded-xl font-bold text-xs outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/10 cursor-pointer text-slate-600 shadow-sm w-40">
                                            <option value="">All Types</option>
                                            {ASSET_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                                        </select>
                                        <Filter className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                                    </div>
                                    <div className="relative">
                                        <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)}
                                            className="appearance-none pl-6 pr-10 py-3 bg-white border border-slate-200 rounded-xl font-bold text-xs outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/10 cursor-pointer text-slate-600 shadow-sm w-40">
                                            <option value="">All Statuses</option>
                                            {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
                                        </select>
                                        <Filter className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                                    </div>
                                </div>
                            </div>

                            {/* Grouped sections */}
                            {ASSET_TYPES.map(type => {
                                const items = grouped[type];
                                if (!items || items.length === 0) return null;
                                const meta = TYPE_META[type];
                                const TIcon = meta.icon;
                                return (
                                    <div key={type} className="space-y-8">
                                        {/* Section header */}
                                        <div className="flex items-center gap-5">
                                            <div className="w-12 h-12 rounded-[1.25rem] flex items-center justify-center shadow-lg transition-transform hover:rotate-12" style={{ background: meta.bg }}>
                                                <TIcon className="w-6 h-6" style={{ color: meta.color }} />
                                            </div>
                                            <div>
                                                <h3 className="text-xl font-black text-slate-900 tracking-tight">{meta.label} Management</h3>
                                                <p className="text-[10px] text-slate-400 font-black uppercase tracking-[0.2em] mt-1">{items.length} Registered Units</p>
                                            </div>
                                            <div className="flex-1 h-px bg-slate-100" />
                                        </div>

                                        {/* Card grid */}
                                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                                            {items.map((asset, i) => (
                                                <AssetCard key={asset.asset_id} asset={asset} index={i}
                                                    userRole={userRole}
                                                    onEdit={a => setModal({ mode: 'edit', asset: a })}
                                                    onDelete={handleDelete}
                                                    onReport={a => setReportModalAsset(a)}
                                                    onView={a => setModal({ mode: 'view', asset: a })}
                                                />
                                            ))}
                                        </div>
                                    </div>
                                );
                            })}
                        </motion.div>
                    )}
                </AnimatePresence>
            </motion.div>
        </>
    );
};

export default Assets;
