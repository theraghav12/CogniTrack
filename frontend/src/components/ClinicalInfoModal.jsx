import React from 'react';

export default function ClinicalInfoModal({ isOpen, onClose, title, measures, impact, link }) {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div 
                className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm transition-opacity"
                onClick={onClose}
            ></div>
            
            <div className="bg-slate-900 border border-white/10 rounded-3xl p-8 max-w-lg w-full relative z-10 shadow-2xl animate-fade-in">
                <button 
                    onClick={onClose}
                    className="absolute top-4 right-4 text-slate-400 hover:text-white transition-colors"
                >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                </button>

                <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg">
                        <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"></path></svg>
                    </div>
                    <h3 className="text-2xl font-bold text-white tracking-tight">Clinical Context</h3>
                </div>

                <div className="space-y-6">
                    <div>
                        <h4 className="text-xs font-bold text-indigo-400 uppercase tracking-widest mb-1">Scientific Foundation</h4>
                        <p className="text-slate-300 font-medium">{title}</p>
                    </div>

                    <div>
                        <h4 className="text-xs font-bold text-emerald-400 uppercase tracking-widest mb-1">What it Measures</h4>
                        <p className="text-slate-300 text-sm leading-relaxed">{measures}</p>
                    </div>

                    <div className="bg-white/5 rounded-2xl p-4 border border-white/5">
                        <h4 className="text-xs font-bold text-amber-400 uppercase tracking-widest mb-1">Clinical Impact</h4>
                        <p className="text-slate-300 text-sm leading-relaxed">{impact}</p>
                    </div>

                    <div className="pt-2">
                        <a 
                            href={link} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="flex items-center justify-center gap-2 w-full py-3 px-4 bg-white/10 hover:bg-white/15 border border-white/10 rounded-xl text-white font-semibold transition-all hover:shadow-[0_0_15px_rgba(255,255,255,0.1)] active:scale-[0.98]"
                        >
                            View Literature on PubMed
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"></path></svg>
                        </a>
                        <p className="text-center text-xs text-slate-500 mt-3">External links open in a new tab</p>
                    </div>
                </div>
            </div>
        </div>
    );
}
