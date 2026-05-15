import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';

export default function Register({ onNavigateToLogin, onRegisterSuccess }) {
    const { register } = useAuth();
    const [formData, setFormData] = useState({
        username: '',
        password: '',
        name: '',
        age: '',
        role: 'patient'
    });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            const payload = {
                ...formData,
                age: formData.age ? parseInt(formData.age) : null
            };
            await register(payload);
            onRegisterSuccess();
        } catch (err) {
            setError(err.message || 'Failed to register');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="w-full flex-1 flex flex-col items-center justify-center animate-fade-in p-4 py-12">
            <div className="bg-slate-900/60 backdrop-blur-3xl border border-white/10 p-10 rounded-[3rem] shadow-2xl w-full max-w-md relative overflow-hidden">
                <div className="absolute top-[-50%] right-[-50%] w-[200%] h-[200%] bg-gradient-to-bl from-emerald-500/10 to-teal-500/10 blur-3xl pointer-events-none rounded-full"></div>
                
                <div className="relative z-10">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 mb-6 shadow-lg">
                        <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z"></path></svg>
                    </div>
                    
                    <h2 className="text-3xl font-black text-white tracking-tight mb-2">Create Account</h2>
                    <p className="text-slate-400 mb-8">Join CogniTrack today.</p>

                    {error && <div className="bg-rose-500/20 text-rose-300 px-4 py-3 rounded-xl mb-6 text-sm font-medium border border-rose-500/30">{error}</div>}

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="col-span-2">
                                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Username</label>
                                <input type="text" name="username" required value={formData.username} onChange={handleChange} className="w-full bg-slate-950 border border-white/10 rounded-2xl px-5 py-3 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all placeholder:text-slate-600" placeholder="Unique username" />
                            </div>
                            <div className="col-span-2">
                                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Password</label>
                                <input type="password" name="password" required value={formData.password} onChange={handleChange} className="w-full bg-slate-950 border border-white/10 rounded-2xl px-5 py-3 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all placeholder:text-slate-600" placeholder="••••••••" />
                            </div>
                            <div className="col-span-2 sm:col-span-1">
                                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Full Name</label>
                                <input type="text" name="name" required value={formData.name} onChange={handleChange} className="w-full bg-slate-950 border border-white/10 rounded-2xl px-5 py-3 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all placeholder:text-slate-600" placeholder="Jane Doe" />
                            </div>
                            <div className="col-span-2 sm:col-span-1">
                                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Age</label>
                                <input type="number" name="age" required value={formData.age} onChange={handleChange} className="w-full bg-slate-950 border border-white/10 rounded-2xl px-5 py-3 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all placeholder:text-slate-600" placeholder="10" />
                            </div>
                            <div className="col-span-2">
                                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Account Type</label>
                                <select name="role" value={formData.role} onChange={handleChange} className="w-full bg-slate-950 border border-white/10 rounded-2xl px-5 py-3 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all appearance-none cursor-pointer">
                                    <option value="patient">Patient / Child</option>
                                    <option value="clinician">Clinician / Parent</option>
                                </select>
                            </div>
                        </div>
                        
                        <button type="submit" disabled={loading} className="w-full py-4 mt-6 bg-gradient-to-r from-emerald-500 to-teal-600 rounded-2xl font-bold text-white shadow-lg shadow-emerald-500/30 transition-all hover:scale-[1.02] active:scale-95 disabled:opacity-50">
                            {loading ? 'Creating Account...' : 'Register'}
                        </button>
                    </form>
                    
                    <div className="mt-8 text-center">
                        <p className="text-slate-400 text-sm">
                            Already have an account?{' '}
                            <button onClick={onNavigateToLogin} className="text-emerald-400 font-bold hover:text-emerald-300 transition-colors">
                                Sign In
                            </button>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
