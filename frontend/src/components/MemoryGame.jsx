import React, { useState, useEffect, useRef, useCallback } from 'react';
import { submitMemoryMetrics } from '../utils/api';
import { useAuth } from '../context/AuthContext';
import ClinicalInfoModal from './ClinicalInfoModal';

const GRID_SIZE = 9; // 3x3
const STARTING_SEQUENCE_LENGTH = 2;
const LIT_DURATION_MS = 600;
const DELAY_BETWEEN_LIT_MS = 200;

export default function MemoryGame({ onBackToHome }) {
    const { user } = useAuth();
    const [gameState, setGameState] = useState('idle'); // idle, playing, complete
    const [sequence, setSequence] = useState([]);
    const [userStep, setUserStep] = useState(0);
    const [litBlock, setLitBlock] = useState(null);
    const [isUserTurn, setIsUserTurn] = useState(false);
    const [maxSpan, setMaxSpan] = useState(0);
    const [apiStatus, setApiStatus] = useState(null);
    const [showInfo, setShowInfo] = useState(false);

    const generateSequence = (length) => {
        const newSeq = [];
        for (let i = 0; i < length; i++) {
            newSeq.push(Math.floor(Math.random() * GRID_SIZE));
        }
        return newSeq;
    };

    const startGame = () => {
        setGameState('playing');
        setMaxSpan(0);
        setApiStatus(null);
        startRound(generateSequence(STARTING_SEQUENCE_LENGTH));
    };

    const startRound = useCallback((newSeq) => {
        setSequence(newSeq);
        setUserStep(0);
        setIsUserTurn(false);
        playSequence(newSeq);
    }, []);

    const playSequence = async (seq) => {
        // Small delay before starting sequence
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        for (let i = 0; i < seq.length; i++) {
            setLitBlock(seq[i]);
            await new Promise(resolve => setTimeout(resolve, LIT_DURATION_MS));
            setLitBlock(null);
            await new Promise(resolve => setTimeout(resolve, DELAY_BETWEEN_LIT_MS));
        }
        setIsUserTurn(true);
    };

    const handleBlockClick = (index) => {
        if (!isUserTurn || gameState !== 'playing') return;

        // Check if correct
        if (index === sequence[userStep]) {
            const nextStep = userStep + 1;
            
            // Momentarily light up the block to give feedback
            setLitBlock(index);
            setTimeout(() => setLitBlock(null), 200);

            if (nextStep === sequence.length) {
                // Round Complete
                setIsUserTurn(false);
                setMaxSpan(sequence.length);
                
                // Start next round with +1 length
                setTimeout(() => {
                    startRound(generateSequence(sequence.length + 1));
                }, 1000);
            } else {
                setUserStep(nextStep);
            }
        } else {
            // Failed
            endGame();
        }
    };

    const endGame = useCallback(async () => {
        setGameState('complete');
        setIsUserTurn(false);
        setApiStatus('loading');

        const payload = {
            child_id: user.username,
            max_span: maxSpan
        };

        try {
            await submitMemoryMetrics(payload);
            setApiStatus('success');
        } catch (err) {
            setApiStatus('error');
        }
    }, [maxSpan]);

    return (
        <div className="w-full flex-1 flex flex-col items-center justify-center animate-fade-in">
            {gameState === 'idle' && (
                <div className="bg-white/10 backdrop-blur-2xl border border-white/20 p-12 rounded-[2rem] shadow-2xl w-full max-w-2xl text-center relative overflow-hidden">
                    <div className="absolute top-[-50%] right-[-10%] w-[120%] h-[120%] bg-gradient-to-bl from-purple-500/20 to-indigo-500/20 blur-3xl pointer-events-none rounded-full"></div>
                    
                    <button 
                        onClick={() => setShowInfo(true)}
                        className="absolute top-6 right-6 flex items-center justify-center w-10 h-10 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 text-purple-300 hover:text-purple-200 transition-colors z-20"
                        title="Clinical Context"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                    </button>

                    <div className="relative z-10">
                        <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 mb-8 shadow-lg shadow-purple-500/30">
                            <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"></path></svg>
                        </div>
                        
                        <h2 className="text-4xl font-black text-white mb-6 tracking-tight">Visuospatial Memory</h2>
                        <p className="text-slate-300 mb-10 text-lg leading-relaxed px-4">
                            Assess your working memory capacity.<br /><br />
                            Watch the <strong className="text-purple-400 mx-1">blocks light up</strong> in a sequence.<br />
                            When it's your turn, <b>REPEAT</b> the exact sequence by clicking the blocks.
                        </p>
                        <button
                            onClick={startGame}
                            className="group relative px-12 py-4 bg-gradient-to-r from-purple-500 to-indigo-600 rounded-full font-bold text-lg text-white shadow-lg shadow-purple-500/30 overflow-hidden transition-all hover:scale-105 hover:shadow-purple-500/50 active:scale-95"
                        >
                            <span className="relative z-10 flex items-center justify-center gap-2">
                                Start Sequence
                                <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3"></path></svg>
                            </span>
                            <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out"></div>
                        </button>
                    </div>
                </div>
            )}

            {gameState === 'playing' && (
                <div className="w-full flex-1 flex flex-col items-center justify-center relative bg-slate-900/50 backdrop-blur-3xl rounded-[3rem] border border-white/5 overflow-hidden shadow-2xl p-8">
                    
                    <div className="absolute top-8 text-center w-full">
                        <div className="inline-block bg-black/40 backdrop-blur-md rounded-full px-6 py-2 border border-white/10 shadow-inner">
                             {isUserTurn ? (
                                 <span className="text-emerald-400 font-bold tracking-widest uppercase text-sm animate-pulse">Your Turn</span>
                             ) : (
                                 <span className="text-purple-400 font-bold tracking-widest uppercase text-sm">Watch Carefully</span>
                             )}
                        </div>
                    </div>

                    <div className="grid grid-cols-3 gap-4 w-80 h-80 mt-12">
                        {Array.from({ length: GRID_SIZE }).map((_, idx) => (
                            <div
                                key={idx}
                                onClick={() => handleBlockClick(idx)}
                                className={`rounded-2xl transition-all duration-200 border-2 cursor-pointer shadow-lg
                                    ${litBlock === idx 
                                        ? 'bg-purple-500 border-purple-300 scale-105 shadow-[0_0_30px_rgba(168,85,247,0.8)]' 
                                        : 'bg-white/5 border-white/10 hover:bg-white/10'}
                                    ${!isUserTurn ? 'pointer-events-none' : ''}
                                `}
                            ></div>
                        ))}
                    </div>

                    <div className="absolute bottom-10 flex items-center gap-8">
                         <div className="flex flex-col items-center">
                            <span className="text-xs text-slate-500 font-bold uppercase tracking-widest mb-1">Current Span</span>
                            <span className="text-2xl text-white font-black">{sequence.length}</span>
                         </div>
                    </div>
                </div>
            )}

            {gameState === 'complete' && (
                <div className="bg-white/10 backdrop-blur-2xl border border-white/20 p-12 rounded-[2rem] shadow-2xl w-full max-w-2xl animate-fade-in relative overflow-hidden text-center">
                    <div className="absolute top-[-20%] right-[-20%] w-[80%] h-[80%] bg-purple-500/10 blur-3xl pointer-events-none rounded-full"></div>

                    <div className="relative z-10">
                        <h2 className="text-4xl font-black text-white tracking-tight mb-2">Test Complete</h2>
                        <p className="text-slate-400 text-lg mb-10">Working memory capacity logged.</p>
                        
                        <div className="bg-slate-900/60 p-8 rounded-3xl border border-white/10 inline-block shadow-inner mb-12">
                            <span className="text-sm font-bold text-slate-400 uppercase tracking-[0.2em] block mb-3">Maximum Span Reached</span>
                            <span className="text-7xl font-black text-purple-400 block">{maxSpan}</span>
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
                                className="flex-1 bg-purple-600 hover:bg-purple-500 text-white font-bold py-4 px-6 rounded-2xl shadow-lg shadow-purple-500/25 transition-all active:scale-[0.98]"
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
                title="Corsi Block-Tapping Task"
                measures="Visuospatial Working Memory Span."
                impact="Assesses a child's capacity to hold and manipulate visual information in short-term memory, which is critical for academic learning and following multi-step instructions."
                link="https://pubmed.ncbi.nlm.nih.gov/?term=Corsi+block+tapping+task+working+memory"
            />
        </div>
    );
}
