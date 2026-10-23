import React from "react";
import { Activity, Trophy, Users, Vote, CheckCircle2, TrendingUp, RefreshCw } from "lucide-react";

export default function ResultsPortal({ electionInfo, refreshElectionData, isRefreshing }) {
  const candidates = electionInfo?.candidates || [];
  const totalVotes = electionInfo?.totalVotes || 0;
  const registeredCount = electionInfo?.registeredVoterCount || 0;
  const turnoutPercent = registeredCount > 0 ? ((totalVotes / registeredCount) * 100).toFixed(1) : "0.0";

  // Sort candidates by voteCount descending
  const sortedCandidates = [...candidates].sort((a, b) => b.voteCount - a.voteCount);
  const leader = sortedCandidates.length > 0 && totalVotes > 0 ? sortedCandidates[0] : null;

  return (
    <div className="max-w-5xl mx-auto py-6 px-4 space-y-6">
      {/* Header and Live Sync */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
              On-Chain Live Tally
            </span>
            <span className="text-xs text-slate-400 font-mono">Ethereum Localhost</span>
          </div>
          <h2 className="text-2xl font-bold text-white mt-1">Live Election Results</h2>
          <p className="text-xs text-slate-400">
            Real-time vote tallies immutably verified by the smart contract. Tamper-proof and transparent.
          </p>
        </div>

        <button
          onClick={refreshElectionData}
          disabled={isRefreshing}
          className="bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 px-3.5 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all"
        >
          <RefreshCw className={`h-3.5 w-3.5 ${isRefreshing ? "animate-spin text-indigo-400" : ""}`} />
          <span>Refresh Ledger</span>
        </button>
      </div>

      {/* Top Metrics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="glass-card rounded-2xl p-5 border border-slate-800">
          <div className="flex items-center justify-between text-slate-400 mb-2 text-xs font-medium">
            <span>Total Votes Cast</span>
            <Vote className="h-4 w-4 text-indigo-400" />
          </div>
          <div className="text-3xl font-extrabold text-white font-mono">{totalVotes}</div>
          <div className="text-[11px] text-emerald-400 mt-1 flex items-center gap-1">
            <CheckCircle2 className="h-3 w-3" /> Immutably Recorded
          </div>
        </div>

        <div className="glass-card rounded-2xl p-5 border border-slate-800">
          <div className="flex items-center justify-between text-slate-400 mb-2 text-xs font-medium">
            <span>Eligible Voters</span>
            <Users className="h-4 w-4 text-cyan-400" />
          </div>
          <div className="text-3xl font-extrabold text-white font-mono">{registeredCount}</div>
          <div className="text-[11px] text-slate-400 mt-1">Biometrically Enrolled</div>
        </div>

        <div className="glass-card rounded-2xl p-5 border border-slate-800">
          <div className="flex items-center justify-between text-slate-400 mb-2 text-xs font-medium">
            <span>Voter Turnout</span>
            <TrendingUp className="h-4 w-4 text-amber-400" />
          </div>
          <div className="text-3xl font-extrabold text-white font-mono">{turnoutPercent}%</div>
          <div className="text-[11px] text-slate-400 mt-1">Participation rate</div>
        </div>

        <div className="glass-card rounded-2xl p-5 border border-slate-800">
          <div className="flex items-center justify-between text-slate-400 mb-2 text-xs font-medium">
            <span>Current Leader</span>
            <Trophy className="h-4 w-4 text-yellow-400" />
          </div>
          <div className="text-xl font-bold text-white truncate">
            {leader ? leader.name : "Awaiting Votes"}
          </div>
          <div className="text-[11px] text-yellow-400 mt-1 truncate">
            {leader ? `${leader.voteCount} votes (${((leader.voteCount / (totalVotes || 1)) * 100).toFixed(0)}%)` : "No votes cast"}
          </div>
        </div>
      </div>

      {/* Candidate Breakdown / Bar Charts */}
      <div className="glass-card rounded-2xl p-6 border border-slate-800 space-y-6">
        <h3 className="text-base font-bold text-white flex items-center gap-2">
          <Activity className="h-4 w-4 text-indigo-400" />
          Candidate Vote Distribution
        </h3>

        <div className="space-y-5">
          {sortedCandidates.map((cand, idx) => {
            const percentage = totalVotes > 0 ? ((cand.voteCount / totalVotes) * 100).toFixed(1) : "0.0";
            return (
              <div key={cand.id} className="space-y-2 bg-slate-900/60 p-4 rounded-xl border border-slate-800/80">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div
                      className={`h-7 w-7 rounded-lg flex items-center justify-center font-bold text-xs ${
                        idx === 0 && totalVotes > 0
                          ? "bg-yellow-500/20 text-yellow-400 border border-yellow-500/40"
                          : "bg-slate-800 text-slate-400"
                      }`}
                    >
                      #{idx + 1}
                    </div>
                    <img
                      src={cand.symbolUrl || `https://api.dicebear.com/7.x/bottts/svg?seed=${cand.name}`}
                      alt={cand.name}
                      className="w-10 h-10 rounded-xl bg-slate-800 p-0.5 border border-slate-700 object-cover"
                    />
                    <div>
                      <div className="text-sm font-bold text-white">{cand.name}</div>
                      <div className="text-xs text-slate-400">{cand.party}</div>
                    </div>
                  </div>

                  <div className="text-right">
                    <span className="text-lg font-bold text-white font-mono">{cand.voteCount}</span>
                    <span className="text-xs text-slate-400 ml-1">votes</span>
                    <div className="text-xs text-indigo-400 font-mono font-semibold">{percentage}%</div>
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="h-3 w-full bg-slate-800 rounded-full overflow-hidden p-0.5">
                  <div
                    className={`h-full rounded-full transition-all duration-700 ${
                      idx === 0
                        ? "bg-gradient-to-r from-yellow-500 to-amber-500"
                        : "bg-gradient-to-r from-indigo-500 to-violet-500"
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
