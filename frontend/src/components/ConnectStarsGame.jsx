import React, { useState, useEffect, useRef } from 'react';
import { submitSpeedMetrics } from '../utils/api';
import ClinicalInfoModal from './ClinicalInfoModal';

const SEQUENCE = ['1', 'A', '2', 'B', '3', 'C', '4', 'D', '5', 'E'];

export default function ConnectStarsGame({ onBackToHome }) {
    const [gameState, setGameState] = useState('idle'); // idle, playing, complete
    const [stars, setStars] = useState([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [errorCount, setErrorCount] = useState(0);
    const [startTime, setStartTime] = useState(0);
    const [completionTime, setCompletionTime] = useState(0);
    const [apiStatus, setApiStatus] = useState(null);
    const [flashError, setFlashError] = useState(null);
    const [showInfo, setShowInfo] = useState(false);

    const containerRef = useRef(null);

    const generateStars = () => {
        if (!containerRef.current) return;
        const width = containerRef.current.clientWidth;
        const height = containerRef.current.clientHeight;

        const padding = 60; // Keep away from edges
        const safeWidth = width - padding * 2;
        const safeHeight = height - padding * 2;

        const newStars = [];
        const gridSizeX = Math.floor(safeWidth / 120);
        const gridSizeY = Math.floor(safeHeight / 120);

        // Pre-compute a grid to ensure some spread
        const grid = [];
        for (let i = 0; i < gridSizeX * gridSizeY; i++) {
            grid.push(i);
        }
        
        // Shuffle grid
        for (let i = grid.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [grid[i], grid[j]] = [grid[j], grid[i]];
        }

        SEQUENCE.forEach((label, i) => {
            if (i >= grid.length) return; // Fallback
            const cell = grid[i];
            const cellX = cell % gridSizeX;
            const cellY = Math.floor(cell / gridSizeX);
            
            // Add some jitter within the cell
            const jitterX = Math.random() * 40 - 20;
            const jitterY = Math.random() * 40 - 20;

            const x = padding + cellX * 120 + 60 + jitterX;
            const y = padding + cellY * 120 + 60 + jitterY;

            newStars.push({
                id: i,
                label,
                x,
                y,
                active: false
            });
        });

        setStars(newStars);
    };

    const startGame = () => {
        setGameState('playing');
        setCurrentIndex(0);
        setErrorCount(0);
        setCompletionTime(0);
        setApiStatus(null);
        setFlashError(null);
        generateStars();
        setStartTime(Date.now());
    };

    const handleStarClick = (index) => {
        if (gameState !== 'playing') return;

        if (index === currentIndex) {
            // Correct star clicked
            setStars(prev => prev.map((s, i) => i <= index ? { ...s, active: true } : s));
            setCurrentIndex(prev => prev + 1);

            if (index === SEQUENCE.length - 1) {
                // Game complete
                const timeTaken = Date.now() - startTime;
                setCompletionTime(timeTaken);
                setGameState('complete');
                setApiStatus('loading');
            }
        } else if (index > currentIndex) {
            // Clicked a future star, record error
            setErrorCount(prev => prev + 1);
            setFlashError(index);
            setTimeout(() => setFlashError(null), 300);
        }
    };

    useEffect(() => {
        if (gameState === 'complete' && apiStatus === 'loading') {
            const payload = {
                child_id: "test_user_01",
                completion_time_ms: completionTime,
                errors_made: errorCount
            };

            submitSpeedMetrics(payload)
                .then(() => setApiStatus('success'))
                .catch(() => setApiStatus('error'));
        }
    }, [gameState, apiStatus, completionTime, errorCount]);

    // Handle initial resize for generation
    useEffect(() => {
        const handleResize = () => {
            if (gameState === 'idle') generateStars();
        };
        window.addEventListener('resize', handleResize);
        // Delay slightly to ensure ref is painted
        setTimeout(generateStars, 100);
        return () => window.removeEventListener('resize', handleResize);
    }, [gameState]);

    return (
        <div className="w-full flex-1 flex flex-col items-center justify-center animate-fade-in relative">
            {gameState === 'idle' && (
                <div className="bg-white/10 backdrop-blur-2xl border border-white/20 p-12 rounded-[2rem] shadow-2xl w-full max-w-2xl text-center relative overflow-hidden z-10">
                    <div className="absolute top-[-50%] right-[-10%] w-[120%] h-[120%] bg-gradient-to-bl from-indigo-500/20 to-fuchsia-500/20 blur-3xl pointer-events-none rounded-full"></div>
                    
                    <button 
                        onClick={() => setShowInfo(true)}
                        className="absolute top-6 right-6 flex items-center justify-center w-10 h-10 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 text-fuchsia-300 hover:text-fuchsia-200 transition-colors z-20"
                        title="Clinical Context"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                    </button>

                    <div className="relative z-10">
                        <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-br from-indigo-500 to-fuchsia-600 mb-8 shadow-lg shadow-fuchsia-500/30">
                            <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"></path></svg>
                        </div>
                        
                        <h2 className="text-4xl font-black text-white mb-6 tracking-tight">Connect the Stars</h2>
                        <p className="text-slate-300 mb-10 text-lg leading-relaxed px-4">
                            Test your processing speed and visual search.<br /><br />
                            Connect the stars in alternating alphanumeric order:<br />
                            <strong className="text-indigo-400 mx-1 text-xl font-mono tracking-widest bg-indigo-900/40 px-3 py-1 rounded-lg">1 &rarr; A &rarr; 2 &rarr; B &rarr; 3 &rarr; C</strong><br /><br />
                            Go as fast as you can!
                        </p>
                        <button
                            onClick={startGame}
                            className="group relative px-12 py-4 bg-gradient-to-r from-indigo-500 to-fuchsia-600 rounded-full font-bold text-lg text-white shadow-lg shadow-fuchsia-500/30 overflow-hidden transition-all hover:scale-105 hover:shadow-fuchsia-500/50 active:scale-95"
                        >
                            <span className="relative z-10 flex items-center justify-center gap-2">
                                Start Connecting
                                <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3"></path></svg>
                            </span>
                            <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out"></div>
                        </button>
                    </div>
                </div>
            )}

            {/* Game Canvas Container */}
            <div 
                ref={containerRef}
                className={`absolute inset-0 bg-slate-950 overflow-hidden transition-opacity duration-500 ${gameState === 'playing' ? 'opacity-100 z-50' : 'opacity-0 pointer-events-none'}`}
            >
                {/* Decorative Background Stars */}
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-indigo-900/20 via-slate-900 to-slate-950 pointer-events-none"></div>

                {gameState === 'playing' && (
                    <>
                        <div className="absolute top-6 right-6 px-6 py-2 bg-white/10 backdrop-blur-xl border border-white/10 rounded-full text-indigo-300 font-mono font-bold tracking-widest z-10 shadow-lg">
                            Next: {SEQUENCE[currentIndex]}
                        </div>
                        
                        {/* SVG for Drawing Lines */}
                        <svg className="absolute inset-0 w-full h-full pointer-events-none z-0">
                            {stars.map((star, i) => {
                                if (i > 0 && star.active) {
                                    const prev = stars[i - 1];
                                    return (
                                        <line 
                                            key={`line-${i}`}
                                            x1={prev.x} 
                                            y1={prev.y} 
                                            x2={star.x} 
                                            y2={star.y} 
                                            stroke="url(#lineGradient)" 
                                            strokeWidth="4"
                                            strokeLinecap="round"
                                            className="animate-draw-line"
                                        />
                                    );
                                }
                                return null;
                            })}
                            <defs>
                                <linearGradient id="lineGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                                    <stop offset="0%" stopColor="#818cf8" />
                                    <stop offset="100%" stopColor="#e879f9" />
                                </linearGradient>
                            </defs>
                        </svg>

                        {/* Interactive Stars */}
                        {stars.map((star, i) => (
                            <div
                                key={star.id}
                                onClick={() => handleStarClick(i)}
                                className={`absolute flex items-center justify-center rounded-full font-black text-2xl cursor-pointer transition-all duration-300 transform -translate-x-1/2 -translate-y-1/2 select-none z-10
                                    ${star.active 
                                        ? 'w-16 h-16 bg-gradient-to-br from-indigo-500 to-fuchsia-600 text-white shadow-[0_0_30px_rgba(192,38,211,0.6)] scale-110' 
                                        : 'w-14 h-14 bg-slate-800 text-slate-400 border-2 border-slate-700 hover:border-indigo-500 hover:text-indigo-400 hover:scale-110 shadow-lg'
                                    }
                                    ${flashError === i ? 'border-red-500 bg-red-500/20 text-red-500 scale-125 shadow-[0_0_20px_rgba(239,68,68,0.6)]' : ''}
                                `}
                                style={{ left: star.x, top: star.y }}
                            >
                                {star.label}
                            </div>
                        ))}
                    </>
                )}
            </div>

            {gameState === 'complete' && (
                <div className="bg-white/10 backdrop-blur-2xl border border-white/20 p-12 rounded-[2rem] shadow-2xl w-full max-w-2xl animate-fade-in relative overflow-hidden text-center z-10 mt-12">
                    <div className="absolute top-[-20%] right-[-20%] w-[80%] h-[80%] bg-fuchsia-500/10 blur-3xl pointer-events-none rounded-full"></div>

                    <div className="relative z-10">
                        <h2 className="text-4xl font-black text-white tracking-tight mb-2">Test Complete</h2>
                        <p className="text-slate-400 text-lg mb-10">Processing speed metrics logged.</p>
                        
                        <div className="flex gap-6 justify-center mb-12">
                            <div className="bg-slate-900/60 p-6 rounded-3xl border border-white/10 flex-1 shadow-inner">
                                <span className="text-sm font-bold text-slate-400 uppercase tracking-wider block mb-2">Time</span>
                                <span className="text-4xl font-black text-indigo-400 block">{(completionTime / 1000).toFixed(1)}s</span>
                            </div>
                            <div className="bg-slate-900/60 p-6 rounded-3xl border border-white/10 flex-1 shadow-inner">
                                <span className="text-sm font-bold text-slate-400 uppercase tracking-wider block mb-2">Errors</span>
                                <span className="text-4xl font-black text-rose-400 block">{errorCount}</span>
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
                                className="flex-1 bg-gradient-to-r from-indigo-500 to-fuchsia-600 hover:opacity-90 text-white font-bold py-4 px-6 rounded-2xl shadow-lg shadow-fuchsia-500/25 transition-all active:scale-[0.98]"
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
                title="Trail Making Test (Part B)"
                measures="Processing Speed, Visual Search, and Alternating Attention."
                impact="High cognitive load task that challenges the brain to quickly process visual stimuli while holding two alternating sequences (numbers/letters) in working memory."
                link="https://pubmed.ncbi.nlm.nih.gov/?term=Trail+Making+Test+Part+B+processing+speed"
            />
        </div>
    );
}
