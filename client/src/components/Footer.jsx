import React from "react";
import { Vote } from "lucide-react";

export default function Footer({ setActiveTab }) {
  return (
    <footer className="bg-white border-t border-slate-200 mt-16 py-8 text-xs text-slate-500">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          
          {/* Logo & Network Brand */}
          <div className="flex items-center space-x-2.5">
            <div className="h-6 w-6 rounded-lg bg-indigo-600 flex items-center justify-center text-white">
              <Vote className="h-3.5 w-3.5" />
            </div>
            <span className="font-bold text-slate-800 text-sm">DecentraVote Civic Network</span>
          </div>

          {/* Links */}
          <div className="flex flex-wrap items-center gap-6 text-slate-500 font-medium">
            <button onClick={() => setActiveTab("help")} className="hover:text-indigo-600 transition-colors">
              Integrity & Verifiability
            </button>
            <button onClick={() => setActiveTab("help")} className="hover:text-indigo-600 transition-colors">
              Campus Electoral Code
            </button>
            <button onClick={() => setActiveTab("help")} className="hover:text-indigo-600 transition-colors">
              Privacy Guarantee
            </button>
          </div>

          {/* Copyright */}
          <div className="text-slate-400 font-normal">
            © 2026 Collegiate Democratic Governance Initiative / SSGMCE
          </div>
        </div>
      </div>
    </footer>
  );
}
