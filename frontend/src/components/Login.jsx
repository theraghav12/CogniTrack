import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';

export default function Login({ onNavigateToRegister, onLoginSuccess }) {
    const { login } = useAuth();
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            await login(username, password);
            onLoginSuccess();
        } catch (err) {
            setError(err.message || 'Failed to login');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="w-full flex-1 flex flex-col items-center justify-center animate-fade-in p-4">
            <div className="bg-slate-900/60 backdrop-blur-3xl border border-white/10 p-10 rounded-[3rem] shadow-2xl w-full max-w-md relative overflow-hidden">
                <div className="absolute top-[-50%] right-[-50%] w-[200%] h-[200%] bg-gradient-to-br from-indigo-500/10 to-purple-500/10 blur-3xl pointer-events-none rounded-full"></div>
                
                <div className="relative z-10">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 mb-6 shadow-lg">
                        <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8V7a4 4 0 00-8 0v4h8z"></path></svg>
                    </div>
                    
                    <h2 className="text-3xl font-black text-white tracking-tight mb-2">Welcome Back</h2>
                    <p className="text-slate-400 mb-8">Sign in to continue to CogniTrack.</p>

                    {error && <div className="bg-rose-500/20 text-rose-300 px-4 py-3 rounded-xl mb-6 text-sm font-medium border border-rose-500/30">{error}</div>}

                    <form onSubmit={handleSubmit} className="space-y-5">
                        <div>
                            <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Username</label>
                            <input 
                                type="text"
                                required
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                className="w-full bg-slate-950 border border-white/10 rounded-2xl px-5 py-4 text-white focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all placeholder:text-slate-600"
                                placeholder="Enter your username"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Password</label>
                            <input 
                                type="password"
                                required
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full bg-slate-950 border border-white/10 rounded-2xl px-5 py-4 text-white focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all placeholder:text-slate-600"
                                placeholder="••••••••"
                            />
                        </div>
                        
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full py-4 mt-4 bg-gradient-to-r from-purple-500 to-indigo-600 rounded-2xl font-bold text-white shadow-lg shadow-purple-500/30 transition-all hover:scale-[1.02] active:scale-95 disabled:opacity-50"
                        >
                            {loading ? 'Signing in...' : 'Sign In'}
                        </button>
                    </form>
                    
                    <div className="mt-8 text-center">
                        <p className="text-slate-400 text-sm">
                            Don't have an account?{' '}
                            <button onClick={onNavigateToRegister} className="text-purple-400 font-bold hover:text-purple-300 transition-colors">
                                Register Here
                            </button>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
