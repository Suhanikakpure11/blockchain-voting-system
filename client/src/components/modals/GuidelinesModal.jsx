import React from "react";
import { X, FileText, CheckCircle2, Shield, AlertCircle, Download } from "lucide-react";

export default function GuidelinesModal({ isOpen, onClose }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl border border-slate-200 relative space-y-6 max-h-[90vh] overflow-y-auto">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 h-8 w-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-800 flex items-center justify-center transition-colors"
        >
          <X className="h-4 w-4" />
        </button>

        {/* Header */}
        <div className="flex items-center space-x-3 pb-4 border-b border-slate-100">
          <div className="h-10 w-10 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center shrink-0">
            <FileText className="h-5 w-5" />
          </div>
          <div>
            <h3 className="text-lg font-extrabold text-slate-900 tracking-tight">
              Official Campus Election Guidelines & Bylaws
            </h3>
            <div className="text-xs text-slate-500">
              Approved by SSGMCE Electoral Commission • Autumn Session 2026-2027
            </div>
          </div>
        </div>

        {/* Content sections */}
        <div className="space-y-4 text-xs text-slate-600 leading-relaxed">
          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-2">
            <h4 className="font-extrabold text-slate-900 text-sm flex items-center gap-2">
              <span className="h-5 w-5 rounded-full bg-indigo-600 text-white text-[11px] flex items-center justify-center">1</span>
              Voter Eligibility & Verification
            </h4>
            <p>
              Every student officially registered in the Department of Computer Science & Engineering with an assigned roll number and student ID is eligible to cast one ballot. Prior to casting, biometric face verification via webcam is mandatory to prevent voter impersonation.
            </p>
          </div>

          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-2">
            <h4 className="font-extrabold text-slate-900 text-sm flex items-center gap-2">
              <span className="h-5 w-5 rounded-full bg-indigo-600 text-white text-[11px] flex items-center justify-center">2</span>
              One-Person-One-Vote Rule
            </h4>
            <p>
              The smart contract permanently asserts that each verified wallet address can only execute the <code className="bg-slate-200 text-indigo-700 px-1 py-0.5 rounded font-mono">castVote()</code> function once. Duplicate attempts are automatically reverted on-chain with zero impact on the tally.
            </p>
          </div>

          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-2">
            <h4 className="font-extrabold text-slate-900 text-sm flex items-center gap-2">
              <span className="h-5 w-5 rounded-full bg-indigo-600 text-white text-[11px] flex items-center justify-center">3</span>
              Biometric Data Privacy (Zero Storage)
            </h4>
            <p>
              No facial image, video feed, or biometric photographs are transmitted or stored on the blockchain ledger. Face matching uses on-device 128-dimensional mathematical embeddings to calculate Euclidean confidence (<code className="font-mono">d &lt; 0.50</code>).
            </p>
          </div>

          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-2">
            <h4 className="font-extrabold text-slate-900 text-sm flex items-center gap-2">
              <span className="h-5 w-5 rounded-full bg-indigo-600 text-white text-[11px] flex items-center justify-center">4</span>
              Tally Transparency & Receipts
            </h4>
            <p>
              Once mined, each vote emits an immutable event on the Ethereum network. Voters receive a cryptographic receipt hash that allows verifying participation on the Audit Ledger without exposing the chosen candidate.
            </p>
          </div>
        </div>

        {/* Action Button */}
        <div className="flex gap-3 pt-2">
          <button
            onClick={() => window.print()}
            className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold py-3.5 rounded-2xl text-xs flex items-center justify-center gap-2 transition-colors"
          >
            <Download className="h-4 w-4" />
            <span>Download Official PDF Copy</span>
          </button>
          <button
            onClick={onClose}
            className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3.5 rounded-2xl text-xs shadow-md shadow-indigo-600/20 transition-colors"
          >
            I Understand & Agree
          </button>
        </div>
      </div>
    </div>
  );
}
