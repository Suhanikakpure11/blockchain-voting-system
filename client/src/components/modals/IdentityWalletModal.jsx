import React from "react";
import { X, ShieldCheck, Fingerprint, Wallet, CheckCircle2, Award, Building2, Key, Download } from "lucide-react";

export default function IdentityWalletModal({ isOpen, onClose, voterName, voterId, account, balance }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-2xl border border-slate-200 relative space-y-6">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 h-8 w-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-800 flex items-center justify-center transition-colors"
        >
          <X className="h-4 w-4" />
        </button>

        {/* Header */}
        <div className="text-center space-y-1.5">
          <div className="h-14 w-14 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center mx-auto border border-indigo-200 shadow-sm">
            <Key className="h-7 w-7" />
          </div>
          <h3 className="text-xl font-extrabold text-slate-900 tracking-tight">
            DecentraVote Identity Wallet
          </h3>
          <p className="text-xs text-slate-500">
            Self-Sovereign Identity (SSI) with Biometric Liveness Attestation
          </p>
        </div>

        {/* Digital Identity ID Card */}
        <div className="bg-gradient-to-tr from-indigo-900 via-indigo-800 to-indigo-950 text-white rounded-2xl p-5 shadow-lg relative overflow-hidden space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Building2 className="h-4 w-4 text-indigo-300" />
              <span className="text-[11px] font-bold tracking-wider uppercase text-indigo-200">SSGMCE Student Council</span>
            </div>
            <span className="bg-emerald-500/20 text-emerald-300 border border-emerald-400/40 text-[10px] font-bold px-2 py-0.5 rounded-full">
              ● Active
            </span>
          </div>

          <div className="flex items-center space-x-3.5 pt-2">
            <div className="h-14 w-14 rounded-xl overflow-hidden border-2 border-indigo-400/50 shadow-md shrink-0">
              <img
                src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80"
                alt="Student Voter"
                className="h-full w-full object-cover"
              />
            </div>
            <div>
              <div className="text-base font-extrabold text-white leading-tight">{voterName}</div>
              <div className="text-xs text-indigo-200 font-mono mt-0.5">ID: #{voterId}</div>
              <div className="text-[11px] text-indigo-300">Dept of Computer Science & Engineering</div>
            </div>
          </div>

          <div className="pt-2 border-t border-indigo-700/60 flex items-center justify-between text-[11px] font-mono text-indigo-200">
            <span>EVM Signer:</span>
            <span className="text-emerald-300 truncate max-w-[170px]">
              {account ? `${account.substring(0, 8)}...${account.substring(account.length - 6)}` : "0x7099...79C8"}
            </span>
          </div>
        </div>

        {/* Identity Attributes */}
        <div className="space-y-2.5 text-xs">
          <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-200/80">
            <div className="flex items-center gap-2">
              <Fingerprint className="h-4 w-4 text-indigo-600" />
              <span className="font-bold text-slate-800">Biometric Template</span>
            </div>
            <span className="bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded text-[10px]">
              128-d Vector Enrolled
            </span>
          </div>

          <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-200/80">
            <div className="flex items-center gap-2">
              <Wallet className="h-4 w-4 text-indigo-600" />
              <span className="font-bold text-slate-800">Voting Gas Balance</span>
            </div>
            <span className="font-mono font-bold text-indigo-700">
              {parseFloat(balance || "10000").toFixed(2)} ETH (Pre-funded)
            </span>
          </div>

          <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-200/80">
            <div className="flex items-center gap-2">
              <ShieldCheck className="h-4 w-4 text-emerald-600" />
              <span className="font-bold text-slate-800">Double-Voting Protection</span>
            </div>
            <span className="text-slate-500 font-medium">Smart Contract Enforced</span>
          </div>
        </div>

        {/* Action Button */}
        <button
          onClick={onClose}
          className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3.5 rounded-2xl text-xs shadow-md shadow-indigo-600/20 transition-colors"
        >
          Close Identity Wallet
        </button>
      </div>
    </div>
  );
}
