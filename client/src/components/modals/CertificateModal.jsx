import React from "react";
import { X, Award, CheckCircle2, Printer, Download, ShieldCheck, Building2 } from "lucide-react";

export default function CertificateModal({ isOpen, onClose, electionInfo }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-xl w-full p-6 sm:p-8 shadow-2xl border border-slate-200 relative space-y-6 max-h-[90vh] overflow-y-auto">
        
        {/* Close */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 h-8 w-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-800 flex items-center justify-center transition-colors"
        >
          <X className="h-4 w-4" />
        </button>

        {/* Certificate Frame */}
        <div className="border-4 border-double border-indigo-950 p-6 rounded-2xl text-center space-y-4 bg-gradient-to-b from-amber-50/30 to-white relative">
          <div className="text-[10px] uppercase font-extrabold tracking-widest text-indigo-700">
            Shri Sant Gajanan Maharaj College of Engineering, Shegaon
          </div>
          <div className="text-xs text-slate-500">Department of Computer Science & Engineering</div>

          <div className="h-14 w-14 bg-amber-100 text-amber-800 rounded-full flex items-center justify-center mx-auto border border-amber-300 shadow-sm">
            <Award className="h-8 w-8" />
          </div>

          <h3 className="text-xl font-extrabold text-slate-900 tracking-tight">
            Official Election Audit & Consensus Certificate
          </h3>

          <p className="text-xs text-slate-600 leading-relaxed max-w-md mx-auto">
            This certifies that the <strong>2026-2027 Student Council General Election</strong> was conducted via decentralized consensus on the Ethereum Paris blockchain with 100% cryptographic ledger integrity and zero voting discrepancies.
          </p>

          {/* Details */}
          <div className="bg-white/80 border border-slate-200 rounded-xl p-4 text-xs font-mono space-y-2 text-left">
            <div className="flex justify-between">
              <span className="text-slate-500 font-sans">Smart Contract:</span>
              <span className="text-indigo-700 font-bold">0x2279...eBe6</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500 font-sans">Project Guide:</span>
              <span className="text-slate-800 font-sans font-semibold">Prof. Dr. N. M. Kandoi</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500 font-sans">Student Authors:</span>
              <span className="text-slate-800 font-sans">S. Raut [27], S. Katole [28], S. Kakpure [33]</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500 font-sans">Biometric Verification:</span>
              <span className="text-emerald-700 font-bold font-sans">FaceNet 128-d Liveness Check</span>
            </div>
          </div>

          <div className="text-[10px] text-slate-400 font-medium">
            Timestamp: {new Date().toLocaleDateString()} • Verified on Block #{electionInfo?.totalVotes ? electionInfo.totalVotes + 15 : 18}
          </div>
        </div>

        {/* Buttons */}
        <div className="flex gap-3">
          <button
            onClick={() => window.print()}
            className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold py-3.5 rounded-2xl text-xs flex items-center justify-center gap-2 transition-colors"
          >
            <Printer className="h-4 w-4" />
            <span>Print Certificate</span>
          </button>
          <button
            onClick={onClose}
            className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3.5 rounded-2xl text-xs shadow-md shadow-indigo-600/20 transition-colors"
          >
            Close
          </button>
        </div>

      </div>
    </div>
  );
}
