import React from "react";
import { Award, BookOpen, Layers, CheckCircle2, Shield, Cpu, Code2, Users } from "lucide-react";

export default function AboutModal() {
  return (
    <div className="max-w-4xl mx-auto py-6 px-4 space-y-6">
      {/* College Academic Title Sheet */}
      <div className="glass-card rounded-2xl p-6 sm:p-8 border border-slate-800 text-center space-y-3 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-indigo-500 via-violet-500 to-indigo-500"></div>

        <div className="text-xs uppercase font-extrabold tracking-widest text-indigo-400">
          Shri Sant Gajanan Maharaj College of Engineering, Shegaon
        </div>
        <div className="text-sm font-semibold text-slate-300">
          Department of Computer Science & Engineering | Final Year, Seventh Semester (2026-2027)
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight mt-2">
          Decentralized Voting System Using Face Recognition and Blockchain
        </h1>
        <div className="text-xs font-mono text-slate-400">
          Subject: Blockchain Fundamentals (7KS05) TEC
        </div>

        {/* Project Authors & Guide */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-6 pt-6 border-t border-slate-800/80 text-left">
          <div className="bg-slate-900/60 p-4 rounded-xl border border-slate-800">
            <div className="text-xs font-bold text-indigo-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <Users className="h-4 w-4" /> Student Authors
            </div>
            <ul className="text-xs text-slate-300 space-y-1 font-medium">
              <li>• Shravani Raut [Roll No: 27]</li>
              <li>• Shreya Katole [Roll No: 28]</li>
              <li>• Suhani Kakpure [Roll No: 33]</li>
            </ul>
          </div>

          <div className="bg-slate-900/60 p-4 rounded-xl border border-slate-800">
            <div className="text-xs font-bold text-indigo-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <Award className="h-4 w-4" /> Project Guide
            </div>
            <div className="text-sm font-bold text-white">Prof. Dr. N. M. Kandoi</div>
            <div className="text-xs text-slate-400">Professor, Dept. of Computer Science & Engineering</div>
          </div>
        </div>
      </div>

      {/* Abstract & Problem Statement */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="glass-card rounded-2xl p-6 border border-slate-800 space-y-3">
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <BookOpen className="h-4 w-4 text-indigo-400" />
            (iii) Abstract
          </h3>
          <p className="text-xs text-slate-300 leading-relaxed text-justify">
            Traditional voting systems may face challenges such as voter impersonation, unauthorized voting, and manipulation of voting records. Face recognition provides biometric-based voter authentication, while blockchain offers a decentralized and tamper-resistant platform for securely recording votes. This project explores a Decentralized Voting System Using Face Recognition and Blockchain, where voters are authenticated through face recognition before casting their votes. The voting transaction is then recorded on the blockchain using a smart contract, ensuring transparency and integrity of voting records. The system involves the Election Admin, Voter, and Blockchain Network, and aims to provide a secure, reliable, and transparent electronic voting mechanism.
          </p>
        </div>

        <div className="glass-card rounded-2xl p-6 border border-slate-800 space-y-3">
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <Shield className="h-4 w-4 text-rose-400" />
            (iv) Problem Statement
          </h3>
          <p className="text-xs text-slate-300 leading-relaxed text-justify">
            Conventional voting systems depend on centralized authorities and manual voter verification, which can be time-consuming and vulnerable to impersonation, duplicate voting, and manipulation of voting records. There is a need for a secure and transparent voting system where voter identity can be verified through face recognition and votes can be recorded on a decentralized blockchain, reducing the risk of unauthorized voting and tampering while ensuring the integrity of election records.
          </p>
        </div>
      </div>

      {/* Objectives */}
      <div className="glass-card rounded-2xl p-6 border border-slate-800 space-y-3">
        <h3 className="text-base font-bold text-white flex items-center gap-2">
          <CheckCircle2 className="h-4 w-4 text-emerald-400" />
          (v) Objectives
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-slate-300">
          <div className="flex items-start gap-2 bg-slate-900/50 p-3 rounded-xl border border-slate-800">
            <span className="text-emerald-400 font-bold">✓</span>
            <span>Develop a decentralized voting system using face recognition and blockchain technology.</span>
          </div>
          <div className="flex items-start gap-2 bg-slate-900/50 p-3 rounded-xl border border-slate-800">
            <span className="text-emerald-400 font-bold">✓</span>
            <span>Use face recognition for secure and reliable voter identity verification.</span>
          </div>
          <div className="flex items-start gap-2 bg-slate-900/50 p-3 rounded-xl border border-slate-800">
            <span className="text-emerald-400 font-bold">✓</span>
            <span>Prevent unauthorized and duplicate voting through biometric authentication.</span>
          </div>
          <div className="flex items-start gap-2 bg-slate-900/50 p-3 rounded-xl border border-slate-800">
            <span className="text-emerald-400 font-bold">✓</span>
            <span>Record voting transactions securely and immutably on the blockchain using smart contracts.</span>
          </div>
          <div className="flex items-start gap-2 bg-slate-900/50 p-3 rounded-xl border border-slate-800">
            <span className="text-emerald-400 font-bold">✓</span>
            <span>Provide a transparent and tamper-resistant mechanism for maintaining voting records.</span>
          </div>
          <div className="flex items-start gap-2 bg-slate-900/50 p-3 rounded-xl border border-slate-800">
            <span className="text-emerald-400 font-bold">✓</span>
            <span>Reduce the risk of voter impersonation, vote manipulation, and fraudulent voting.</span>
          </div>
        </div>
      </div>

      {/* Methodology Architecture */}
      <div className="glass-card rounded-2xl p-6 border border-slate-800 space-y-4">
        <h3 className="text-base font-bold text-white flex items-center gap-2">
          <Layers className="h-4 w-4 text-indigo-400" />
          (vi) System Methodology & Architecture
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 text-center text-xs">
          <div className="bg-slate-900 p-4 rounded-xl border border-slate-800">
            <div className="h-8 w-8 rounded-lg bg-indigo-500/20 text-indigo-400 flex items-center justify-center mx-auto mb-2 font-bold">1</div>
            <div className="font-bold text-white">React.js UI & WebCam</div>
            <div className="text-[11px] text-slate-400 mt-1">Ethers.js & MetaMask wallet interaction</div>
          </div>
          <div className="bg-slate-900 p-4 rounded-xl border border-slate-800">
            <div className="h-8 w-8 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto mb-2 font-bold">2</div>
            <div className="font-bold text-white">Face Recognition</div>
            <div className="text-[11px] text-slate-400 mt-1">128-d biometric landmark verification & liveness check</div>
          </div>
          <div className="bg-slate-900 p-4 rounded-xl border border-slate-800">
            <div className="h-8 w-8 rounded-lg bg-cyan-500/20 text-cyan-400 flex items-center justify-center mx-auto mb-2 font-bold">3</div>
            <div className="font-bold text-white">Solidity Smart Contract</div>
            <div className="text-[11px] text-slate-400 mt-1">Deployed on Ethereum via Hardhat</div>
          </div>
          <div className="bg-slate-900 p-4 rounded-xl border border-slate-800">
            <div className="h-8 w-8 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center mx-auto mb-2 font-bold">4</div>
            <div className="font-bold text-white">Express Backend</div>
            <div className="text-[11px] text-slate-400 mt-1">Audit log synchronization and biometric storage</div>
          </div>
        </div>
      </div>
    </div>
  );
}
