import React, { useState } from "react";
import { X, Volume2, Type, Eye, Check } from "lucide-react";

export default function AccessibilityModal({ isOpen, onClose }) {
  const [highContrast, setHighContrast] = useState(false);
  const [textSize, setTextSize] = useState("normal");
  const [audioGuided, setAudioGuided] = useState(false);

  if (!isOpen) return null;

  const handleReadAloud = () => {
    if ("speechSynthesis" in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(
        "Welcome to DecentraVote Campus and Civic Portal. You have one active election open: 2026 Annual Community and Campus Election. To proceed, choose nominee 1 Dr. Elena Rostova, nominee 2 Marcus Vance, or nominee 3 Sarah Lin."
      );
      window.speechSynthesis.speak(utterance);
      setAudioGuided(true);
    } else {
      alert("Speech synthesis is not supported on this browser.");
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-2xl border border-slate-200 relative space-y-6">
        
        {/* Close */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 h-8 w-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-800 flex items-center justify-center transition-colors"
        >
          <X className="h-4 w-4" />
        </button>

        {/* Header */}
        <div className="flex items-center space-x-3 pb-3 border-b border-slate-100">
          <div className="h-10 w-10 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center shrink-0">
            <Volume2 className="h-5 w-5" />
          </div>
          <div>
            <h3 className="text-lg font-extrabold text-slate-900 tracking-tight">
              Accessibility & Audio Ballot
            </h3>
            <p className="text-xs text-slate-500">Universal civic access options</p>
          </div>
        </div>

        {/* Options */}
        <div className="space-y-4 text-xs">
          {/* Audio narration */}
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
            <div className="font-bold text-slate-900 flex items-center justify-between">
              <span className="flex items-center gap-2">
                <Volume2 className="h-4 w-4 text-indigo-600" />
                Text-to-Speech Ballot Readout
              </span>
              {audioGuided && <span className="text-[10px] text-emerald-600 font-bold">● Playing</span>}
            </div>
            <p className="text-slate-500 text-[11px] leading-relaxed">
              Listen to the complete ballot instructions, candidate bios, and proposal platforms spoken aloud.
            </p>
            <button
              onClick={handleReadAloud}
              className="mt-2 w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 rounded-xl text-xs flex items-center justify-center gap-1.5 shadow-sm"
            >
              <Volume2 className="h-3.5 w-3.5" />
              <span>Read Ballot Aloud</span>
            </button>
          </div>

          {/* Text scale */}
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
            <div className="font-bold text-slate-900 flex items-center gap-2">
              <Type className="h-4 w-4 text-indigo-600" />
              <span>Text Sizing</span>
            </div>
            <div className="grid grid-cols-3 gap-2 pt-1">
              {["normal", "large", "xlarge"].map((sz) => (
                <button
                  key={sz}
                  onClick={() => setTextSize(sz)}
                  className={`py-2 rounded-xl font-bold uppercase text-[10px] border transition-all ${
                    textSize === sz
                      ? "bg-indigo-600 text-white border-indigo-600 shadow-sm"
                      : "bg-white text-slate-700 border-slate-200 hover:bg-slate-100"
                  }`}
                >
                  {sz}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Close Button */}
        <button
          onClick={onClose}
          className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold py-3.5 rounded-2xl text-xs transition-colors"
        >
          Save & Return to Ballot
        </button>

      </div>
    </div>
  );
}
