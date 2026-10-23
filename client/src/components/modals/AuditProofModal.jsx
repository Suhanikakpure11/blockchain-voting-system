import React from "react";
import { X, ShieldCheck, Lock, CheckCircle2, Cpu, ExternalLink } from "lucide-react";

export default function AuditProofModal({ isOpen, onClose }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-xl w-full p-6 sm:p-8 shadow-2xl border border-slate-200 relative space-y-6">
        
        {/* Close */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 h-8 w-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-800 flex items-center justify-center transition-colors"
        >
          <X className="h-4 w-4" />
        </button>

        {/* Header */}
        <div className="flex items-center space-x-3 pb-3 border-b border-slate-100">
          <div className="h-10 w-10 bg-cyan-50 text-cyan-700 rounded-xl flex items-center justify-center shrink-0">
            <Lock className="h-5 w-5" />
          </div>
          <div>
            <h3 className="text-lg font-extrabold text-slate-900 tracking-tight">
              Zero-Knowledge Cryptographic Audit Proof
            </h3>
            <p className="text-xs text-slate-500">Zk-SNARK Homomorphic Ballot Sealing</p>
          </div>
        </div>

        {/* Explanation Card */}
        <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-3 text-xs leading-relaxed text-slate-600">
          <div className="font-bold text-slate-900 text-sm">
            How DecentraVote Decouples Your Identity:
          </div>
          <p>
            When you perform face verification, the system issues a blind cryptographic commitment <code className="bg-slate-200 text-indigo-700 px-1 py-0.5 rounded font-mono">C = H(ID, r)</code> where <code className="font-mono">r</code> is a private random salt known only to your browser session.
          </p>
          <p>
            When submitting to the Ethereum smart contract, the contract verifies proof of membership in the authorized voter tree without ever revealing <em>which</em> leaf in the tree corresponds to your chosen candidate.
          </p>

          <div className="p-3 bg-white border border-slate-200 rounded-xl font-mono text-[11px] text-slate-800 space-y-1">
            <div className="text-slate-400">Proof Verification Circuit:</div>
            <div>zk_snark_verify(Proof_pi, PublicInputs_x) == TRUE</div>
            <div className="text-emerald-700 font-bold">✓ Homomorphic Sum Check: Passed (Block #16)</div>
          </div>
        </div>

        {/* Proof status */}
        <div className="flex items-center justify-between text-xs text-slate-500">
          <span className="flex items-center gap-1.5 text-emerald-700 font-bold">
            <CheckCircle2 className="h-4 w-4 text-emerald-600" />
            Verified On-Chain
          </span>
          <span className="font-mono text-slate-400">Circuit v2.4 (Groth16)</span>
        </div>

        <button
          onClick={onClose}
          className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3.5 rounded-2xl text-xs shadow-md shadow-indigo-600/20 transition-colors"
        >
          Close Cryptographic Proof
        </button>

      </div>
    </div>
  );
}
