import React, { useState, useEffect, useCallback } from 'react';
import { submitFlexibilityMetrics } from '../utils/api';
import ClinicalInfoModal from './ClinicalInfoModal';

const SHAPES = ['circle', 'square'];
const COLORS = ['blue', 'emerald'];

// Bins are fixed mapping:
// Left Bin: Blue Circle
// Right Bin: Emerald Square
const BINS = [
    { id: 'left', color: 'blue', shape: 'circle' },
    { id: 'right', color: 'emerald', shape: 'square' }
];

const TOTAL_TRIALS = 20;
const SWITCH_TRIAL_INDEX = 10;

export default function ShapeShifterGame({ onBackToHome }) {
    const [gameState, setGameState] = useState('idle'); // idle, playing, complete
    const [currentRule, setCurrentRule] = useState('color'); // color, shape
    const [trialCount, setTrialCount] = useState(0);
    const [targetCard, setTargetCard] = useState(null);
    const [apiStatus, setApiStatus] = useState(null);
    const [showInfo, setShowInfo] = useState(false);
    
    // Metrics
    const [correctCount, setCorrectCount] = useState(0);
    const [reactionTimes, setReactionTimes] = useState([]);
    const [trialStartTime, setTrialStartTime] = useState(0);

    const generateTargetCard = useCallback(() => {
        // We want cards that create conflict (e.g., Blue Square or Emerald Circle)
        // so that the rule matters.
        const conflictCards = [
            { color: 'blue', shape: 'square' },
            { color: 'emerald', shape: 'circle' }
        ];
        // Occasionally throw in non-conflict cards to keep them guessing
        const allCards = [
            { color: 'blue', shape: 'circle' },
            { color: 'emerald', shape: 'square' },
            ...conflictCards,
            ...conflictCards
        ];
        const randomCard = allCards[Math.floor(Math.random() * allCards.length)];
        setTargetCard(randomCard);
        setTrialStartTime(Date.now());
    }, []);

    const startGame = () => {
        setGameState('playing');
        setCurrentRule('color');
        setTrialCount(0);
        setCorrectCount(0);
        setReactionTimes([]);
        setApiStatus(null);
        generateTargetCard();
    };

    const handleBinClick = (bin) => {
        if (gameState !== 'playing') return;

        const reactionTime = Date.now() - trialStartTime;
        setReactionTimes(prev => [...prev, reactionTime]);

        // Check accuracy
        const isCorrect = bin[currentRule] === targetCard[currentRule];
        if (isCorrect) {
            setCorrectCount(prev => prev + 1);
        }

        const nextTrial = trialCount + 1;
        setTrialCount(nextTrial);

        if (nextTrial === TOTAL_TRIALS) {
            endGame();
        } else {
            if (nextTrial === SWITCH_TRIAL_INDEX) {
                setCurrentRule('shape');
            }
            generateTargetCard();
        }
    };

    const endGame = useCallback(async () => {
        setGameState('complete');
        setApiStatus('loading');

        // Note: reactionTimes array length will be TOTAL_TRIALS, but due to state closure we use the latest state if needed
        // wait, we update reactionTimes on click, but in endGame closure it might be 1 short.
        // We calculate metrics locally to be safe.
    }, []);

    // Effect to handle endGame after state finishes updating
    useEffect(() => {
        if (gameState === 'complete' && apiStatus === 'loading') {
            const avgReactionTime = reactionTimes.length > 0 
                ? reactionTimes.reduce((a, b) => a + b, 0) / reactionTimes.length 
                : 0;
            const accuracyRate = correctCount / TOTAL_TRIALS;

            const payload = {
                child_id: "test_user_01",
                accuracy_rate: Math.round(accuracyRate * 100) / 100,
                avg_reaction_time_ms: Math.round(avgReactionTime * 100) / 100
            };

            submitFlexibilityMetrics(payload)
                .then(() => setApiStatus('success'))
                .catch(() => setApiStatus('error'));
        }
    }, [gameState, apiStatus, reactionTimes, correctCount]);

    // UI Helpers
    const renderShape = (shape, colorClass) => {
        if (shape === 'circle') {
            return <div className={`w-24 h-24 rounded-full ${colorClass}`}></div>;
        } else if (shape === 'square') {
            return <div className={`w-24 h-24 rounded-2xl ${colorClass}`}></div>;
        }
        return null;
    };

    const getColorClass = (color) => {
        if (color === 'blue') return 'bg-blue-500 shadow-[0_0_20px_rgba(59,130,246,0.6)]';
        if (color === 'emerald') return 'bg-emerald-400 shadow-[0_0_20px_rgba(52,211,153,0.6)]';
        return 'bg-white';
    };

    return (
        <div className="w-full flex-1 flex flex-col items-center justify-center animate-fade-in relative">
            {gameState === 'idle' && (
                <div className="bg-white/10 backdrop-blur-2xl border border-white/20 p-12 rounded-[2rem] shadow-2xl w-full max-w-2xl text-center relative overflow-hidden">
                    <div className="absolute top-[-50%] right-[-10%] w-[120%] h-[120%] bg-gradient-to-bl from-amber-500/20 to-rose-500/20 blur-3xl pointer-events-none rounded-full"></div>
                    
                    <button 
                        onClick={() => setShowInfo(true)}
                        className="absolute top-6 right-6 flex items-center justify-center w-10 h-10 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 text-amber-300 hover:text-amber-200 transition-colors z-20"
                        title="Clinical Context"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                    </button>

                    <div className="relative z-10">
                        <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-br from-amber-500 to-rose-600 mb-8 shadow-lg shadow-rose-500/30">
                            <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 10l-2 1m0 0l-2-1m2 1v2.5M20 7l-2 1m2-1l-2-1m2 1v2.5M14 4l-2-1-2 1M4 7l2-1M4 7l2 1M4 7v2.5M12 21l-2-1m2 1l2-1m-2 1v-2.5M6 18l-2-1v-2.5M18 18l2-1v-2.5"></path></svg>
                        </div>
                        
                        <h2 className="text-4xl font-black text-white mb-6 tracking-tight">Shape Shifter</h2>
                        <p className="text-slate-300 mb-10 text-lg leading-relaxed px-4">
                            Test your cognitive flexibility.<br /><br />
                            Sort the center card into the left or right bin based on the <strong className="text-amber-400 mx-1">current rule</strong>.<br />
                            Pay attention, because the rule will change halfway through!
                        </p>
                        <button
                            onClick={startGame}
                            className="group relative px-12 py-4 bg-gradient-to-r from-amber-500 to-rose-600 rounded-full font-bold text-lg text-white shadow-lg shadow-rose-500/30 overflow-hidden transition-all hover:scale-105 hover:shadow-rose-500/50 active:scale-95"
                        >
                            <span className="relative z-10 flex items-center justify-center gap-2">
                                Start Sorting
                                <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3"></path></svg>
                            </span>
                            <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out"></div>
                        </button>
                    </div>
                </div>
            )}

            {gameState === 'playing' && targetCard && (
                <div className="w-full flex-1 flex flex-col items-center justify-center relative bg-slate-900/50 backdrop-blur-3xl rounded-[3rem] border border-white/5 overflow-hidden shadow-2xl p-8">
                    
                    <div className="absolute top-8 text-center w-full">
                        <div className={`inline-block backdrop-blur-md rounded-full px-8 py-3 border shadow-lg transition-colors ${currentRule === 'color' ? 'bg-amber-500/20 border-amber-500/50' : 'bg-rose-500/20 border-rose-500/50'}`}>
                            <span className="text-slate-300 font-bold uppercase tracking-widest text-sm block mb-1 opacity-70">Current Rule</span>
                            <span className={`text-2xl font-black uppercase tracking-widest ${currentRule === 'color' ? 'text-amber-400' : 'text-rose-400'}`}>
                                Sort by {currentRule}
                            </span>
                        </div>
                    </div>

                    {/* Progress Bar */}
                    <div className="absolute top-0 left-0 w-full h-1 bg-white/5">
                         <div className="h-full bg-gradient-to-r from-amber-500 to-rose-500 transition-all duration-300" style={{ width: `${(trialCount / TOTAL_TRIALS) * 100}%` }}></div>
                    </div>

                    {/* Target Card */}
                    <div className="flex flex-col items-center justify-center my-12">
                        <div className="bg-white/10 p-12 rounded-[3rem] border border-white/20 shadow-2xl backdrop-blur-md animate-pop-in">
                            {renderShape(targetCard.shape, getColorClass(targetCard.color))}
                        </div>
                    </div>

                    {/* Bins */}
                    <div className="absolute bottom-12 w-full px-12 flex justify-between gap-12 max-w-4xl">
                        {BINS.map((bin) => (
                            <div 
                                key={bin.id}
                                onClick={() => handleBinClick(bin)}
                                className="flex-1 bg-white/5 hover:bg-white/10 border border-white/10 rounded-3xl p-8 flex flex-col items-center justify-center cursor-pointer transition-all hover:-translate-y-2 hover:shadow-xl active:scale-95 group"
                            >
                                <div className="scale-75 group-hover:scale-90 transition-transform mb-4">
                                    {renderShape(bin.shape, getColorClass(bin.color))}
                                </div>
                                <span className="text-slate-500 font-bold uppercase tracking-wider text-sm group-hover:text-slate-300 transition-colors">
                                    {bin.color} {bin.shape}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {gameState === 'complete' && (
                <div className="bg-white/10 backdrop-blur-2xl border border-white/20 p-12 rounded-[2rem] shadow-2xl w-full max-w-2xl animate-fade-in relative overflow-hidden text-center">
                    <div className="absolute top-[-20%] right-[-20%] w-[80%] h-[80%] bg-amber-500/10 blur-3xl pointer-events-none rounded-full"></div>

                    <div className="relative z-10">
                        <h2 className="text-4xl font-black text-white tracking-tight mb-2">Test Complete</h2>
                        <p className="text-slate-400 text-lg mb-10">Cognitive flexibility metrics logged.</p>
                        
                        <div className="flex gap-6 justify-center mb-12">
                            <div className="bg-slate-900/60 p-6 rounded-3xl border border-white/10 flex-1 shadow-inner">
                                <span className="text-sm font-bold text-slate-400 uppercase tracking-wider block mb-2">Accuracy</span>
                                <span className="text-4xl font-black text-amber-400 block">{Math.round((correctCount / TOTAL_TRIALS) * 100)}%</span>
                            </div>
                            <div className="bg-slate-900/60 p-6 rounded-3xl border border-white/10 flex-1 shadow-inner">
                                <span className="text-sm font-bold text-slate-400 uppercase tracking-wider block mb-2">Avg Reaction</span>
                                <span className="text-4xl font-black text-rose-400 block">
                                    {reactionTimes.length > 0 ? Math.round(reactionTimes.reduce((a, b) => a + b, 0) / reactionTimes.length) : 0}ms
                                </span>
                            </div>
                        </div>

                        <div className="flex gap-4 justify-center">
                            <button
                                onClick={startGame}
                                className="flex-1 bg-white/5 hover:bg-white/10 border border-white/10 text-white font-bold py-4 px-6 rounded-2xl transition-all active:scale-[0.98]"
                            >
                                Try Again
                            </button>
                            <button
                                onClick={onBackToHome}
                                className="flex-1 bg-gradient-to-r from-amber-500 to-rose-600 hover:opacity-90 text-white font-bold py-4 px-6 rounded-2xl shadow-lg shadow-rose-500/25 transition-all active:scale-[0.98]"
                            >
                                Return to Dashboard
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <ClinicalInfoModal 
                isOpen={showInfo} 
                onClose={() => setShowInfo(false)}
                title="Dimensional Change Card Sort (DCCS)"
                measures="Cognitive Flexibility and Executive Function."
                impact="Evaluates a child's ability to adapt to new rules and environments without getting 'stuck' on previous instructions (perseveration). Poor performance can indicate rigidity in thought patterns."
                link="https://pubmed.ncbi.nlm.nih.gov/?term=Dimensional+Change+Card+Sort+cognitive+flexibility"
            />
        </div>
    );
}
