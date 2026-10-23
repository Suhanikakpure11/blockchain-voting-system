import React from "react";
import { X, Award, Users, BookOpen, Shield, CheckCircle2, Layers } from "lucide-react";

export default function ProjectInfoModal({ isOpen, onClose }) {
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

        {/* Academic Header */}
        <div className="text-center space-y-1.5 pb-5 border-b border-slate-100">
          <div className="text-[11px] font-extrabold uppercase tracking-widest text-indigo-700">
            Shri Sant Gajanan Maharaj College of Engineering, Shegaon
          </div>
          <div className="text-xs font-semibold text-slate-500">
            Department of Computer Science & Engineering | Autumn Session 2026-2027
          </div>
          <h3 className="text-xl font-extrabold text-slate-900 tracking-tight mt-1">
            Decentralized Voting System Using Face Recognition and Blockchain
          </h3>
          <div className="text-[11px] font-mono text-slate-400">
            Subject: Blockchain Fundamentals (7KS05) TEC
          </div>
        </div>

        {/* Authors and Guide Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200/80 space-y-2">
            <div className="text-xs font-bold text-indigo-700 uppercase tracking-wider flex items-center gap-1.5">
              <Users className="h-4 w-4" /> Student Authors
            </div>
            <ul className="text-xs text-slate-700 space-y-1 font-medium">
              <li>• Shravani Raut [Roll No: 27]</li>
              <li>• Shreya Katole [Roll No: 28]</li>
              <li>• Suhani Kakpure [Roll No: 33]</li>
            </ul>
          </div>

          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200/80 space-y-2">
            <div className="text-xs font-bold text-indigo-700 uppercase tracking-wider flex items-center gap-1.5">
              <Award className="h-4 w-4" /> Project Guide
            </div>
            <div className="text-sm font-bold text-slate-900">Prof. Dr. N. M. Kandoi</div>
            <div className="text-xs text-slate-500">Professor, Dept. of Computer Science & Engineering</div>
          </div>
        </div>

        {/* Abstract */}
        <div className="space-y-2 text-xs text-slate-600 leading-relaxed text-justify">
          <h4 className="font-extrabold text-slate-900 text-sm flex items-center gap-1.5">
            <BookOpen className="h-4 w-4 text-indigo-600" />
            Project Abstract
          </h4>
          <p>
            Traditional voting systems may face challenges such as voter impersonation, unauthorized voting, and manipulation of voting records. Face recognition provides biometric-based voter authentication, while blockchain offers a decentralized and tamper-resistant platform for securely recording votes. This project explores a Decentralized Voting System Using Face Recognition and Blockchain, where voters are authenticated through face recognition before casting their votes. The voting transaction is then recorded on the blockchain using a smart contract, ensuring transparency and integrity of voting records.
          </p>
        </div>

        {/* Objectives */}
        <div className="space-y-2">
          <h4 className="font-extrabold text-slate-900 text-sm flex items-center gap-1.5">
            <CheckCircle2 className="h-4 w-4 text-emerald-600" />
            Core Objectives
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-slate-700">
            {[
              "Biometric face recognition for secure voter identity verification.",
              "Prevent unauthorized and duplicate voting through on-chain constraints.",
              "Record immutable voting transactions using Solidity smart contracts.",
              "Provide a transparent and tamper-resistant audit mechanism.",
            ].map((obj, i) => (
              <div key={i} className="flex items-start gap-2 bg-slate-50 p-2.5 rounded-xl border border-slate-200/60">
                <span className="text-emerald-600 font-bold shrink-0">✓</span>
                <span>{obj}</span>
              </div>
            ))}
          </div>
        </div>

        <button
          onClick={onClose}
          className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 rounded-2xl text-xs shadow-md shadow-indigo-600/20 transition-colors"
        >
          Close Academic Documentation
        </button>
      </div>
    </div>
  );
}
