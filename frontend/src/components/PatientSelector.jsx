import React, { useState, useEffect } from 'react';
import { fetchPatients, registerClinicPatient, fetchAlerts, markAlertRead } from '../utils/api';

export default function PatientSelector({ onSelectPatient, onBackToHome }) {
    const [patients, setPatients] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [isRegistering, setIsRegistering] = useState(false);
    const [formData, setFormData] = useState({ username: '', password: '', name: '', age: '' });
    const [registerError, setRegisterError] = useState('');
    const [alerts, setAlerts] = useState([]);

    const loadPatientsAndAlerts = async () => {
        setLoading(true);
        try {
            const [patientsData, alertsData] = await Promise.all([
                fetchPatients(),
                fetchAlerts()
            ]);
            setPatients(patientsData);
            setAlerts(alertsData);
        } catch (err) {
            setError('Failed to load clinic data.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadPatientsAndAlerts();
    }, []);

    const handleRegister = async (e) => {
        e.preventDefault();
        setRegisterError('');
        try {
            await registerClinicPatient({
                ...formData,
                age: formData.age ? parseInt(formData.age, 10) : null
            });
            setIsRegistering(false);
            setFormData({ username: '', password: '', name: '', age: '' });
            await loadPatientsAndAlerts(); // Refresh list
        } catch (err) {
            setRegisterError(err.message || 'Registration failed');
        }
    };

    const handleDismissAlert = async (alertId) => {
        try {
            await markAlertRead(alertId);
            setAlerts(alerts.filter(a => a._id !== alertId));
        } catch (err) {
            console.error(err);
        }
    };

    if (loading) {
        return (
            <div className="w-full flex-1 flex flex-col items-center justify-center min-h-[50vh]">
                <div className="w-16 h-16 border-4 border-teal-500/30 border-t-teal-500 rounded-full animate-spin mb-4"></div>
                <p className="text-slate-400 font-medium tracking-widest uppercase">Loading Patients...</p>
            </div>
        );
    }

    return (
        <div className="w-full max-w-5xl mx-auto animate-fade-in flex flex-col pt-10">
            <header className="mb-10 flex items-center justify-between">
                <div>
                    <h2 className="text-4xl font-black text-white tracking-tight mb-2">Clinic Patient Hub</h2>
                    <p className="text-slate-400 text-lg">Manage your clinic's patients or view their cognitive telemetries.</p>
                </div>
                <button 
                    onClick={() => setIsRegistering(true)}
                    className="px-6 py-3 bg-teal-500 hover:bg-teal-400 text-slate-900 font-bold rounded-xl transition-all shadow-lg shadow-teal-500/20 active:scale-95"
                >
                    + Register New Patient
                </button>
            </header>

            {/* Registration Modal */}
            {isRegistering && (
                <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-slate-800 border border-white/10 rounded-3xl p-8 max-w-md w-full shadow-2xl relative">
                        <button 
                            onClick={() => setIsRegistering(false)}
                            className="absolute top-4 right-4 text-slate-400 hover:text-white"
                        >
                            ✕
                        </button>
                        <h3 className="text-2xl font-bold text-white mb-6">Register Patient</h3>
                        {registerError && <div className="bg-rose-500/10 text-rose-400 p-3 rounded-lg text-sm mb-4">{registerError}</div>}
                        <form onSubmit={handleRegister} className="flex flex-col gap-4">
                            <div>
                                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1 block">Full Name</label>
                                <input required type="text" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full bg-slate-900/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-teal-500" placeholder="e.g. Timmy Smith" />
                            </div>
                            <div>
                                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1 block">Age</label>
                                <input type="number" value={formData.age} onChange={e => setFormData({...formData, age: e.target.value})} className="w-full bg-slate-900/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-teal-500" placeholder="Optional" />
                            </div>
                            <div>
                                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1 block">System Username</label>
                                <input required type="text" value={formData.username} onChange={e => setFormData({...formData, username: e.target.value})} className="w-full bg-slate-900/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-teal-500" placeholder="Unique ID" />
                            </div>
                            <div>
                                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1 block">Temporary Password</label>
                                <input required type="password" value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} className="w-full bg-slate-900/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-teal-500" placeholder="••••••••" />
                            </div>
                            <button type="submit" className="w-full bg-teal-500 hover:bg-teal-400 text-slate-900 font-bold py-4 rounded-xl mt-4 transition-colors">
                                Add Patient to Clinic
                            </button>
                        </form>
                    </div>
                </div>
            )}

            {/* Alerts Section */}
            {alerts.length > 0 && (
                <div className="mb-10">
                    <h3 className="text-xl font-bold text-rose-400 mb-4 flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse"></span>
                        Clinical Regression Alerts
                    </h3>
                    <div className="flex flex-col gap-3">
                        {alerts.map(alert => (
                            <div key={alert._id} className="bg-rose-500/10 border border-rose-500/20 rounded-xl p-4 flex items-center justify-between">
                                <div>
                                    <span className="font-bold text-white">Patient @{alert.patient_username}</span>
                                    <span className="text-slate-400 mx-2">•</span>
                                    <span className="text-rose-200">
                                        Critical drop in <strong className="text-white">{alert.metric_name}</strong> 
                                        (From {alert.previous_score} &rarr; {alert.new_score})
                                    </span>
                                </div>
                                <button 
                                    onClick={() => handleDismissAlert(alert._id)}
                                    className="px-3 py-1 bg-rose-500/20 hover:bg-rose-500/40 text-rose-300 rounded-lg text-sm font-bold transition-colors"
                                >
                                    Acknowledge
                                </button>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {error ? (
                <div className="bg-rose-500/10 text-rose-400 p-6 rounded-2xl border border-rose-500/20 mb-8">
                    {error}
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {patients.length === 0 ? (
                        <div className="col-span-full text-center py-12 bg-slate-900/50 backdrop-blur-xl rounded-3xl border border-white/5">
                            <div className="text-4xl mb-4">📭</div>
                            <h3 className="text-xl font-bold text-white mb-2">No Patients Found</h3>
                            <p className="text-slate-400">There are currently no patients registered in the system.</p>
                        </div>
                    ) : (
                        patients.map((patient) => (
                            <div 
                                key={patient.username}
                                onClick={() => onSelectPatient(patient.username)}
                                className="group cursor-pointer bg-slate-900/50 backdrop-blur-xl border border-white/10 p-6 rounded-3xl transition-all hover:-translate-y-2 hover:bg-white/10 hover:border-teal-500/50 hover:shadow-[0_8px_32px_rgba(20,184,166,0.2)] text-left flex flex-col relative overflow-hidden"
                            >
                                <div className="absolute top-0 right-0 w-32 h-32 bg-teal-500/10 blur-3xl rounded-full mix-blend-screen pointer-events-none group-hover:bg-teal-500/20 transition-all"></div>
                                
                                <div className="flex items-center gap-4 mb-4">
                                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-teal-500 to-emerald-600 flex items-center justify-center text-white font-bold text-lg shadow-lg">
                                        {(patient.name || patient.username).charAt(0).toUpperCase()}
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-bold text-white">{patient.name || patient.username}</h3>
                                        <p className="text-slate-400 text-xs font-mono">@{patient.username}</p>
                                    </div>
                                </div>
                                
                                <div className="mt-4 flex items-center justify-between">
                                    <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Age: {patient.age || 'N/A'}</span>
                                    <span className="text-teal-400 font-bold text-sm group-hover:text-teal-300 transition-colors">View Profile &rarr;</span>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            )}
        </div>
    );
}
