import React from "react";
import { Activity, Trophy, Users, Vote, CheckCircle2, TrendingUp, RefreshCw, Award } from "lucide-react";

export default function ResultsView({ electionInfo, refreshElectionData, isRefreshing }) {
  const candidates = electionInfo?.candidates || [
    { id: 1, name: "Dr. Elena Rostova", party: "Digital Rights & Privacy", voteCount: 1 },
    { id: 2, name: "Marcus Vance", party: "Green Campus & Sustainability", voteCount: 0 },
    { id: 3, name: "Sarah Lin", party: "Transparency & Student Welfare", voteCount: 0 },
  ];

  const totalVotes = electionInfo?.totalVotes || candidates.reduce((s, c) => s + c.voteCount, 0);
  const eligibleVoters = electionInfo?.registeredVoterCount || 3;
  const turnoutPercent = eligibleVoters > 0 ? ((totalVotes / eligibleVoters) * 100).toFixed(1) : "0.0";

  // Sort candidates by votes
  const sorted = [...candidates].sort((a, b) => b.voteCount - a.voteCount);
  const leader = sorted.length > 0 && totalVotes > 0 ? sorted[0] : null;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      
      {/* Title Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="bg-indigo-50 text-indigo-700 text-[11px] font-bold px-3 py-0.5 rounded-full border border-indigo-200">
              DecentraVote Tally Engine
            </span>
            <span className="text-xs text-slate-400 font-mono">Hardhat Consensus</span>
          </div>
          <h2 className="text-2xl font-extrabold text-slate-900 mt-1 tracking-tight">
            Live Election Results & Distribution
          </h2>
          <p className="text-xs text-slate-500">
            Real-time vote tallies immutably verified by the Ethereum smart contract. Tamper-proof and transparent.
          </p>
        </div>

        <button
          onClick={refreshElectionData}
          disabled={isRefreshing}
          className="bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 px-4 py-2.5 rounded-2xl text-xs font-bold flex items-center gap-2 shadow-sm transition-all"
        >
          <RefreshCw className={`h-3.5 w-3.5 ${isRefreshing ? "animate-spin text-indigo-600" : "text-slate-400"}`} />
          <span>Refresh Ledger</span>
        </button>
      </div>

      {/* Top 4 Metrics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="decentra-card rounded-2xl p-5">
          <div className="text-[11px] uppercase font-bold text-slate-400 tracking-wider">
            Total Valid Ballots
          </div>
          <div className="text-3xl font-extrabold text-slate-900 mt-1 font-mono">{totalVotes}</div>
          <div className="text-[11px] text-emerald-600 font-medium mt-1 flex items-center gap-1">
            <CheckCircle2 className="h-3 w-3" /> All Cryptographically Sealed
          </div>
        </div>

        <div className="decentra-card rounded-2xl p-5">
          <div className="text-[11px] uppercase font-bold text-slate-400 tracking-wider">
            Voter Turnout Rate
          </div>
          <div className="text-3xl font-extrabold text-slate-900 mt-1 font-mono">{turnoutPercent}%</div>
          <div className="text-[11px] text-slate-500 mt-1">
            {totalVotes} of {eligibleVoters} registered voters
          </div>
        </div>

        <div className="decentra-card rounded-2xl p-5">
          <div className="text-[11px] uppercase font-bold text-slate-400 tracking-wider">
            Current Frontrunner
          </div>
          <div className="text-lg font-extrabold text-slate-900 mt-1 truncate">
            {leader ? leader.name : "Awaiting Votes"}
          </div>
          <div className="text-[11px] text-indigo-600 font-bold mt-1 truncate">
            {leader ? `${leader.voteCount} votes (${((leader.voteCount / (totalVotes || 1)) * 100).toFixed(0)}%)` : "No votes cast"}
          </div>
        </div>

        <div className="decentra-card rounded-2xl p-5">
          <div className="text-[11px] uppercase font-bold text-slate-400 tracking-wider">
            Consensus State
          </div>
          <div className="text-lg font-extrabold text-emerald-600 mt-1 flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></span>
            Active & Verified
          </div>
          <div className="text-[11px] text-slate-400 mt-1 font-mono">
            Smart Contract 0x5FbD...0aa3
          </div>
        </div>
      </div>

      {/* Candidate Breakdown / Bar Charts */}
      <div className="decentra-card rounded-3xl p-6 sm:p-7 shadow-sm space-y-6">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
            <Activity className="h-4 w-4 text-indigo-600" />
            Nominee Vote Distribution & Share
          </h3>
          <span className="text-xs text-slate-400">Ranked by on-chain vote count</span>
        </div>

        <div className="space-y-4">
          {sorted.map((cand, idx) => {
            const percentage = totalVotes > 0 ? ((cand.voteCount / totalVotes) * 100).toFixed(1) : "0.0";
            return (
              <div
                key={cand.id}
                className="p-5 rounded-2xl bg-slate-50/80 border border-slate-200/80 space-y-3"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div
                      className={`h-8 w-8 rounded-xl flex items-center justify-center font-bold text-xs ${
                        idx === 0 && totalVotes > 0
                          ? "bg-amber-100 text-amber-800 border border-amber-300"
                          : "bg-slate-200 text-slate-600"
                      }`}
                    >
                      #{idx + 1}
                    </div>
                    <div>
                      <div className="text-sm font-extrabold text-slate-900 flex items-center gap-2">
                        <span>{cand.name}</span>
                        {idx === 0 && totalVotes > 0 && (
                          <span className="bg-amber-50 text-amber-700 text-[10px] font-bold px-2 py-0.5 rounded-full border border-amber-200">
                            Leading
                          </span>
                        )}
                      </div>
                      <div className="text-xs font-semibold text-indigo-600">{cand.party}</div>
                    </div>
                  </div>

                  <div className="text-right">
                    <span className="text-xl font-extrabold text-slate-900 font-mono">{cand.voteCount}</span>
                    <span className="text-xs text-slate-500 ml-1">votes</span>
                    <div className="text-xs text-indigo-600 font-mono font-bold">{percentage}%</div>
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="h-2.5 w-full bg-slate-200/80 rounded-full overflow-hidden p-0.5">
                  <div
                    className={`h-full rounded-full transition-all duration-700 ${
                      idx === 0
                        ? "bg-indigo-600"
                        : "bg-slate-400"
                    }`}
                    style={{ width: `${Math.max(2, parseFloat(percentage))}%` }}
                  ></div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
