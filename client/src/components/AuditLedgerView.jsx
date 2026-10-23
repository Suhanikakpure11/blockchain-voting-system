import React, { useState, useEffect } from "react";
import { Database, Search, ShieldCheck, CheckCircle2, XCircle, RefreshCw, ExternalLink, Cpu, FileSpreadsheet, Eye } from "lucide-react";
import ReceiptModal from "./modals/ReceiptModal";

export default function AuditLedgerView({ contract, electionInfo }) {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [verifyResult, setVerifyResult] = useState(null);
  const [verifying, setVerifying] = useState(false);
  const [selectedReceipt, setSelectedReceipt] = useState(null);

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/audit-trail");
      const data = await res.json();
      setEvents(Array.isArray(data) ? data : []);
    } catch (e) {
      console.error("Failed to load audit trail:", e);
      setEvents([]);
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    setVerifying(true);
    setVerifyResult(null);

    try {
      if (!contract) throw new Error("Smart contract connection not available");
      const voterData = await contract.getVoter(searchQuery.trim());

      if (!voterData.isRegistered) {
        setVerifyResult({
          found: false,
          message: "Wallet address is not registered in the voting smart contract.",
        });
      } else {
        setVerifyResult({
          found: true,
          voterId: voterData.voterId,
          hasVoted: voterData.hasVoted,
          votedCandidateId: Number(voterData.votedCandidateId),
          timestamp: Number(voterData.votedTimestamp),
          message: voterData.hasVoted
            ? "VOTE VERIFIED: Your ballot is permanently recorded on the Ethereum blockchain."
            : "REGISTERED: Voter is authorized but has not cast a ballot yet.",
        });
      }
    } catch (err) {
      setVerifyResult({
        found: false,
        message: "Lookup failed: " + err.message,
      });
    } finally {
      setVerifying(false);
    }
  };

  const handleDownloadCSV = () => {
    if (!events || events.length === 0) {
      alert("No blockchain events recorded yet to export.");
      return;
    }
    const headers = "Event,Details,BlockNumber,TxHash\n";
    const rows = events
      .map((ev) => `"${ev.type}","${ev.voterId || ev.name || ""}",${ev.blockNumber},"${ev.txHash}"`)
      .join("\n");
    const blob = new Blob([headers + rows], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `decentravote-audit-ledger-${Date.now()}.csv`;
    a.click();
  };

  const safeEvents = Array.isArray(events) ? events : [];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="bg-sky-50 text-sky-700 text-[11px] font-bold px-3 py-0.5 rounded-full border border-sky-200">
              DecentraVote Audit Ledger
            </span>
          </div>
          <h2 className="text-2xl font-extrabold text-slate-900 mt-1 tracking-tight">
            Past Ballots & Cryptographic Proofs
          </h2>
          <p className="text-xs text-slate-500">
            Every transaction, voter authorization, and ballot receipt is indelibly logged to the decentralized Ethereum ledger.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleDownloadCSV}
            className="bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 px-4 py-2.5 rounded-2xl text-xs font-bold flex items-center gap-2 shadow-sm transition-all"
          >
            <FileSpreadsheet className="h-3.5 w-3.5 text-emerald-600" />
            <span>Export CSV</span>
          </button>

          <button
            onClick={fetchEvents}
            disabled={loading}
            className="bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 px-4 py-2.5 rounded-2xl text-xs font-bold flex items-center gap-2 shadow-sm transition-all"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${loading ? "animate-spin text-indigo-600" : "text-slate-400"}`} />
            <span>Sync Events</span>
          </button>
        </div>
      </div>

      {/* Verification Lookup Tool */}
      <div className="decentra-card rounded-3xl p-6 sm:p-7 shadow-sm space-y-4">
        <div className="flex items-center gap-2">
          <Search className="h-4 w-4 text-indigo-600" />
          <h3 className="text-sm font-extrabold text-slate-900">
            Verify Individual Voter Ballot Status
          </h3>
        </div>

        <form onSubmit={handleVerify} className="flex flex-col sm:flex-row gap-3">
          <input
            type="text"
            placeholder="Enter Ethereum Wallet Address (0x...)"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="flex-1 bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 text-xs text-slate-900 font-mono focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
          <button
            type="submit"
            disabled={verifying}
            className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-6 py-3 rounded-2xl text-xs shadow-md shadow-indigo-600/20 flex items-center justify-center gap-2 transition-all disabled:opacity-50"
          >
            {verifying ? <RefreshCw className="h-4 w-4 animate-spin" /> : <ShieldCheck className="h-4 w-4" />}
            <span>Verify on Blockchain</span>
          </button>
        </form>

        {verifyResult && (
          <div
            className={`p-4 rounded-2xl border text-xs font-mono space-y-2 ${
              verifyResult.found && verifyResult.hasVoted
                ? "bg-emerald-50 border-emerald-200 text-emerald-800"
                : verifyResult.found
                ? "bg-amber-50 border-amber-200 text-amber-800"
                : "bg-rose-50 border-rose-200 text-rose-800"
            }`}
          >
            <div className="font-bold flex items-center gap-2 text-sm font-sans">
              {verifyResult.found && verifyResult.hasVoted ? (
                <CheckCircle2 className="h-5 w-5 text-emerald-600" />
              ) : (
                <XCircle className="h-5 w-5 text-rose-600" />
              )}
              <span>{verifyResult.message}</span>
            </div>
            {verifyResult.found && (
              <div className="pt-2 border-t border-slate-200 font-sans text-xs space-y-1">
                <div>Voter ID: <span className="font-mono font-bold text-indigo-700">{verifyResult.voterId}</span></div>
                <div>Status: <span className="font-semibold">{verifyResult.hasVoted ? "Ballot Cast" : "Eligible / Not Voted"}</span></div>
                {verifyResult.hasVoted && (
                  <div>Nominee Choice: <span className="font-bold text-emerald-700">Nominee #{verifyResult.votedCandidateId}</span></div>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Past Transactions Table */}
      <div className="decentra-card rounded-3xl p-6 shadow-sm space-y-4">
        <h3 className="text-sm font-extrabold text-slate-900 flex items-center gap-2">
          <Cpu className="h-4 w-4 text-indigo-600" />
          Recent Blockchain Transactions & Event Log
        </h3>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-200 text-slate-400 font-bold uppercase text-[10px] tracking-wider">
                <th className="pb-3">Event Type</th>
                <th className="pb-3">Description</th>
                <th className="pb-3">Block #</th>
                <th className="pb-3">Transaction Receipt</th>
                <th className="pb-3 text-right">Receipt Slip</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-mono">
              {safeEvents.length > 0 ? (
                safeEvents.map((ev, idx) => (
                  <tr key={idx} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3.5 font-sans">
                      <span
                        className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full ${
                          ev.type === "VoteCast"
                            ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                            : ev.type === "VoterRegistered"
                            ? "bg-indigo-50 text-indigo-700 border border-indigo-200"
                            : "bg-sky-50 text-sky-700 border border-sky-200"
                        }`}
                      >
                        {ev.type}
                      </span>
                    </td>
                    <td className="py-3.5 font-sans text-slate-700">
                      {ev.type === "VoteCast" && (
                        <span>
                          Voter <strong className="text-indigo-600">{ev.voterId}</strong> cast ballot for Nominee #{ev.candidateId}
                        </span>
                      )}
                      {ev.type === "VoterRegistered" && (
                        <span>
                          Enrolled authorized voter <strong className="text-indigo-600">{ev.voterId}</strong>
                        </span>
                      )}
                      {ev.type === "CandidateAdded" && (
                        <span>
                          Nominee #{ev.candidateId}: <strong className="text-slate-900">{ev.name}</strong> ({ev.party})
                        </span>
                      )}
                    </td>
                    <td className="py-3.5 text-slate-900 font-bold">#{ev.blockNumber}</td>
                    <td className="py-3.5 text-slate-500 text-[11px] max-w-[180px] truncate" title={ev.txHash}>
                      {ev.txHash}
                    </td>
                    <td className="py-3.5 text-right font-sans">
                      <button
                        onClick={() =>
                          setSelectedReceipt({
                            ballotTitle: "2026 Annual Campus Election",
                            voterName: ev.voterId ? `Voter ${ev.voterId}` : "Certified Voter",
                            voterId: ev.voterId || "#VOT-GEN",
                            candidateName: ev.candidateId ? `Nominee #${ev.candidateId}` : "Candidate Registration",
                            blockNumber: ev.blockNumber,
                            timestamp: "Recorded on Ethereum",
                            txHash: ev.txHash,
                          })
                        }
                        className="text-xs font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-1 ml-auto"
                      >
                        <Eye className="h-3.5 w-3.5" />
                        <span>View</span>
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-slate-400 font-sans">
                    No transactions recorded on blockchain yet. Cast a vote to populate the ledger.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      <ReceiptModal
        isOpen={!!selectedReceipt}
        onClose={() => setSelectedReceipt(null)}
        receiptData={selectedReceipt}
      />

    </div>
  );
}
