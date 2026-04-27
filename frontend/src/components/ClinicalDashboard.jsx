import React, { useState, useEffect } from 'react';
import { fetchCognitiveProfile } from '../utils/api';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer } from 'recharts';

export default function ClinicalDashboard({ onBackToHome, childId = "test_user_01" }) {
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const loadProfile = async () => {
            try {
                setLoading(true);
                const data = await fetchCognitiveProfile(childId);
                setProfile(data);
            } catch (err) {
                setError("Failed to load cognitive profile. Make sure the child has played a game session first.");
            } finally {
                setLoading(false);
            }
        };

        loadProfile();
    }, [childId]);

    // Map string scores to numerical values for the Radar Chart
    const mapScoreToValue = (score) => {
        if (score === "High") return 90;
        if (score === "Normal") return 50;
        if (score === "Low") return 20;
        return 0;
    };

    const chartData = profile ? [
        { subject: 'Sustained Attention', A: mapScoreToValue(profile.attention_score), fullMark: 100 },
        { subject: 'Impulse Control', A: mapScoreToValue(profile.impulsivity_score) === 90 ? 20 : (mapScoreToValue(profile.impulsivity_score) === 20 ? 90 : (profile.impulsivity_score ? 50 : 0)), fullMark: 100 }, // Invert impulsivity for graph (High impulsivity = low score)
        { subject: 'Working Memory', A: mapScoreToValue(profile.working_memory_score), fullMark: 100 },
        { subject: 'Processing Speed', A: mapScoreToValue(profile.processing_speed_score), fullMark: 100 },
        { subject: 'Cognitive Flexibility', A: mapScoreToValue(profile.cognitive_flexibility_score), fullMark: 100 },
    ] : [];

    if (loading) {
        return (
            <div className="w-full flex-1 flex flex-col items-center justify-center min-h-[50vh]">
                <div className="w-16 h-16 border-4 border-blue-500/30 border-t-blue-500 rounded-full animate-spin mb-4"></div>
                <p className="text-slate-400 font-medium tracking-widest uppercase">Loading Profile...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="w-full max-w-2xl mx-auto flex flex-col items-center justify-center min-h-[50vh] text-center">
                <div className="w-20 h-20 bg-rose-500/10 rounded-full flex items-center justify-center mb-6">
                    <svg className="w-10 h-10 text-rose-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path></svg>
                </div>
                <h3 className="text-2xl font-bold text-white mb-2">No Profile Found</h3>
                <p className="text-slate-400 mb-8">{error}</p>
                <button onClick={onBackToHome} className="px-6 py-3 bg-white/5 hover:bg-white/10 text-white rounded-xl transition font-semibold">
                    Return to Dashboard
                </button>
            </div>
        );
    }

    return (
        <div className="w-full max-w-5xl mx-auto animate-fade-in flex flex-col">
            <header className="mb-10 flex items-center justify-between">
                <div>
                    <h2 className="text-4xl font-black text-white tracking-tight mb-2">Clinical Dashboard</h2>
                    <p className="text-slate-400 text-lg flex items-center gap-2">
                        Patient ID: <span className="text-blue-400 font-mono bg-blue-500/10 px-2 py-0.5 rounded">{profile.child_id}</span>
                    </p>
                </div>
                <div className="text-right">
                    <p className="text-sm text-slate-500 mb-1">Report Generated</p>
                    <p className="text-slate-300 font-medium">
                        {new Date(profile.generated_at).toLocaleString()}
                    </p>
                </div>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 object-stretch">

                {/* Visualizer Card */}
                <div className="lg:col-span-7 bg-slate-900/50 backdrop-blur-3xl border border-white/5 rounded-3xl p-8 relative overflow-hidden shadow-2xl flex flex-col">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/10 blur-3xl rounded-full mix-blend-screen pointer-events-none"></div>

                    <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-3">
                        <svg className="w-6 h-6 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path></svg>
                        Cognitive Profile Mapping
                    </h3>

                    <div className="w-full h-[400px] flex-1">
                        <ResponsiveContainer width="100%" height="100%">
                            <RadarChart cx="50%" cy="50%" outerRadius="70%" data={chartData}>
                                <PolarGrid stroke="#334155" />
                                <PolarAngleAxis dataKey="subject" tick={{ fill: '#94a3b8', fontSize: 13, fontWeight: 600 }} />
                                <PolarRadiusAxis angle={30} domain={[0, 100]} tick={{ fill: '#475569' }} axisLine={false} />
                                <Radar name="Patient" dataKey="A" stroke="#3b82f6" strokeWidth={3} fill="#3b82f6" fillOpacity={0.4} />
                            </RadarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* AI Prescriptions & Scores */}
                <div className="lg:col-span-5 flex flex-col gap-6">

                    {/* Top Level Scores */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="bg-gradient-to-br from-slate-800 to-slate-900 border border-white/5 rounded-2xl p-5 shadow-lg flex flex-col justify-center">
                            <span className="text-xs font-bold text-slate-500 uppercase tracking-widest block mb-2">Attention</span>
                            <span className={`text-2xl font-black ${profile.attention_score === 'High' ? 'text-emerald-400' : (profile.attention_score === 'Low' ? 'text-rose-400' : (profile.attention_score ? 'text-blue-400' : 'text-slate-600'))}`}>
                                {profile.attention_score || 'N/A'}
                            </span>
                        </div>
                        <div className="bg-gradient-to-br from-slate-800 to-slate-900 border border-white/5 rounded-2xl p-5 shadow-lg flex flex-col justify-center">
                            <span className="text-xs font-bold text-slate-500 uppercase tracking-widest block mb-2">Impulsivity</span>
                            <span className={`text-2xl font-black ${profile.impulsivity_score === 'Low' ? 'text-emerald-400' : (profile.impulsivity_score === 'High' ? 'text-rose-400' : (profile.impulsivity_score ? 'text-blue-400' : 'text-slate-600'))}`}>
                                {profile.impulsivity_score || 'N/A'}
                            </span>
                        </div>
                        <div className="bg-gradient-to-br from-slate-800 to-slate-900 border border-white/5 rounded-2xl p-5 shadow-lg flex flex-col justify-center">
                            <span className="text-xs font-bold text-slate-500 uppercase tracking-widest block mb-2">Working Memory</span>
                            <span className={`text-2xl font-black ${profile.working_memory_score === 'High' ? 'text-emerald-400' : (profile.working_memory_score === 'Low' ? 'text-rose-400' : (profile.working_memory_score ? 'text-blue-400' : 'text-slate-600'))}`}>
                                {profile.working_memory_score || 'N/A'}
                            </span>
                        </div>
                        <div className="bg-gradient-to-br from-slate-800 to-slate-900 border border-white/5 rounded-2xl p-5 shadow-lg flex flex-col justify-center">
                            <span className="text-xs font-bold text-slate-500 uppercase tracking-widest block mb-2">Flexibility</span>
                            <span className={`text-2xl font-black ${profile.cognitive_flexibility_score === 'High' ? 'text-emerald-400' : (profile.cognitive_flexibility_score === 'Low' ? 'text-rose-400' : (profile.cognitive_flexibility_score ? 'text-blue-400' : 'text-slate-600'))}`}>
                                {profile.cognitive_flexibility_score || 'N/A'}
                            </span>
                        </div>
                        <div className="col-span-2 bg-gradient-to-br from-slate-800 to-slate-900 border border-white/5 rounded-2xl p-5 shadow-lg flex items-center justify-between">
                            <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">Processing Speed</span>
                            <span className={`text-2xl font-black ${profile.processing_speed_score === 'High' ? 'text-emerald-400' : (profile.processing_speed_score === 'Low' ? 'text-rose-400' : (profile.processing_speed_score ? 'text-blue-400' : 'text-slate-600'))}`}>
                                {profile.processing_speed_score || 'N/A'}
                            </span>
                        </div>
                    </div>

                    {/* AI Prescriptions List */}
                    <div className="bg-indigo-900/20 backdrop-blur-xl border border-indigo-500/20 rounded-3xl p-6 shadow-xl flex-1 flex flex-col">
                        <h3 className="text-xl font-bold text-indigo-300 mb-6 flex items-center gap-2">
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z"></path></svg>
                            AI Prescriptions
                        </h3>

                        <div className="space-y-4 flex-1 overflow-y-auto max-h-[300px] pr-2 custom-scrollbar">
                            {profile.recommendations && profile.recommendations.length > 0 ? profile.recommendations.map((rec, idx) => (
                                <div key={idx} className="bg-slate-900/60 rounded-xl p-4 flex gap-3 border border-indigo-500/10">
                                    <div className="mt-1 flex-shrink-0">
                                        <div className="w-2 h-2 rounded-full bg-indigo-400 mt-1.5"></div>
                                    </div>
                                    <p className="text-slate-300 leading-relaxed text-sm">{rec}</p>
                                </div>
                            )) : (
                                <div className="text-slate-500 italic text-sm text-center py-8">Complete a module to generate AI prescriptions.</div>
                            )}
                        </div>

                        <button
                            className="w-full mt-6 py-3 rounded-xl bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-300 border border-indigo-500/30 font-semibold transition-colors flex items-center justify-center gap-2"
                        >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2-2v4h10z"></path></svg>
                            Print Report
                        </button>
                    </div>

                </div>
            </div>

            <div className="mt-8 flex justify-center">
                <button onClick={onBackToHome} className="px-8 py-3 bg-white/5 hover:bg-white/10 text-white rounded-xl transition font-semibold border border-white/10">
                    Return to Selection
                </button>
            </div>
        </div>
    );
}
