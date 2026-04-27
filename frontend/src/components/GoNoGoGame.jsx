import React, { useState, useEffect, useRef, useCallback } from 'react';
import { submitGameMetrics } from '../utils/api';
import ClinicalInfoModal from './ClinicalInfoModal';

const TOTAL_TRIALS = 20;
const GO_PROBABILITY = 0.8;
const MAX_RESPONSE_TIME_MS = 1000;
const MIN_DELAY_MS = 1000;
const MAX_DELAY_MS = 2500;

export default function GoNoGoGame({ onBackToHome }) {
    const [gameState, setGameState] = useState('idle'); // idle, playing, complete
    const [target, setTarget] = useState(null); // null, 'GO', 'NO_GO'
    const [trialCount, setTrialCount] = useState(0);
    const [feedback, setFeedback] = useState(null);
    const [apiStatus, setApiStatus] = useState(null); // 'loading', 'success', 'error'
    const [showInfo, setShowInfo] = useState(false);

    // Metrics
    const [reactionTimes, setReactionTimes] = useState([]);
    const [omissionErrors, setOmissionErrors] = useState(0);
    const [commissionErrors, setCommissionErrors] = useState(0);

    const startTimeRef = useRef(0);
    const timeoutRef = useRef(null);
    const isTargetActiveRef = useRef(false);
    const currentTargetRef = useRef(null);

    const startGame = () => {
        setGameState('playing');
        setTrialCount(0);
        setReactionTimes([]);
        setOmissionErrors(0);
        setCommissionErrors(0);
        setApiStatus(null);
        scheduleNextTrial();
    };

    const scheduleNextTrial = useCallback(() => {
        setTarget(null);
        setFeedback(null);
        isTargetActiveRef.current = false;
        currentTargetRef.current = null;

        if (timeoutRef.current) clearTimeout(timeoutRef.current);

        const delay = Math.random() * (MAX_DELAY_MS - MIN_DELAY_MS) + MIN_DELAY_MS;
        timeoutRef.current = setTimeout(showTarget, delay);
    }, []);

    const showTarget = useCallback(() => {
        const isGo = Math.random() < GO_PROBABILITY;
        const targetType = isGo ? 'GO' : 'NO_GO';

        setTarget(targetType);
        currentTargetRef.current = targetType;
        isTargetActiveRef.current = true;
        startTimeRef.current = performance.now();

        // Auto-timeout if the user doesn't respond
        timeoutRef.current = setTimeout(handleTimeout, MAX_RESPONSE_TIME_MS);
    }, []);

    const endTrial = useCallback((isCorrect, feedbackType) => {
        isTargetActiveRef.current = false;
        currentTargetRef.current = null;
        if (timeoutRef.current) clearTimeout(timeoutRef.current);

        setFeedback(isCorrect ? 'positive' : 'negative');

        // Quick delay after feedback before the next sequence starts
        setTimeout(() => {
            setTrialCount(prev => {
                const nextCount = prev + 1;
                if (nextCount >= TOTAL_TRIALS) {
                    endGame();
                    return prev;
                }
                scheduleNextTrial();
                return nextCount;
            });
        }, 500);
    }, [scheduleNextTrial]);

    const handleTimeout = useCallback(() => {
        if (!isTargetActiveRef.current) return;

        const targetWas = currentTargetRef.current;
        if (targetWas === 'GO') {
            // Missed a target they should have clicked
            setOmissionErrors(prev => prev + 1);
            endTrial(false, 'omission');
        } else if (targetWas === 'NO_GO') {
            // Successfully ignored a distractor
            endTrial(true, 'success');
        }
    }, [endTrial]);

    const handleUserInput = useCallback(() => {
        if (gameState !== 'playing' || !isTargetActiveRef.current) return;

        const reactionTime = performance.now() - startTimeRef.current;
        const currentTgt = currentTargetRef.current;

        window.clearTimeout(timeoutRef.current);
        isTargetActiveRef.current = false;

        if (currentTgt === 'GO') {
            // Correct click
            setReactionTimes(prev => [...prev, reactionTime]);
            endTrial(true, 'success');
        } else if (currentTgt === 'NO_GO') {
            // Clicked when they shouldn't have
            setCommissionErrors(prev => prev + 1);
            endTrial(false, 'commission');
        }
    }, [gameState, endTrial]);

    // Handle Spacebar input
    useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.code === 'Space') {
                e.preventDefault();
                handleUserInput();
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [handleUserInput]);

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            if (timeoutRef.current) clearTimeout(timeoutRef.current);
        };
    }, []);

    const endGame = useCallback(async () => {
        setGameState('complete');
        setApiStatus('loading');

        // Calculate average reaction time safely
        const avgReactionTime = reactionTimes.length > 0
            ? reactionTimes.reduce((a, b) => a + b, 0) / reactionTimes.length
            : 0;

        const payload = {
            child_id: "test_user_01",
            reaction_time_ms: Math.round(avgReactionTime * 100) / 100, // Round to 2 decimals
            omission_errors: omissionErrors,
            commission_errors: commissionErrors
        };

        try {
            await submitGameMetrics(payload);
            setApiStatus('success');
        } catch (err) {
            setApiStatus('error');
        }
    }, [reactionTimes, omissionErrors, commissionErrors]);

    return (
        <div className="w-full flex-1 flex flex-col items-center justify-center animate-fade-in">
            {gameState === 'idle' && (
                <div className="bg-white/10 backdrop-blur-2xl border border-white/20 p-12 rounded-[2rem] shadow-2xl w-full max-w-2xl text-center relative overflow-hidden">
                    <div className="absolute top-[-50%] left-[-10%] w-[120%] h-[120%] bg-gradient-to-br from-indigo-500/20 to-purple-500/20 blur-3xl pointer-events-none rounded-full"></div>

                    <button 
                        onClick={() => setShowInfo(true)}
                        className="absolute top-6 right-6 flex items-center justify-center w-10 h-10 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 text-indigo-300 hover:text-indigo-200 transition-colors z-20"
                        title="Clinical Context"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                    </button>

                    <div className="relative z-10">
                        <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 mb-8 shadow-lg shadow-blue-500/30">
                            <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path></svg>
                        </div>

                        <h2 className="text-4xl font-black text-white mb-6 tracking-tight">Go / No-Go Test</h2>
                        <p className="text-slate-300 mb-10 text-lg leading-relaxed px-4">
                            Test response inhibition and sustained attention.<br /><br />
                            When the <strong className="text-emerald-400 mx-1">Green Sphere</strong> appears, <b>CLICK</b> immediately.<br />
                            When the <strong className="text-rose-400 mx-1">Red Diamond</strong> appears, <b>DO NOTHING</b>.
                        </p>
                        <button
                            onClick={startGame}
                            className="group relative px-12 py-4 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full font-bold text-lg text-white shadow-lg shadow-blue-500/30 overflow-hidden transition-all hover:scale-105 hover:shadow-blue-500/50 active:scale-95"
                        >
                            <span className="relative z-10 flex items-center justify-center gap-2">
                                Initiate Sequence
                                <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3"></path></svg>
                            </span>
                            <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out"></div>
                        </button>
                    </div>
                </div>
            )}

            {gameState === 'playing' && (
                <div
                    className="w-full flex-1 flex flex-col items-center justify-center relative select-none cursor-pointer bg-slate-900/50 backdrop-blur-3xl rounded-[3rem] border border-white/5 overflow-hidden shadow-2xl"
                    onClick={handleUserInput}
                >
                    <div className="absolute top-6 right-8 bg-black/40 backdrop-blur-md rounded-full px-5 py-2 border border-white/10 font-bold text-slate-300 tracking-widest shadow-inner">
                        <span className="text-blue-400">{trialCount + 1}</span> / {TOTAL_TRIALS}
                    </div>

                    <div className="h-96 w-96 flex items-center justify-center relative">
                        {/* Target Display */}
                        {target === 'GO' && (
                            <div className="w-56 h-56 bg-gradient-to-tr from-emerald-400 to-emerald-600 rounded-full shadow-[0_0_80px_rgba(52,211,153,0.6)] flex items-center justify-center border-4 border-emerald-300/50">
                                <div className="w-full h-full rounded-full animate-ping opacity-20 bg-emerald-300"></div>
                            </div>
                        )}
                        {target === 'NO_GO' && (
                            <div className="w-56 h-56 bg-gradient-to-tr from-rose-500 to-red-600 rotate-45 transform shadow-[0_0_80px_rgba(244,63,94,0.6)] flex items-center justify-center border-4 border-rose-400/50 rounded-3xl">
                            </div>
                        )}

                        {/* Feedback Rings */}
                        {feedback === 'positive' && (
                            <div className="absolute inset-0 border-[12px] border-emerald-400 rounded-full animate-ping opacity-60 pointer-events-none"></div>
                        )}
                        {feedback === 'negative' && (
                            <div className="absolute top-1/2 left-1/2 w-full h-full -translate-x-1/2 -translate-y-1/2 border-[12px] border-rose-500 opacity-80 pointer-events-none rounded-3xl rotate-45 scale-125 transition-all"></div>
                        )}
                    </div>

                    <div className="absolute bottom-10 flex items-center gap-3 text-slate-500 font-semibold uppercase tracking-widest">
                        <kbd className="px-3 py-1 bg-white/10 rounded-md border border-white/10 text-white shadow-sm">Space</kbd>
                        <span>or</span>
                        <kbd className="px-3 py-1 bg-white/10 rounded-md border border-white/10 text-white shadow-sm">Click</kbd>
                    </div>
                </div>
            )}

            {gameState === 'complete' && (
                <div className="bg-white/10 backdrop-blur-2xl border border-white/20 p-12 rounded-[2rem] shadow-2xl w-full max-w-3xl animate-fade-in relative overflow-hidden">
                    <div className="absolute top-[-20%] right-[-20%] w-[80%] h-[80%] bg-blue-500/10 blur-3xl pointer-events-none rounded-full"></div>

                    <div className="text-center mb-10 relative z-10">
                        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-emerald-500/20 text-emerald-400 mb-6">
                            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"></path></svg>
                        </div>
                        <h2 className="text-4xl font-black text-white tracking-tight mb-2">Diagnostic Complete</h2>
                        <p className="text-slate-400 text-lg">Metrics have been successfully logged and sent for AI assessment.</p>
                    </div>

                    <div className="grid grid-cols-2 gap-6 mb-10 relative z-10">
                        <div className="bg-slate-900/60 p-6 rounded-2xl border border-white/10 flex flex-col items-center justify-center shadow-inner">
                            <span className="text-xs font-bold text-slate-400 uppercase tracking-[0.2em] mb-3">Response Latency</span>
                            <span className="text-5xl font-black text-white flex items-baseline gap-1">
                                {reactionTimes.length > 0 ? Math.round(reactionTimes.reduce((a, b) => a + b, 0) / reactionTimes.length) : '0'}
                                <span className="text-xl text-slate-500 font-bold">ms</span>
                            </span>
                        </div>

                        <div className="bg-slate-900/60 p-6 rounded-2xl border border-white/10 flex flex-col items-center justify-center shadow-inner">
                            <span className="text-xs font-bold text-slate-400 uppercase tracking-[0.2em] mb-3">Overall Accuracy</span>
                            <span className="text-5xl font-black text-blue-400 flex items-baseline gap-1">
                                {Math.round(((TOTAL_TRIALS - omissionErrors - commissionErrors) / TOTAL_TRIALS) * 100)}
                                <span className="text-2xl text-blue-400/50 font-bold">%</span>
                            </span>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-6 mb-12 relative z-10">
                        <div className="bg-slate-800/40 p-5 rounded-xl border border-white/10 flex items-center justify-between">
                            <div className="flex flex-col">
                                <span className="text-sm font-semibold text-slate-300">Omission Errors</span>
                                <span className="text-xs text-slate-500">Targets Missed</span>
                            </div>
                            <span className={`text-2xl font-black ${omissionErrors > 0 ? 'text-rose-400' : 'text-slate-300'}`}>{omissionErrors}</span>
                        </div>
                        <div className="bg-slate-800/40 p-5 rounded-xl border border-white/10 flex items-center justify-between">
                            <div className="flex flex-col">
                                <span className="text-sm font-semibold text-slate-300">Commission Errors</span>
                                <span className="text-xs text-slate-500">False Hits</span>
                            </div>
                            <span className={`text-2xl font-black ${commissionErrors > 0 ? 'text-rose-400' : 'text-slate-300'}`}>{commissionErrors}</span>
                        </div>
                    </div>

                    <div className="flex gap-4 justify-center relative z-10">
                        <button
                            onClick={startGame}
                            className="flex-1 bg-white/5 hover:bg-white/10 border border-white/10 text-white font-bold py-4 px-6 rounded-2xl transition-all active:scale-[0.98]"
                        >
                            Retake Assessment
                        </button>
                        <button
                            onClick={onBackToHome}
                            className="flex-1 bg-blue-600 hover:bg-blue-500 text-white font-bold py-4 px-6 rounded-2xl shadow-lg shadow-blue-500/25 transition-all active:scale-[0.98]"
                        >
                            Return to Dashboard
                        </button>
                    </div>
                </div>
            )}

            <ClinicalInfoModal 
                isOpen={showInfo} 
                onClose={() => setShowInfo(false)}
                title="Go/No-Go Task"
                measures="Sustained Attention and Response Inhibition."
                impact="Helps evaluate a child's ability to maintain focus over tedious tasks and suppress impulsive behaviors. This task is widely used in clinical settings to assist in the assessment of ADHD."
                link="https://pubmed.ncbi.nlm.nih.gov/?term=Go%2FNo-Go+Task+ADHD"
            />
        </div>
    );
}
