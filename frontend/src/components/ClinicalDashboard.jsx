import React, { useState, useEffect, useRef } from 'react';
import { fetchCognitiveProfile, fetchCognitiveHistory, fetchGameSessions } from '../utils/api';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';

export default function ClinicalDashboard({ onBackToHome, childId = "test_user_01" }) {
    const [profile, setProfile] = useState(null);
    const [history, setHistory] = useState([]);
    const [sessions, setSessions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const componentRef = useRef();

    const handlePrint = () => {
        window.print();
    };

    useEffect(() => {
        const loadData = async () => {
            try {
                setLoading(true);
                const [profileData, historyData, sessionsData] = await Promise.all([
                    fetchCognitiveProfile(childId),
                    fetchCognitiveHistory(childId),
                    fetchGameSessions(childId)
                ]);
                setProfile(profileData);
                setHistory(historyData);
                setSessions(sessionsData);
            } catch (err) {
                setError("Failed to load cognitive data. Make sure the child has played a game session first.");
            } finally {
                setLoading(false);
            }
        };

        loadData();
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

    const lineChartData = history.map((item, index) => {
        const date = new Date(item.generated_at);
        return {
            name: `Session ${index + 1} (${date.toLocaleDateString()})`,
            Attention: mapScoreToValue(item.attention_score),
            'Working Memory': mapScoreToValue(item.working_memory_score),
            'Processing Speed': mapScoreToValue(item.processing_speed_score),
            Flexibility: mapScoreToValue(item.cognitive_flexibility_score),
        };
    });

    const getGameNameAndScore = (session) => {
        if (session.max_span !== undefined) return { name: "Memory Span", score: `Max Span: ${session.max_span}`, icon: "🧩", color: "text-purple-400" };
        if (session.accuracy_rate !== undefined) return { name: "Shape Shifter", score: `Accuracy: ${(session.accuracy_rate * 100).toFixed(0)}%`, icon: "✨", color: "text-amber-400" };
        if (session.completion_time_ms !== undefined) return { name: "Connect Stars", score: `Errors: ${session.errors_made}`, icon: "✨", color: "text-fuchsia-400" };
        return { name: "Go / No-Go", score: `Omissions: ${session.omission_errors}`, icon: "🎯", color: "text-blue-400" };
    };

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
        <div className="w-full flex-1">
            <style type="text/css" media="print">
                {`
                  @page { size: letter; margin: 0.75in; }
                  body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
                `}
            </style>
            
            {/* --- INTERACTIVE DARK DASHBOARD (Hidden when printing) --- */}
            <div className="w-full max-w-5xl mx-auto animate-fade-in flex flex-col print:hidden" ref={componentRef}>
                <header className="mb-10 flex flex-wrap items-center justify-between gap-4">
                <div>
                    <h2 className="text-4xl font-black text-white tracking-tight mb-2">Clinical Dashboard</h2>
                    <p className="text-slate-400 text-lg flex items-center gap-2">
                        Patient ID: <span className="text-blue-400 font-mono bg-blue-500/10 px-2 py-0.5 rounded">{profile.child_id}</span>
                    </p>
                </div>
                <div className="flex items-center gap-6">
                    <div className="text-right hidden sm:block">
                        <p className="text-sm text-slate-500 mb-1">Report Generated</p>
                        <p className="text-slate-300 font-medium">
                            {new Date(profile.generated_at + (!profile.generated_at.endsWith('Z') ? 'Z' : '')).toLocaleString()}
                        </p>
                    </div>
                    <button 
                        onClick={handlePrint}
                        className="no-print flex items-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white px-5 py-2.5 rounded-xl font-bold shadow-lg shadow-blue-500/20 transition-all hover:-translate-y-1"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>
                        Download PDF
                    </button>
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
            
            {/* Longitudinal Tracking Line Chart */}
            <div className="mt-8 bg-slate-900/50 backdrop-blur-3xl border border-white/5 rounded-3xl p-8 relative overflow-hidden shadow-2xl flex flex-col">
                <div className="absolute top-[-50%] right-[-50%] w-[100%] h-[100%] bg-purple-500/10 blur-3xl rounded-full mix-blend-screen pointer-events-none"></div>

                <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-3">
                    <svg className="w-6 h-6 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z"></path></svg>
                    Longitudinal Cognitive History
                </h3>

                {lineChartData.length < 2 ? (
                    <div className="flex flex-col items-center justify-center p-8 bg-slate-800/30 rounded-2xl border border-slate-700/50">
                        <span className="text-4xl mb-4">📉</span>
                        <p className="text-slate-400 text-center max-w-md">The patient needs to complete at least two full game sessions to generate a meaningful historical progression chart.</p>
                    </div>
                ) : (
                    <div className="w-full h-[400px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={lineChartData} margin={{ top: 20, right: 30, left: 0, bottom: 0 }}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.5} />
                                <XAxis dataKey="name" stroke="#94a3b8" tick={{ fill: '#94a3b8' }} />
                                <YAxis domain={[0, 100]} stroke="#94a3b8" tick={{ fill: '#94a3b8' }} />
                                <Tooltip 
                                    contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '1rem', color: '#f8fafc' }}
                                    itemStyle={{ fontWeight: 600 }}
                                />
                                <Legend wrapperStyle={{ paddingTop: '20px' }} />
                                <Line type="monotone" dataKey="Attention" stroke="#3b82f6" strokeWidth={3} dot={{ r: 6, fill: '#3b82f6', stroke: '#0f172a', strokeWidth: 2 }} activeDot={{ r: 8 }} />
                                <Line type="monotone" dataKey="Working Memory" stroke="#a855f7" strokeWidth={3} dot={{ r: 6, fill: '#a855f7', stroke: '#0f172a', strokeWidth: 2 }} activeDot={{ r: 8 }} />
                                <Line type="monotone" dataKey="Processing Speed" stroke="#d946ef" strokeWidth={3} dot={{ r: 6, fill: '#d946ef', stroke: '#0f172a', strokeWidth: 2 }} activeDot={{ r: 8 }} />
                                <Line type="monotone" dataKey="Flexibility" stroke="#f59e0b" strokeWidth={3} dot={{ r: 6, fill: '#f59e0b', stroke: '#0f172a', strokeWidth: 2 }} activeDot={{ r: 8 }} />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                )}
            </div>

            {/* Raw Game Sessions Log */}
            <div className="mt-8 bg-slate-900/50 backdrop-blur-3xl border border-white/5 rounded-3xl p-8 shadow-2xl flex flex-col mb-16">
                <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-3">
                    <svg className="w-6 h-6 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                    Raw Game Session Logs
                </h3>

                {sessions.length === 0 ? (
                    <p className="text-slate-400 text-center py-8">No game sessions recorded yet.</p>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="border-b border-white/10 text-slate-400 text-sm">
                                    <th className="pb-4 font-semibold pl-4">Date & Time</th>
                                    <th className="pb-4 font-semibold">Module Played</th>
                                    <th className="pb-4 font-semibold">Key Metric</th>
                                </tr>
                            </thead>
                            <tbody>
                                {sessions.map((session, idx) => {
                                    const { name, score, icon, color } = getGameNameAndScore(session);
                                    return (
                                        <tr key={idx} className="border-b border-white/5 hover:bg-white/5 transition-colors group">
                                            <td className="py-4 pl-4 text-slate-300 text-sm">
                                                {new Date(session.timestamp + (!session.timestamp.endsWith('Z') ? 'Z' : '')).toLocaleString()}
                                            </td>
                                            <td className="py-4">
                                                <div className="flex items-center gap-3">
                                                    <span className={`w-8 h-8 rounded-lg bg-slate-800 flex items-center justify-center text-sm ${color}`}>{icon}</span>
                                                    <span className="font-medium text-white">{name}</span>
                                                </div>
                                            </td>
                                            <td className="py-4 text-slate-300 font-mono text-sm">
                                                {score}
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
            </div> {/* END INTERACTIVE DASHBOARD */}

            {/* --- FORMAL MEDICAL REPORT (Visible ONLY when printing) --- */}
            <div className="hidden print:block w-full text-black bg-white font-serif p-8">
                {/* Hospital / Clinic Header */}
                <div className="border-b-2 border-black pb-4 mb-8 flex justify-between items-end">
                    <div>
                        <h1 className="text-3xl font-bold uppercase tracking-widest mb-1">CogniTrack Clinical Systems</h1>
                        <p className="text-sm text-gray-600">Department of Pediatric Neuropsychology</p>
                    </div>
                    <div className="text-right text-sm">
                        <p><strong>Form:</strong> CT-ASSESS-V2.4</p>
                        <p><strong>Generated:</strong> {new Date(profile.generated_at + (!profile.generated_at.endsWith('Z') ? 'Z' : '')).toLocaleString()}</p>
                    </div>
                </div>

                {/* Patient Info Block */}
                <div className="bg-gray-100 p-4 border border-gray-300 mb-8 rounded">
                    <div className="grid grid-cols-2 gap-4 text-sm">
                        <p><strong>Patient Identifier:</strong> <span className="font-mono">{profile.child_id}</span></p>
                        <p><strong>Assessing Clinician:</strong> Dr. CogniTrack AI System</p>
                        <p><strong>Assessment Type:</strong> Comprehensive Cognitive Telemetry</p>
                        <p><strong>Status:</strong> Final Report</p>
                    </div>
                </div>

                {/* Executive Summary Scores */}
                <div className="mb-8">
                    <h2 className="text-xl font-bold border-b border-gray-300 pb-2 mb-4 uppercase">1. Neurocognitive Domain Indices</h2>
                    <table className="w-full text-left border-collapse border border-gray-400">
                        <thead>
                            <tr className="bg-gray-200">
                                <th className="border border-gray-400 p-2 font-bold w-1/2">Cognitive Domain</th>
                                <th className="border border-gray-400 p-2 font-bold w-1/2">Clinical Evaluation Score</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <td className="border border-gray-400 p-2">Sustained Attention</td>
                                <td className="border border-gray-400 p-2 font-bold">{profile.attention_score || 'Not Assessed'}</td>
                            </tr>
                            <tr>
                                <td className="border border-gray-400 p-2">Motor Response Inhibition (Impulsivity)</td>
                                <td className="border border-gray-400 p-2 font-bold">{profile.impulsivity_score || 'Not Assessed'}</td>
                            </tr>
                            <tr>
                                <td className="border border-gray-400 p-2">Visuospatial Working Memory</td>
                                <td className="border border-gray-400 p-2 font-bold">{profile.working_memory_score || 'Not Assessed'}</td>
                            </tr>
                            <tr>
                                <td className="border border-gray-400 p-2">Cognitive Flexibility (Set-Shifting)</td>
                                <td className="border border-gray-400 p-2 font-bold">{profile.cognitive_flexibility_score || 'Not Assessed'}</td>
                            </tr>
                            <tr>
                                <td className="border border-gray-400 p-2">Psychomotor Processing Speed</td>
                                <td className="border border-gray-400 p-2 font-bold">{profile.processing_speed_score || 'Not Assessed'}</td>
                            </tr>
                        </tbody>
                    </table>
                </div>

                {/* AI Prescriptions (The Medical Analysis) */}
                <div className="mb-8 break-inside-avoid">
                    <h2 className="text-xl font-bold border-b border-gray-300 pb-2 mb-4 uppercase">2. Clinical Findings & Prescriptions</h2>
                    {profile.recommendations && profile.recommendations.length > 0 ? (
                        <ul className="list-disc pl-6 space-y-4">
                            {profile.recommendations.map((rec, idx) => (
                                <li key={idx} className="text-sm leading-relaxed">{rec}</li>
                            ))}
                        </ul>
                    ) : (
                        <p className="text-sm italic text-gray-500">No clinical prescriptions generated for this reporting period.</p>
                    )}
                </div>

                {/* Raw Telemetry Logs */}
                <div className="break-inside-avoid">
                    <h2 className="text-xl font-bold border-b border-gray-300 pb-2 mb-4 uppercase">3. Raw Telemetry Audit Log</h2>
                    <table className="w-full text-left border-collapse border border-gray-400 text-sm">
                        <thead>
                            <tr className="bg-gray-200">
                                <th className="border border-gray-400 p-2 font-bold">Date & Time (IST)</th>
                                <th className="border border-gray-400 p-2 font-bold">Assessment Module</th>
                                <th className="border border-gray-400 p-2 font-bold">Primary Metric Result</th>
                            </tr>
                        </thead>
                        <tbody>
                            {sessions.map((session, idx) => {
                                const { name, score } = getGameNameAndScore(session);
                                return (
                                    <tr key={idx}>
                                        <td className="border border-gray-400 p-2">
                                            {new Date(session.timestamp + (!session.timestamp.endsWith('Z') ? 'Z' : '')).toLocaleString()}
                                        </td>
                                        <td className="border border-gray-400 p-2">{name}</td>
                                        <td className="border border-gray-400 p-2 font-mono">{score}</td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>

                {/* Footer */}
                <div className="mt-12 text-center text-xs text-gray-500 border-t border-gray-300 pt-4">
                    <p>This report was generated autonomously by the CogniTrack ML Pipeline.</p>
                    <p>Not intended as a replacement for standard diagnostic clinical evaluation by a licensed physician.</p>
                    <p>CONFIDENTIAL MEDICAL RECORD - DO NOT DISTRIBUTE</p>
                </div>
            </div>
        </div>
    );
}
