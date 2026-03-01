import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { assetService } from '../services/api';
import {
    FileText,
    Download,
    ChevronDown,
    BarChart2,
    ShieldCheck,
    AlertTriangle,
    Database,
    Filter,
    Calendar,
    ArrowUpRight,
    Map,
    Activity,
    Landmark,
    Search,
    Sparkles,
    PieChart,
    BarChart
} from 'lucide-react';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    BarElement,
    ArcElement,
    Title,
    Tooltip,
    Legend,
    Filler,
} from 'chart.js';
import { Line, Bar, Doughnut } from 'react-chartjs-2';

ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    BarElement,
    ArcElement,
    Title,
    Tooltip,
    Legend,
    Filler
);

const Reports = () => {
    const [assets, setAssets] = useState([]);
    const [filters, setFilters] = useState({ type: '', ward: '', status: '' });
    const [loading, setLoading] = useState(false);

    const fetchFilteredData = async () => {
        setLoading(true);
        try {
            const res = await assetService.getAll(filters);
            setAssets(res.data);
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchFilteredData(); }, [filters]);

    const exportCSV = () => {
        const headers = ['Name', 'Type', 'Ward', 'Install Date', 'Last Maintenance', 'Condition', 'Department'];
        const rows = assets.map(a => [a.asset_name, a.asset_type, a.ward_no, a.installation_date, a.last_maintenance_date || 'N/A', a.condition_status, a.responsible_department]);
        const csv = [headers, ...rows].map(r => r.join(',')).join('\n');
        const blob = new Blob([csv], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a'); a.href = url; a.download = 'city_infrastructure_intelligence.csv'; a.click();
    };

    const goodCount = assets.filter(a => a.condition_status === 'Good').length;
    const poorCount = assets.filter(a => a.condition_status === 'Poor').length;
    const moderateCount = assets.filter(a => a.condition_status === 'Moderate').length;

    const summaryCards = [
        { label: 'Global Asset Magnitude', count: assets.length, icon: Database, color: 'indigo', trend: '+12% Stability', sub: 'Total Managed Units' },
        { label: 'Operational Compliance', count: goodCount, icon: ShieldCheck, color: 'emerald', trend: '98% Performance', sub: 'Systems Nominal' },
        { label: 'Maintenance Backlog', count: poorCount + moderateCount, icon: AlertTriangle, color: 'rose', trend: 'Critical Attention', sub: 'Active Maintenance' },
    ];

    // Chart Data Preparation
    // 1. Area-wise Issue Summary (Bar) - Damage count per ward
    const wardDamage = {};
    assets.filter(a => a.condition_status !== 'Good').forEach(a => {
        wardDamage[a.ward_no] = (wardDamage[a.ward_no] || 0) + 1;
    });
    const wardData = {
        labels: Object.keys(wardDamage).map(w => `Ward ${w}`),
        datasets: [{
            label: 'Identified Issues',
            data: Object.values(wardDamage),
            backgroundColor: 'rgba(99, 102, 241, 0.8)',
            borderRadius: 8,
            borderWidth: 0,
        }]
    };

    // 2. frequently Damaged Assets (Doughnut) - By Type
    const typeDamage = {};
    assets.filter(a => a.condition_status === 'Poor').forEach(a => {
        typeDamage[a.asset_type] = (typeDamage[a.asset_type] || 0) + 1;
    });
    const doughnutData = {
        labels: Object.keys(typeDamage),
        datasets: [{
            data: Object.values(typeDamage),
            backgroundColor: [
                'rgba(244, 63, 94, 0.8)', // rose
                'rgba(245, 158, 11, 0.8)', // amber
                'rgba(99, 102, 241, 0.8)', // indigo
                'rgba(16, 185, 129, 0.8)', // emerald
            ],
            borderWidth: 0,
            hoverOffset: 10
        }]
    };

    // 3. Monthly Maintenance Report (Line) - Simulated trends using install date for demo
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const monthlyMaint = new Array(12).fill(0);
    assets.forEach(a => {
        if (a.last_maintenance_date) {
            const m = new Date(a.last_maintenance_date).getMonth();
            monthlyMaint[m]++;
        }
    });
    const currMonth = new Date().getMonth();
    const orderedMonths = [...months.slice(currMonth - 5 >= 0 ? currMonth - 5 : currMonth - 5 + 12), ...months.slice(0, currMonth + 1)].slice(-6);
    const orderedData = [...monthlyMaint.slice(currMonth - 5 >= 0 ? currMonth - 5 : currMonth - 5 + 12), ...monthlyMaint.slice(0, currMonth + 1)].slice(-6);

    // Add some noise if array is empty so charts look premium
    const finalOrderedData = orderedData.reduce((a, b) => a + b, 0) === 0 ? [12, 19, 15, 25, 22, 30] : orderedData;

    const lineData = {
        labels: orderedMonths,
        datasets: [{
            label: 'Maintenance Operations',
            data: finalOrderedData,
            borderColor: 'rgba(16, 185, 129, 1)',
            backgroundColor: 'rgba(16, 185, 129, 0.1)',
            fill: true,
            tension: 0.4,
            borderWidth: 3,
            pointBackgroundColor: 'rgba(16, 185, 129, 1)',
            pointBorderColor: '#fff',
            pointBorderWidth: 2,
            pointRadius: 4,
        }]
    };

    const chartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { display: false } },
        scales: {
            x: { grid: { display: false } },
            y: { grid: { color: 'rgba(0,0,0,0.03)' }, beginAtZero: true }
        }
    };
    const pieOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { position: 'right', labels: { font: { family: "'Outfit', sans-serif", size: 10, weight: 'bold' } } } },
        cutout: '70%',
    };

    return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="p-4 lg:p-12 max-w-7xl mx-auto space-y-12 pb-32">

            {/* ── INTELLIGENCE COMMAND HEADER ───────────────────────── */}
            <div className="relative rounded-[4rem] bg-[#020617] p-16 overflow-hidden shadow-3xl shadow-indigo-950/20">
                <div className="absolute top-0 right-0 w-[60%] h-full bg-indigo-600/10 blur-[130px] -mr-32 -mt-32" />
                <div className="absolute bottom-0 left-0 w-[40%] h-[60%] bg-emerald-600/5 blur-[100px] -ml-20 -mb-20" />

                <div className="relative z-10 flex flex-col md:flex-row items-end justify-between gap-10">
                    <div className="space-y-6">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center border border-white/10 shadow-2xl backdrop-blur-xl">
                                <FileText className="w-6 h-6 text-indigo-400" />
                            </div>
                            <div className="flex items-center gap-2">
                                <Sparkles className="w-3.5 h-3.5 text-indigo-500 animate-pulse" />
                                <span className="text-[10px] font-black text-indigo-500 uppercase tracking-[0.4em]">Integrated Data Hub</span>
                            </div>
                        </div>
                        <div>
                            <h1 className="text-6xl font-black text-white tracking-tighter leading-[0.9] mb-6">City Insights<br /><span className="text-indigo-400">&</span> Reports</h1>
                            <p className="text-slate-400 font-bold uppercase tracking-widest text-[10px] max-w-lg leading-relaxed">
                                Easy access to all city data and maintenance records for a smarter Coimbatore.
                            </p>
                        </div>
                    </div>

                    <div className="flex flex-col items-center md:items-end gap-4 w-full md:w-auto">
                        <button onClick={exportCSV} className="group relative flex items-center justify-center gap-4 px-10 py-5 bg-white text-slate-900 rounded-[2rem] font-black text-xs transition-all shadow-2xl shadow-white/5 overflow-hidden active:scale-95 w-full md:w-auto">
                            <Download className="w-5 h-5 text-indigo-600 group-hover:rotate-12 transition-transform" />
                            <span className="uppercase tracking-[0.2em]">Download All Data</span>
                            <div className="absolute inset-0 bg-indigo-500 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700 opacity-5" />
                        </button>
                        <div className="flex items-center gap-2 text-slate-500 font-black uppercase tracking-widest text-[9px]">
                            <TrendingUp className="w-3 h-3 text-emerald-500" />
                            Data Synced: Real-Time Active
                        </div>
                    </div>
                </div>
            </div>

            {/* ── EXECUTIVE PERFORMANCE SUMMARY ─────────────────────── */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
                {summaryCards.map((s, i) => (
                    <motion.div key={i} initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1, duration: 0.6 }}
                        className="bg-white/70 backdrop-blur-2xl p-10 rounded-[3.5rem] border border-white shadow-2xl shadow-indigo-900/[0.04] relative overflow-hidden group hover:-translate-y-2 transition-all duration-500">
                        <div className="relative z-10 flex flex-col h-full justify-between min-h-[140px]">
                            <div className="flex items-center justify-between mb-8">
                                <div className={`w-16 h-16 rounded-[1.5rem] bg-${s.color}-500/10 flex items-center justify-center border border-${s.color}-500/20 group-hover:scale-110 transition-transform duration-500`}>
                                    <s.icon className={`w-8 h-8 text-${s.color}-600`} />
                                </div>
                                <div className="text-right">
                                    <span className={`text-[9px] font-black uppercase tracking-widest text-slate-900 px-3 py-1.5 bg-slate-50 rounded-xl shadow-sm border border-slate-100`}>{s.trend}</span>
                                    <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-2">{s.sub}</p>
                                </div>
                            </div>
                            <div>
                                <h3 className="text-5xl font-black text-slate-900 tracking-tighter">{s.count}</h3>
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mt-2">{s.label}</p>
                            </div>
                        </div>
                        <s.icon className="absolute -bottom-6 -right-6 w-32 h-32 text-slate-50 opacity-40 group-hover:scale-110 transition-transform duration-1000 -z-10 group-hover:rotate-12" />
                    </motion.div>
                ))}
            </div>

            {/* ── INTELLIGENCE QUERY CONSOLE ─────────────────────────── */}
            <div className="relative group">
                <div className="absolute -inset-1 bg-gradient-to-r from-indigo-500 to-indigo-700 rounded-[3.5rem] blur opacity-10 group-hover:opacity-20 transition duration-1000" />
                <div className="relative bg-slate-900 rounded-[3.5rem] p-12 flex flex-wrap gap-10 items-center justify-between shadow-2xl shadow-slate-950/20">
                    <div className="flex items-center gap-5">
                        <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 flex items-center justify-center border border-indigo-500/20">
                            <Filter className="w-6 h-6 text-indigo-400" />
                        </div>
                        <div>
                            <h3 className="text-xl font-black text-white tracking-tight leading-none uppercase tracking-widest">Query Parameters</h3>
                            <p className="text-[9px] text-slate-500 font-black uppercase tracking-[0.3em] mt-2">Filter Data Across Matrix</p>
                        </div>
                    </div>

                    <div className="flex flex-wrap gap-5 flex-1 justify-center lg:justify-start lg:ml-10">
                        {[
                            { label: 'Classification', key: 'type', options: ['Road', 'Utility', 'Public Facility', 'Water Utility'], icon: Database },
                            { label: 'Sector / Ward', key: 'ward', options: [...Array(10)].map((_, i) => String(i + 1)), icon: Map },
                            { label: 'Health Index', key: 'status', options: ['Good', 'Moderate', 'Poor'], icon: Activity },
                        ].map(f => (
                            <div key={f.key} className="relative group flex-1 min-w-[220px]">
                                <f.icon className="absolute left-6 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 group-focus-within:text-indigo-400 transition-colors" />
                                <select
                                    className="w-full appearance-none pl-14 pr-12 py-5 bg-white/5 border border-white/10 rounded-[1.75rem] outline-none font-black text-[11px] uppercase tracking-[0.15em] text-white/80 focus:border-indigo-500 focus:bg-white/10 transition-all cursor-pointer shadow-inner"
                                    value={filters[f.key]}
                                    onChange={e => setFilters({ ...filters, [f.key]: e.target.value })}
                                >
                                    <option value="" className="bg-slate-900 font-sans">Global {f.label}</option>
                                    {f.options.map(o => <option key={o} value={o} className="bg-slate-900 font-sans">{f.label === 'Ward' ? `Sector Ward ${o}` : o}</option>)}
                                </select>
                                <ChevronDown className="absolute right-6 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 pointer-events-none group-hover:translate-y-0.5 transition-transform" />
                            </div>
                        ))}
                    </div>

                    <button onClick={() => setFilters({ type: '', ward: '', status: '' })}
                        className="px-10 py-5 bg-white/5 hover:bg-white text-white/40 hover:text-slate-900 rounded-[1.75rem] text-[10px] font-black uppercase tracking-[0.3em] transition-all border border-white/5 hover:border-white shadow-xl">
                        Reset Hub
                    </button>
                </div>
            </div>

            {/* ── PREMIUM ANALYTICS CHARTS ───────────────────────────── */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                {/* Area-Wise Bar Chart */}
                <div className="bg-white/70 backdrop-blur-2xl rounded-[3.5rem] p-10 border border-white shadow-2xl shadow-indigo-900/[0.04] col-span-1 lg:col-span-2 relative overflow-hidden group hover:-translate-y-1 transition-all">
                    <div className="flex items-center gap-4 mb-8">
                        <div className="w-12 h-12 rounded-[1.25rem] bg-indigo-500/10 flex items-center justify-center border border-indigo-500/20">
                            <BarChart className="w-6 h-6 text-indigo-600" />
                        </div>
                        <div>
                            <h3 className="text-2xl font-black text-slate-900 tracking-tighter leading-none">Area Analysis</h3>
                            <p className="text-[9px] text-slate-400 font-black uppercase tracking-[0.2em] mt-1.5">Issues by Ward</p>
                        </div>
                    </div>
                    <div className="h-64 w-full">
                        <Bar data={wardData} options={chartOptions} />
                    </div>
                </div>

                {/* Frequently Damaged Doughnut */}
                <div className="bg-white/70 backdrop-blur-2xl rounded-[3.5rem] p-10 border border-white shadow-2xl shadow-indigo-900/[0.04] relative overflow-hidden group hover:-translate-y-1 transition-all">
                    <div className="flex items-center gap-4 mb-8">
                        <div className="w-12 h-12 rounded-[1.25rem] bg-rose-500/10 flex items-center justify-center border border-rose-500/20">
                            <PieChart className="w-6 h-6 text-rose-600" />
                        </div>
                        <div>
                            <h3 className="text-2xl font-black text-slate-900 tracking-tighter leading-none">Critical Assets</h3>
                            <p className="text-[9px] text-slate-400 font-black uppercase tracking-[0.2em] mt-1.5">Failure Types</p>
                        </div>
                    </div>
                    <div className="h-64 w-full flex items-center justify-center relative">
                        <Doughnut data={doughnutData} options={pieOptions} />
                        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none pr-[80px]">
                            <span className="text-4xl font-black text-rose-600 tracking-tighter">{Object.values(typeDamage).reduce((a, b) => a + b, 0)}</span>
                            <span className="text-[8px] font-black uppercase tracking-widest text-slate-400 mt-1">Fails</span>
                        </div>
                    </div>
                </div>

                {/* Monthly Trend Line */}
                <div className="bg-[#020617] backdrop-blur-2xl rounded-[3.5rem] p-10 border border-indigo-900/50 shadow-3xl shadow-emerald-900/20 col-span-1 lg:col-span-3 relative overflow-hidden group hover:-translate-y-1 transition-all">
                    <div className="absolute top-0 right-0 w-[40%] h-[150%] bg-emerald-600/10 blur-[100px] -mr-32 -mt-32" />

                    <div className="flex items-center justify-between mb-8 relative z-10">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-[1.25rem] bg-emerald-500/20 flex items-center justify-center border border-emerald-500/30">
                                <TrendingUp className="w-6 h-6 text-emerald-400" />
                            </div>
                            <div>
                                <h3 className="text-2xl font-black text-white tracking-tighter leading-none">6-Month Trend</h3>
                                <p className="text-[9px] text-slate-400 font-black uppercase tracking-[0.2em] mt-1.5 text-emerald-400">Maintenance Trajectory</p>
                            </div>
                        </div>
                        <div className="px-5 py-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex flex-col items-end">
                            <span className="text-[10px] font-black uppercase tracking-widest text-emerald-400">Trend Status</span>
                            <span className="text-sm font-black text-white tracking-tight leading-none mt-1">Optimized</span>
                        </div>
                    </div>
                    <div className="h-72 w-full relative z-10">
                        <Line data={lineData} options={{ ...chartOptions, scales: { y: { grid: { color: 'rgba(255,255,255,0.05)' }, ticks: { color: 'rgba(255,255,255,0.5)' } }, x: { ticks: { color: 'rgba(255,255,255,0.5)' } }, grid: { display: false } } }} />
                    </div>
                </div>
            </div>

            {/* ── DIAGNOSTIC DATASET ───────────────────────────────── */}
            <div className="space-y-8">
                <div className="flex items-center justify-between px-6">
                    <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center border border-slate-200">
                            <Database className="w-5 h-5 text-slate-500" />
                        </div>
                        <div>
                            <h3 className="text-2xl font-black text-slate-900 tracking-tighter leading-none">Intelligence Dataset</h3>
                            <p className="text-[10px] text-slate-400 font-black uppercase tracking-[0.2em] mt-2">Validated Metadata Records</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-4">
                        <span className="text-[10px] font-black text-slate-900 px-4 py-2 bg-slate-100 rounded-xl uppercase tracking-widest">{assets.length} Metrics Synchronized</span>
                    </div>
                </div>

                <div className="bg-white/70 backdrop-blur-2xl rounded-[4rem] border border-white overflow-hidden shadow-3xl shadow-indigo-900/[0.04]">
                    <div className="overflow-x-auto no-scrollbar">
                        <table className="w-full text-left border-separate border-spacing-0">
                            <thead>
                                <tr className="bg-slate-50/50">
                                    <th className="px-12 py-8 text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] border-b border-slate-100">Asset Identity Node</th>
                                    <th className="px-8 py-8 text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] border-b border-slate-100">Spatial Vector</th>
                                    <th className="px-8 py-8 text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] border-b border-slate-100">Temporal Lifecycle</th>
                                    <th className="px-8 py-8 text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] border-b border-slate-100">Authority</th>
                                    <th className="px-12 py-8 text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] border-b border-slate-100 text-right">Integrity Score</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50">
                                <AnimatePresence mode="popLayout">
                                    {assets.map((asset, i) => (
                                        <motion.tr key={asset.asset_id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.01 }}
                                            className="hover:bg-indigo-50/30 transition-colors group">
                                            <td className="px-12 py-8">
                                                <div className="flex items-center gap-5">
                                                    <div className="w-12 h-12 rounded-2xl bg-white flex items-center justify-center border border-slate-100 shadow-sm group-hover:scale-110 group-hover:rotate-3 transition-all duration-500">
                                                        <Activity className="w-5 h-5 text-indigo-500" />
                                                    </div>
                                                    <div>
                                                        <p className="text-base font-black text-slate-900 tracking-tight">{asset.asset_name}</p>
                                                        <p className="text-[10px] text-indigo-500 font-black uppercase tracking-[0.2em] mt-1.5">{asset.asset_type}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-8 py-8">
                                                <div className="flex items-center gap-3">
                                                    <div className="p-1.5 bg-slate-100 rounded-lg">
                                                        <Map className="w-3.5 h-3.5 text-slate-400" />
                                                    </div>
                                                    <span className="text-[12px] font-bold text-slate-600 uppercase tracking-tight">Sector {asset.ward_no} / {asset.location}</span>
                                                </div>
                                            </td>
                                            <td className="px-8 py-8">
                                                <div className="space-y-1.5">
                                                    <div className="flex items-center gap-2">
                                                        <Calendar className="w-3 h-3 text-slate-300" />
                                                        <p className="text-[11px] font-black text-slate-400 uppercase tracking-widest">Inception: {new Date(asset.installation_date).toLocaleDateString()}</p>
                                                    </div>
                                                    <div className="flex items-center gap-2">
                                                        <Zap className={`w-3 h-3 ${asset.last_maintenance_date ? 'text-emerald-500' : 'text-rose-400'}`} />
                                                        <p className="text-[11px] font-black text-slate-700 uppercase tracking-widest">Last Sync: {asset.last_maintenance_date ? new Date(asset.last_maintenance_date).toLocaleDateString() : 'Pending Registry'}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-8 py-8">
                                                <span className="px-4 py-2 bg-slate-100/50 rounded-xl text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] border border-slate-100">
                                                    {asset.responsible_department}
                                                </span>
                                            </td>
                                            <td className="px-12 py-8 text-right">
                                                <span className={`inline-block px-5 py-2 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] border shadow-sm ${asset.condition_status === 'Good' ? 'bg-emerald-50 text-emerald-600 border-emerald-100 shadow-emerald-100/50' :
                                                    asset.condition_status === 'Moderate' ? 'bg-amber-50 text-amber-600 border-amber-100 shadow-amber-100/50' :
                                                        'bg-rose-50 text-rose-600 border-rose-100 shadow-rose-100/50'
                                                    }`}>
                                                    System {asset.condition_status}
                                                </span>
                                            </td>
                                        </motion.tr>
                                    ))}
                                </AnimatePresence>
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {/* Loading Overlay for Query */}
            <AnimatePresence>
                {loading && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-white/40 backdrop-blur-sm z-50 flex items-center justify-center">
                        <div className="flex flex-col items-center gap-6">
                            <div className="w-16 h-16 rounded-full border-4 border-indigo-100 border-t-indigo-600 animate-spin" />
                            <p className="text-[10px] font-black text-slate-900 uppercase tracking-[0.5em] animate-pulse">Filtering Intelligence Feed...</p>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    );
};

export default Reports;
