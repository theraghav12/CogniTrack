import React, { useState } from 'react';
import GoNoGoGame from './components/GoNoGoGame';
import ClinicalDashboard from './components/ClinicalDashboard';
import MemoryGame from './components/MemoryGame';
import ShapeShifterGame from './components/ShapeShifterGame';
import ConnectStarsGame from './components/ConnectStarsGame';

function App() {
  const [currentView, setCurrentView] = useState('home');

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col items-center justify-center p-6 font-sans relative overflow-hidden">
      {/* Background Gradients */}
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-blue-600 rounded-full mix-blend-multiply filter blur-[120px] opacity-20"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-purple-600 rounded-full mix-blend-multiply filter blur-[120px] opacity-20"></div>

      <div className="w-full max-w-6xl flex items-center justify-between mb-8 relative z-10">
        <div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight flex items-center gap-2">
            <span className="w-3 h-3 bg-blue-500 rounded-full inline-block shadow-[0_0_10px_rgba(59,130,246,0.8)]"></span>
            CogniTrack
          </h1>
          <p className="text-sm text-slate-400 font-medium tracking-widest uppercase mt-1">Pediatric Platform</p>
        </div>

        {currentView !== 'home' && (
          <button
            onClick={() => setCurrentView('home')}
            className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 text-sm font-semibold text-slate-300 transition-all active:scale-95"
          >
            &larr; Exit Module
          </button>
        )}
      </div>

      {currentView === 'home' ? (
        <div className="w-full max-w-6xl flex flex-col items-center justify-center animate-fade-in relative z-10">
          <div className="text-center mb-12">
            <h2 className="text-5xl font-extrabold text-white mb-4 tracking-tight">Welcome to CogniTrack</h2>
            <p className="text-lg text-slate-400 max-w-2xl mx-auto font-medium">
              Select a cognitive testing module below to begin a new session.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 w-full">
            {/* Go/No-Go Module Card */}
            <div
              onClick={() => setCurrentView('gonogo')}
              className="group cursor-pointer bg-white/5 backdrop-blur-xl border border-white/10 p-8 rounded-3xl transition-all hover:-translate-y-2 hover:bg-white/10 hover:border-blue-500/50 hover:shadow-[0_8px_32px_rgba(59,130,246,0.2)] text-left flex flex-col h-full relative overflow-hidden"
            >
              <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center mb-6 shadow-lg group-hover:scale-110 transition-transform">
                <span className="text-2xl text-white">🎯</span>
              </div>
              <h3 className="text-2xl font-bold text-white mb-2">Go / No-Go</h3>
              <p className="text-slate-400 text-sm leading-relaxed mb-6 flex-1">
                Measures sustained attention and response inhibition through rapid visual stimuli.
              </p>
              <div className="mt-auto flex items-center text-blue-400 font-bold text-sm group-hover:text-blue-300 transition-colors">
                Start Module &rarr;
              </div>
            </div>

            {/* Memory Span Module Card */}
            <div
              onClick={() => setCurrentView('memory')}
              className="group cursor-pointer bg-white/5 backdrop-blur-xl border border-white/10 p-8 rounded-3xl transition-all hover:-translate-y-2 hover:bg-white/10 hover:border-purple-500/50 hover:shadow-[0_8px_32px_rgba(168,85,247,0.2)] text-left flex flex-col h-full relative overflow-hidden"
            >
              <div className="w-14 h-14 bg-gradient-to-br from-purple-500 to-pink-600 rounded-2xl flex items-center justify-center mb-6 shadow-lg group-hover:scale-110 transition-transform">
                <span className="text-2xl text-white">🧩</span>
              </div>
              <h3 className="text-2xl font-bold text-white mb-2">Memory Span</h3>
              <p className="text-slate-400 text-sm leading-relaxed mb-6 flex-1">
                Assess working memory capacity and spatial sequence retention through block-tapping.
              </p>
              <div className="mt-auto flex items-center text-purple-400 font-bold text-sm group-hover:text-purple-300 transition-colors">
                Start Module &rarr;
              </div>
            </div>

            {/* Shape Shifter Module Card */}
            <div
              onClick={() => setCurrentView('flexibility')}
              className="group cursor-pointer bg-white/5 backdrop-blur-xl border border-white/10 p-8 rounded-3xl transition-all hover:-translate-y-2 hover:bg-white/10 hover:border-amber-500/50 hover:shadow-[0_8px_32px_rgba(245,158,11,0.2)] text-left flex flex-col h-full relative overflow-hidden"
            >
              <div className="w-14 h-14 bg-gradient-to-br from-amber-500 to-rose-600 rounded-2xl flex items-center justify-center mb-6 shadow-lg group-hover:scale-110 transition-transform">
                <span className="text-2xl text-white">✨</span>
              </div>
              <h3 className="text-2xl font-bold text-white mb-2">Shape Shifter</h3>
              <p className="text-slate-400 text-sm leading-relaxed mb-6 flex-1">
                Tests cognitive flexibility and executive function through dynamic rule-switching card sort.
              </p>
              <div className="mt-auto flex items-center text-amber-400 font-bold text-sm group-hover:text-amber-300 transition-colors">
                Start Module &rarr;
              </div>
            </div>

            {/* Connect the Stars Module Card */}
            <div
              onClick={() => setCurrentView('speed')}
              className="group cursor-pointer bg-white/5 backdrop-blur-xl border border-white/10 p-8 rounded-3xl transition-all hover:-translate-y-2 hover:bg-white/10 hover:border-fuchsia-500/50 hover:shadow-[0_8px_32px_rgba(217,70,239,0.2)] text-left flex flex-col h-full relative overflow-hidden"
            >
              <div className="w-14 h-14 bg-gradient-to-br from-indigo-500 to-fuchsia-600 rounded-2xl flex items-center justify-center mb-6 shadow-lg group-hover:scale-110 transition-transform">
                <span className="text-2xl text-white">✨</span>
              </div>
              <h3 className="text-2xl font-bold text-white mb-2">Connect Stars</h3>
              <p className="text-slate-400 text-sm leading-relaxed mb-6 flex-1">
                Evaluate processing speed and visual search capabilities using a dynamic trail-making task.
              </p>
              <div className="mt-auto flex items-center text-fuchsia-400 font-bold text-sm group-hover:text-fuchsia-300 transition-colors">
                Start Module &rarr;
              </div>
            </div>

            {/* Dashboard Card */}
            <div
              onClick={() => setCurrentView('dashboard')}
              className="group cursor-pointer bg-white/5 backdrop-blur-xl border border-white/10 p-8 rounded-3xl transition-all hover:-translate-y-2 hover:bg-white/10 hover:border-teal-500/50 hover:shadow-[0_8px_32px_rgba(20,184,166,0.2)] text-left flex flex-col h-full relative overflow-hidden lg:col-span-2"
            >
              <div className="w-14 h-14 bg-gradient-to-br from-teal-500 to-emerald-600 rounded-2xl flex items-center justify-center mb-6 shadow-lg group-hover:scale-110 transition-transform">
                <span className="text-2xl text-white">📊</span>
              </div>
              <h3 className="text-2xl font-bold text-white mb-2">Clinical Dashboard</h3>
              <p className="text-slate-400 text-sm leading-relaxed mb-6 flex-1 max-w-xl">
                View comprehensive AI-generated cognitive profiles, radar mapping, and custom clinical prescriptions based on aggregate telemetry across all modules.
              </p>
              <div className="mt-auto flex items-center text-teal-400 font-bold text-sm group-hover:text-teal-300 transition-colors">
                View Analytics &rarr;
              </div>
            </div>
          </div>
        </div>
      ) : currentView === 'gonogo' ? (
        <GoNoGoGame onBackToHome={() => setCurrentView('home')} />
      ) : currentView === 'memory' ? (
        <MemoryGame onBackToHome={() => setCurrentView('home')} />
      ) : currentView === 'flexibility' ? (
        <ShapeShifterGame onBackToHome={() => setCurrentView('home')} />
      ) : currentView === 'speed' ? (
        <ConnectStarsGame onBackToHome={() => setCurrentView('home')} />
      ) : (
        <ClinicalDashboard onBackToHome={() => setCurrentView('home')} childId="test_user_01" />
      )}
    </div>
  )
}

export default App;
