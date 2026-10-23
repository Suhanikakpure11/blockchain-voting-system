import React from "react";
import { CheckCircle2, X, Download, ShieldCheck, Printer, ExternalLink, QrCode } from "lucide-react";

export default function ReceiptModal({ isOpen, onClose, receiptData }) {
  if (!isOpen || !receiptData) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-slate-200 relative space-y-6">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 h-8 w-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-800 flex items-center justify-center transition-colors"
        >
          <X className="h-4 w-4" />
        </button>

        {/* Modal Header */}
        <div className="text-center space-y-2">
          <div className="h-14 w-14 bg-emerald-100 text-emerald-600 rounded-2xl flex items-center justify-center mx-auto border border-emerald-200 shadow-sm">
            <CheckCircle2 className="h-7 w-7" />
          </div>
          <h3 className="text-xl font-extrabold text-slate-900 tracking-tight">
            Cryptographic Ballot Receipt
          </h3>
          <p className="text-xs text-slate-500">
            Official immutable voting proof recorded on the Ethereum blockchain.
          </p>
        </div>

        {/* Receipt Slip */}
        <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 space-y-3 font-mono text-xs">
          <div className="flex justify-between pb-2 border-b border-slate-200">
            <span className="text-slate-500 font-sans">Ballot Measure:</span>
            <span className="text-slate-900 font-bold font-sans text-right truncate max-w-[200px]">
              {receiptData.ballotTitle || "2026 Annual Campus Election"}
            </span>
          </div>

          <div className="flex justify-between pb-2 border-b border-slate-200">
            <span className="text-slate-500 font-sans">Voter Identity:</span>
            <span className="text-indigo-600 font-bold font-sans">
              {receiptData.voterName || "Verified Student Voter"}
            </span>
          </div>

          <div className="flex justify-between pb-2 border-b border-slate-200">
            <span className="text-slate-500 font-sans">Voter ID:</span>
            <span className="text-slate-800 font-bold">{receiptData.voterId || "#VOT-8492"}</span>
          </div>

          <div className="flex justify-between pb-2 border-b border-slate-200">
            <span className="text-slate-500 font-sans">Nominee Choice:</span>
            <span className="text-emerald-700 font-bold font-sans">
              {receiptData.candidateName || "Dr. Elena Rostova"}
            </span>
          </div>

          <div className="flex justify-between pb-2 border-b border-slate-200">
            <span className="text-slate-500 font-sans">Block Height:</span>
            <span className="text-slate-900 font-bold">#{receiptData.blockNumber || "18"}</span>
          </div>

          <div className="flex justify-between pb-2 border-b border-slate-200">
            <span className="text-slate-500 font-sans">Timestamp:</span>
            <span className="text-slate-700">{receiptData.timestamp || "Today at 10:45 AM"}</span>
          </div>

          <div className="pt-1">
            <span className="text-slate-500 font-sans block mb-1">DecentraVote Private Receipt Hash:</span>
            <div className="p-3 bg-white border border-slate-200 rounded-xl text-[11px] text-slate-800 break-all select-all">
              {receiptData.txHash || "0x8x7a2f49c011e4d8a1c920fbc89e34a712f0c941"}
            </div>
          </div>
        </div>

        {/* Security Badge */}
        <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1">
          <div className="flex items-center gap-1.5 text-emerald-700 font-medium">
            <ShieldCheck className="h-4 w-4 text-emerald-600" />
            <span>256-bit Homomorphic Cryptographic Seal</span>
          </div>
          <span className="font-mono text-slate-400">Hardhat #31337</span>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3">
          <button
            onClick={() => window.print()}
            className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold py-3 rounded-2xl text-xs flex items-center justify-center gap-2 transition-colors"
          >
            <Printer className="h-4 w-4" />
            <span>Print Receipt</span>
          </button>
          <button
            onClick={onClose}
            className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 rounded-2xl text-xs shadow-md shadow-indigo-600/20 flex items-center justify-center gap-2 transition-colors"
          >
            <span>Done</span>
          </button>
        </div>
      </div>
    </div>
  );
}
