import React, { useState, useEffect } from "react";
import { Cpu, Search, CheckCircle2, XCircle, RefreshCw, ExternalLink, ShieldCheck, Database } from "lucide-react";

export default function AuditLedger({ contract, electionInfo }) {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [verifyResult, setVerifyResult] = useState(null);
  const [verifying, setVerifying] = useState(false);

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/audit-trail");
      const data = await res.json();
      setEvents(data);
    } catch (e) {
      console.error("Failed to load audit trail:", e);
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyAddress = async (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    setVerifying(true);
    setVerifyResult(null);

    try {
      if (!contract) throw new Error("Contract connection not ready");
      const voterData = await contract.getVoter(searchQuery.trim());

      if (!voterData.isRegistered) {
        setVerifyResult({
          found: false,
          message: "Address is not registered in the voting smart contract.",
        });
      } else {
        setVerifyResult({
          found: true,
          voterId: voterData.voterId,
          hasVoted: voterData.hasVoted,
          votedCandidateId: Number(voterData.votedCandidateId),
          timestamp: Number(voterData.votedTimestamp),
          message: voterData.hasVoted
            ? "VOTE VERIFIED: Ballot successfully recorded on Ethereum ledger."
            : "REGISTERED: Voter is authorized but has not yet cast a ballot.",
        });
      }
    } catch (err) {
      setVerifyResult({
        found: false,
        message: "Verification lookup failed: " + err.message,
      });
    } finally {
      setVerifying(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto py-6 px-4 space-y-6">
      {/* Title */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
              <Database className="h-3 w-3" /> Immutable Audit Ledger
            </span>
          </div>
          <h2 className="text-2xl font-bold text-white mt-1">Blockchain Event Explorer</h2>
          <p className="text-xs text-slate-400">
            Every voter registration and ballot submission is signed and indelibly committed to the Ethereum blockchain blocks.
          </p>
        </div>

        <button
          onClick={fetchEvents}
          disabled={loading}
          className="bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 px-3.5 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all"
        >
          <RefreshCw className={`h-3.5 w-3.5 ${loading ? "animate-spin text-cyan-400" : ""}`} />
          <span>Sync Events</span>
        </button>
      </div>

      {/* Verify Ballot Search Box */}
      <div className="glass-card rounded-2xl p-6 border border-slate-800 space-y-4">
        <h3 className="text-sm font-bold text-white flex items-center gap-2">
          <Search className="h-4 w-4 text-cyan-400" />
          Verify Individual Voter Ballot Status
        </h3>

        <form onSubmit={handleVerifyAddress} className="flex flex-col sm:flex-row gap-3">
          <input
            type="text"
            placeholder="Enter Ethereum Wallet Address (0x...)"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="flex-1 bg-slate-900 border border-slate-700 rounded-xl px-4 py-2.5 text-xs text-white font-mono focus:outline-none focus:ring-2 focus:ring-cyan-500"
          />
          <button
            type="submit"
            disabled={verifying}
            className="bg-cyan-600 hover:bg-cyan-500 text-white font-bold px-5 py-2.5 rounded-xl text-xs shadow-md shadow-cyan-600/30 flex items-center justify-center gap-2 transition-all disabled:opacity-50"
          >
            {verifying ? <RefreshCw className="h-4 w-4 animate-spin" /> : <ShieldCheck className="h-4 w-4" />}
            <span>Verify on Blockchain</span>
          </button>
        </form>

        {verifyResult && (
          <div
            className={`p-4 rounded-xl border text-xs font-mono space-y-2 ${
              verifyResult.found && verifyResult.hasVoted
                ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-300"
                : verifyResult.found
                ? "bg-amber-500/10 border-amber-500/30 text-amber-300"
                : "bg-rose-500/10 border-rose-500/30 text-rose-300"
            }`}
          >
            <div className="font-bold flex items-center gap-2 text-sm">
              {verifyResult.found && verifyResult.hasVoted ? (
                <CheckCircle2 className="h-5 w-5 text-emerald-400" />
              ) : (
                <XCircle className="h-5 w-5 text-rose-400" />
              )}
              <span>{verifyResult.message}</span>
            </div>
            {verifyResult.found && (
              <div className="text-slate-300 space-y-1 pt-2 border-t border-white/10 font-sans text-xs">
                <div>Voter ID: <span className="font-mono text-cyan-300 font-bold">{verifyResult.voterId}</span></div>
                <div>Status: <span className="font-semibold">{verifyResult.hasVoted ? "Voted" : "Not Voted Yet"}</span></div>
                {verifyResult.hasVoted && (
                  <div>Candidate ID Cast: <span className="font-mono text-emerald-400 font-bold">#{verifyResult.votedCandidateId}</span></div>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Audit Log Table */}
      <div className="glass-card rounded-2xl p-5 border border-slate-800 space-y-4">
        <h3 className="text-sm font-bold text-white flex items-center gap-2">
          <Cpu className="h-4 w-4 text-indigo-400" />
          Recent Blockchain Transactions & Events
        </h3>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400">
                <th className="pb-2">Event Type</th>
                <th className="pb-2">Details</th>
                <th className="pb-2">Block #</th>
                <th className="pb-2">Transaction Hash</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-mono">
              {events.length > 0 ? (
                events.map((ev, i) => (
                  <tr key={i} className="hover:bg-slate-800/30">
                    <td className="py-3 font-sans">
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          ev.type === "VoteCast"
                            ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                            : ev.type === "VoterRegistered"
                            ? "bg-indigo-500/20 text-indigo-300 border border-indigo-500/30"
                            : "bg-cyan-500/20 text-cyan-300 border border-cyan-500/30"
                        }`}
                      >
                        {ev.type}
                      </span>
                    </td>
                    <td className="py-3 font-sans text-slate-300">
                      {ev.type === "VoteCast" && (
                        <span>
                          Voter <strong className="text-indigo-400">{ev.voterId}</strong> voted for Candidate #
                          {ev.candidateId}
                        </span>
                      )}
                      {ev.type === "VoterRegistered" && (
                        <span>
                          Enrolled <strong className="text-indigo-400">{ev.voterId}</strong>
                        </span>
                      )}
                      {ev.type === "CandidateAdded" && (
                        <span>
                          Candidate #{ev.candidateId}: <strong className="text-cyan-400">{ev.name}</strong> ({ev.party})
                        </span>
                      )}
                    </td>
                    <td className="py-3 text-indigo-300 font-bold">#{ev.blockNumber}</td>
                    <td className="py-3 text-slate-400 text-[11px] max-w-[200px] truncate" title={ev.txHash}>
                      {ev.txHash}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={4} className="py-8 text-center text-slate-500 font-sans">
                    No transactions recorded on blockchain yet. Cast a vote or register a voter to populate the ledger.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
