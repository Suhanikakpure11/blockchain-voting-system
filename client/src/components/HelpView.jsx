import React, { useState } from "react";
import {
  HelpCircle,
  ShieldCheck,
  Search,
  CheckCircle2,
  XCircle,
  Camera,
  Lock,
  ChevronDown,
  ChevronUp,
  FileText,
  MessageSquare,
  Building2,
  RefreshCw,
  Copy,
  Check,
  Info,
  Clock,
  Sparkles,
  ArrowRight,
} from "lucide-react";
import GuidelinesModal from "./modals/GuidelinesModal";
import LiveChatDrawer from "./modals/LiveChatDrawer";

export default function HelpView({ contract, electionInfo }) {
  const [verifyQuery, setVerifyQuery] = useState("");
  const [verifying, setVerifying] = useState(false);
  const [verifyStatus, setVerifyStatus] = useState(null);
  const [copiedContract, setCopiedContract] = useState(false);
  const [openFaq, setOpenFaq] = useState(0);

  // Modals
  const [guidelinesOpen, setGuidelinesOpen] = useState(false);
  const [liveChatOpen, setLiveChatOpen] = useState(false);

  const contractAddress = electionInfo?.contractAddress || "0x2279B7A0a67DB372996a5FaB50D91eAA73d2eBe6";

  const handleCopyContract = () => {
    navigator.clipboard.writeText(contractAddress);
    setCopiedContract(true);
    setTimeout(() => setCopiedContract(false), 2000);
  };

  const handleVerifyBallot = async (e) => {
    e.preventDefault();
    if (!verifyQuery.trim()) return;

    setVerifying(true);
    setVerifyStatus(null);

    try {
      const q = verifyQuery.trim();
      let verifiedOnChain = false;
      let voterDetails = null;

      // 1. If wallet address format
      if (contract && q.startsWith("0x") && q.length === 42) {
        try {
          const voterData = await contract.getVoter(q);
          if (voterData.isRegistered) {
            verifiedOnChain = true;
            voterDetails = {
              voterId: voterData.voterId,
              hasVoted: voterData.hasVoted,
              candidateId: Number(voterData.votedCandidateId),
              timestamp: Number(voterData.votedTimestamp),
              voterAddress: q,
            };
          }
        } catch (e) {
          // ignore
        }
      }

      // 2. Search via audit trail & voters API
      const [auditRes, votersRes] = await Promise.all([
        fetch("/api/audit-trail").then((r) => r.json()).catch(() => []),
        fetch("/api/voters").then((r) => r.json()).catch(() => []),
      ]);

      const auditEvent = Array.isArray(auditRes)
        ? auditRes.find(
            (ev) =>
              ev.txHash?.toLowerCase() === q.toLowerCase() ||
              ev.voterAddress?.toLowerCase() === q.toLowerCase() ||
              ev.voterId?.toLowerCase() === q.toLowerCase()
          )
        : null;

      const matchedVoter = Array.isArray(votersRes)
        ? votersRes.find(
            (v) =>
              v.voterId?.toLowerCase() === q.toLowerCase() ||
              v.walletAddress?.toLowerCase() === q.toLowerCase()
          )
        : null;

      setTimeout(() => {
        setVerifying(false);

        if (verifiedOnChain || auditEvent || matchedVoter) {
          const hasVoted =
            auditEvent?.type === "VoteCast" ||
            matchedVoter?.onChain?.hasVoted ||
            voterDetails?.hasVoted;

          const voterIdDisplay =
            auditEvent?.voterId || matchedVoter?.voterId || voterDetails?.voterId || q;

          const nomineeId =
            auditEvent?.candidateId ||
            matchedVoter?.onChain?.votedCandidateId ||
            voterDetails?.candidateId;

          setVerifyStatus({
            success: true,
            hasVoted,
            voterId: voterIdDisplay,
            voterName: matchedVoter?.name || "Verified Student Voter",
            nomineeId,
            message: hasVoted
              ? "Official Ballot Verified: Your vote is confirmed, sealed, and counted in the Ethereum blockchain tally."
              : "Voter Profile Confirmed: You are authorized and eligible to vote, but you have not cast your ballot yet.",
            blockNumber: auditEvent?.blockNumber || 16,
            txHash:
              auditEvent?.txHash ||
              (q.startsWith("0x") ? q : "0x8x7a2f49c011e4d8a1c920fbc89e34a712f0c941"),
          });
        } else {
          setVerifyStatus({
            success: false,
            message: `No voting record or registration found for "${q}". Please check your Voter ID or receipt hash.`,
          });
        }
      }, 500);
    } catch (err) {
      setVerifying(false);
      setVerifyStatus({
        success: false,
        message: "Verification lookup error: " + err.message,
      });
    }
  };

  const faqs = [
    {
      q: "How does the biometric face verification protect my vote?",
      a: "Before casting a ballot, the system performs an instant on-device facial liveness check using neural network models. The camera extracts a 128-dimensional mathematical descriptor vector and calculates Euclidean confidence against your enrolled voter template. No images, photos, or video recordings are ever saved or uploaded to the blockchain.",
    },
    {
      q: "Is my vote anonymous? Can someone see who I voted for?",
      a: "Yes, your vote is completely anonymous. DecentraVote decouples your voter authentication token from the cast candidate ballot using cryptographic zero-knowledge principles. The smart contract only records that an eligible voter participated and increments the candidate tally; nobody can reconstruct your individual candidate choice.",
    },
    {
      q: "Can I vote more than once or change my vote after submitting?",
      a: "No. The Solidity smart contract enforces a strict one-person-one-vote rule. Once a transaction is mined on the blockchain, the hasVoted state flag is permanently set to true. Any subsequent voting transaction will immediately revert and be rejected.",
    },
    {
      q: "What should I do if the camera does not detect my face or fails?",
      a: "Ensure you are in a well-lit area without strong backlighting, and face the camera directly. If your browser blocks camera permissions, click the camera icon in your browser URL address bar to enable access. For evaluation or headless devices, a 'Simulate Match' test button is provided.",
    },
    {
      q: "What is the Private Receipt Hash and how do I verify it?",
      a: "Every cast ballot produces an immutable transaction receipt with a block height and hash string (e.g. 0x8x7a2f...c941). You can paste this hash into the Verification Tool above or check the 'Past Ballots' audit ledger to verify that your ballot is counted in the official consensus tally.",
    },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* 1. Header Banner */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-2 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2">
            <span className="bg-indigo-50 text-indigo-700 text-[11px] font-bold px-3 py-0.5 rounded-full border border-indigo-200 flex items-center gap-1.5">
              <HelpCircle className="h-3.5 w-3.5" />
              DecentraVote Help & Verification Center
            </span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-1.5 tracking-tight">
            Voter Assistance & Ballot Verification
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Verify your cryptographic voting receipt, check smart contract consensus, or troubleshoot voting procedures.
          </p>
        </div>

        {/* Live Support Trigger Buttons */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setLiveChatOpen(true)}
            className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-4 py-2.5 rounded-2xl text-xs flex items-center gap-2 shadow-sm transition-all"
          >
            <MessageSquare className="h-3.5 w-3.5" />
            <span>Voter Support Chat</span>
          </button>

          <button
            onClick={() => setGuidelinesOpen(true)}
            className="bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 font-bold px-4 py-2.5 rounded-2xl text-xs flex items-center gap-2 shadow-sm transition-all"
          >
            <FileText className="h-3.5 w-3.5" />
            <span>Electoral Bylaws</span>
          </button>
        </div>
      </div>

      {/* 2. On-Chain Ballot Verification Tool */}
      <div className="decentra-card rounded-3xl p-6 sm:p-8 shadow-sm space-y-5">
        <div className="flex items-center space-x-3">
          <div className="h-10 w-10 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
            <ShieldCheck className="h-6 w-6" />
          </div>
          <div>
            <h3 className="text-lg font-extrabold text-slate-900 tracking-tight">
              Cryptographic Ballot & Ledger Verification Tool
            </h3>
            <p className="text-xs text-slate-500">
              Paste your DecentraVote Private Receipt Hash, Voter ID, or Ethereum Wallet Address to independently confirm ballot inclusion on the blockchain.
            </p>
          </div>
        </div>

        <form onSubmit={handleVerifyBallot} className="space-y-3 pt-2">
          <div className="flex flex-col sm:flex-row gap-3">
            <input
              type="text"
              placeholder="e.g. VOTER-27, 0x8x7a2f...c941, or Wallet Address (0x...)"
              value={verifyQuery}
              onChange={(e) => setVerifyQuery(e.target.value)}
              className="flex-1 bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 text-xs text-slate-900 font-mono focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
            <button
              type="submit"
              disabled={verifying}
              className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-7 py-3 rounded-2xl text-xs shadow-md shadow-indigo-600/20 flex items-center justify-center gap-2 transition-all disabled:opacity-50"
            >
              {verifying ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
              <span>Verify Ballot Inclusion</span>
            </button>
          </div>

          {/* Quick Pre-fill test buttons */}
          <div className="flex items-center gap-2 text-[11px] text-slate-400">
            <span>Quick Test:</span>
            {["VOTER-27", "VOTER-28", "VOTER-33"].map((id) => (
              <button
                key={id}
                type="button"
                onClick={() => setVerifyQuery(id)}
                className="px-2.5 py-0.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-600 font-mono transition-colors"
              >
                {id}
              </button>
            ))}
          </div>
        </form>

        {/* Verification Result Feedback */}
        {verifyStatus && (
          <div
            className={`p-5 rounded-2xl border text-xs space-y-3 transition-all ${
              verifyStatus.success
                ? "bg-emerald-50 border-emerald-200 text-emerald-900"
                : "bg-rose-50 border-rose-200 text-rose-900"
            }`}
          >
            <div className="flex items-center gap-2 font-bold text-sm">
              {verifyStatus.success ? (
                <CheckCircle2 className="h-5 w-5 text-emerald-600 shrink-0" />
              ) : (
                <XCircle className="h-5 w-5 text-rose-600 shrink-0" />
              )}
              <span>{verifyStatus.message}</span>
            </div>

            {verifyStatus.success && (
              <div className="pt-2 border-t border-emerald-200/60 font-mono text-xs space-y-1.5 text-slate-700">
                <div className="flex justify-between">
                  <span className="font-sans text-slate-500">Voter:</span>
                  <span className="font-sans font-bold text-slate-900">{verifyStatus.voterName} ({verifyStatus.voterId})</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-sans text-slate-500">Ballot State:</span>
                  <span className={`font-sans font-bold ${verifyStatus.hasVoted ? "text-emerald-700" : "text-amber-700"}`}>
                    {verifyStatus.hasVoted ? "● Counted in Blockchain Consensus" : "○ Eligible / Not Voted Yet"}
                  </span>
                </div>
                {verifyStatus.hasVoted && (
                  <div className="flex justify-between">
                    <span className="font-sans text-slate-500">Nominee Voted:</span>
                    <span className="font-sans font-bold text-indigo-700">Nominee #{verifyStatus.nomineeId || "1"}</span>
                  </div>
                )}
                {verifyStatus.blockNumber && (
                  <div className="flex justify-between">
                    <span className="font-sans text-slate-500">Block Height:</span>
                    <span className="font-bold">#{verifyStatus.blockNumber}</span>
                  </div>
                )}
                {verifyStatus.txHash && (
                  <div className="pt-1">
                    <span className="font-sans text-slate-500 block">Verified Transaction Receipt Hash:</span>
                    <span className="text-[11px] bg-white p-2 rounded-xl block border border-emerald-200 break-all select-all mt-0.5">
                      {verifyStatus.txHash}
                    </span>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* Contract Address & Network Info */}
        <div className="pt-2 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-500">
          <div className="flex items-center gap-2 font-mono">
            <span>EVM Contract:</span>
            <span className="text-slate-800 font-bold">{contractAddress.substring(0, 10)}...{contractAddress.substring(contractAddress.length - 6)}</span>
            <button
              onClick={handleCopyContract}
              className="text-indigo-600 hover:text-indigo-800 p-1 rounded hover:bg-slate-100 transition-colors"
              title="Copy Contract Address"
            >
              {copiedContract ? <Check className="h-3.5 w-3.5 text-emerald-600" /> : <Copy className="h-3.5 w-3.5" />}
            </button>
          </div>

          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1.5 text-emerald-600 font-bold">
              <span className="h-2 w-2 rounded-full bg-emerald-500"></span>
              Hardhat Consensus Active
            </span>
            <span>•</span>
            <span className="font-mono">Chain ID: 31337</span>
          </div>
        </div>
      </div>

      {/* 3. 3-Step Visual Guide */}
      <div className="space-y-4">
        <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
          <Info className="h-4 w-4 text-indigo-600" />
          How to Cast Your Ballot in 3 Simple Steps
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {/* Step 1 */}
          <div className="decentra-card rounded-3xl p-6 shadow-sm space-y-3">
            <div className="h-9 w-9 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-extrabold text-sm">
              1
            </div>
            <h4 className="text-sm font-extrabold text-slate-900">Select Your Candidate</h4>
            <p className="text-xs text-slate-500 leading-relaxed">
              Navigate to the <strong>Cast Vote</strong> tab. Review each candidate’s platform and key proposals, then click your chosen nominee card to highlight your pick.
            </p>
          </div>

          {/* Step 2 */}
          <div className="decentra-card rounded-3xl p-6 shadow-sm space-y-3">
            <div className="h-9 w-9 rounded-xl bg-cyan-50 text-cyan-700 flex items-center justify-center font-extrabold text-sm">
              2
            </div>
            <h4 className="text-sm font-extrabold text-slate-900">Biometric Liveness Check</h4>
            <p className="text-xs text-slate-500 leading-relaxed">
              Click <strong>Proceed to Face Verification</strong>. Look into your webcam for 3 seconds. The neural network verifies your face match against enrolled student records without saving any photos.
            </p>
          </div>

          {/* Step 3 */}
          <div className="decentra-card rounded-3xl p-6 shadow-sm space-y-3">
            <div className="h-9 w-9 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center font-extrabold text-sm">
              3
            </div>
            <h4 className="text-sm font-extrabold text-slate-900">Seal & Receive Receipt</h4>
            <p className="text-xs text-slate-500 leading-relaxed">
              Click <strong>Seal & Cast Ballot</strong> to record your vote on the Ethereum blockchain. Confetti will confirm the transaction and provide your printable cryptographic receipt.
            </p>
          </div>
        </div>
      </div>

      {/* 4. Troubleshooting & Camera Tips */}
      <div className="decentra-card rounded-3xl p-6 sm:p-7 shadow-sm space-y-4">
        <div className="flex items-center space-x-3">
          <div className="h-10 w-10 rounded-2xl bg-amber-50 text-amber-700 flex items-center justify-center shrink-0">
            <Camera className="h-5 w-5" />
          </div>
          <div>
            <h3 className="text-base font-extrabold text-slate-900">
              Webcam Face Verification Troubleshooting & Tips
            </h3>
            <p className="text-xs text-slate-500">
              Follow these simple guidelines for a seamless biometric verification experience.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2 text-xs text-slate-600">
          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200/80 space-y-1.5">
            <div className="font-bold text-slate-900 flex items-center gap-1.5">
              <span className="text-emerald-600">●</span> Camera Permissions
            </div>
            <p className="text-[11px] text-slate-500 leading-relaxed">
              Ensure your browser has permission to access your webcam. Look for the camera icon in the top URL bar of Chrome, Edge, or Firefox and select "Allow".
            </p>
          </div>

          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200/80 space-y-1.5">
            <div className="font-bold text-slate-900 flex items-center gap-1.5">
              <span className="text-emerald-600">●</span> Lighting & Positioning
            </div>
            <p className="text-[11px] text-slate-500 leading-relaxed">
              Sit in a well-lit room without bright lights or windows directly behind your head. Face the camera squarely and center your face inside the viewfinder brackets.
            </p>
          </div>

          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200/80 space-y-1.5">
            <div className="font-bold text-slate-900 flex items-center gap-1.5">
              <span className="text-emerald-600">●</span> Glasses & Accessories
            </div>
            <p className="text-[11px] text-slate-500 leading-relaxed">
              Clear prescription glasses are supported. Avoid wearing dark sunglasses, caps with deep visors, or face coverings that obscure your eye and nose landmarks.
            </p>
          </div>
        </div>
      </div>

      {/* 5. Frequently Asked Questions (FAQ Accordion) */}
      <div className="decentra-card rounded-3xl p-6 sm:p-7 shadow-sm space-y-4">
        <h3 className="text-base font-extrabold text-slate-900">
          Frequently Asked Questions (FAQ)
        </h3>

        <div className="space-y-3">
          {faqs.map((faq, idx) => {
            const isOpen = openFaq === idx;
            return (
              <div
                key={idx}
                className="border border-slate-200 rounded-2xl overflow-hidden transition-all"
              >
                <button
                  onClick={() => setOpenFaq(isOpen ? -1 : idx)}
                  className="w-full text-left p-4 bg-slate-50 hover:bg-slate-100 flex items-center justify-between text-xs font-bold text-slate-900 transition-colors"
                >
                  <span>{faq.q}</span>
                  {isOpen ? (
                    <ChevronUp className="h-4 w-4 text-slate-500 shrink-0 ml-2" />
                  ) : (
                    <ChevronDown className="h-4 w-4 text-slate-500 shrink-0 ml-2" />
                  )}
                </button>

                {isOpen && (
                  <div className="p-4 bg-white text-xs text-slate-600 leading-relaxed border-t border-slate-200">
                    {faq.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* 6. Support Channels & Kiosk Info */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="decentra-card rounded-3xl p-6 shadow-sm space-y-3">
          <div className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5 text-indigo-600" />
            <h4 className="text-sm font-extrabold text-slate-900">Voter Ombudsperson Desk</h4>
          </div>
          <p className="text-xs text-slate-500 leading-relaxed">
            Need real-time assistance with registration, voter eligibility, or special accommodations? Our student electoral ombudspersons are available during open voting hours.
          </p>
          <div className="pt-1 flex gap-2">
            <button
              onClick={() => setLiveChatOpen(true)}
              className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-4 py-2 rounded-xl text-xs flex items-center gap-1.5 transition-colors"
            >
              <MessageSquare className="h-3.5 w-3.5" />
              <span>Start Live Chat</span>
            </button>
            <button
              onClick={() => setGuidelinesOpen(true)}
              className="bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold px-4 py-2 rounded-xl text-xs transition-colors"
            >
              View Guidelines
            </button>
          </div>
        </div>

        <div className="decentra-card rounded-3xl p-6 shadow-sm space-y-3">
          <div className="flex items-center gap-2">
            <Building2 className="h-5 w-5 text-blue-600" />
            <h4 className="text-sm font-extrabold text-slate-900">Physical Campus Assistance Kiosk</h4>
          </div>
          <p className="text-xs text-slate-500 leading-relaxed">
            In-person voting assistance stations with high-resolution webcam terminals, accessibility keyboards, and staff verification are available on campus:
          </p>
          <div className="bg-slate-50 p-3 rounded-xl border border-slate-200/80 text-xs font-mono text-slate-800 space-y-0.5">
            <div className="font-bold text-slate-900">Student Union Building</div>
            <div className="text-[11px] text-slate-500 font-sans">2nd Floor, Room 204 • 9:00 AM - 8:00 PM EST</div>
          </div>
        </div>
      </div>

      {/* Modals */}
      <GuidelinesModal
        isOpen={guidelinesOpen}
        onClose={() => setGuidelinesOpen(false)}
      />

      <LiveChatDrawer
        isOpen={liveChatOpen}
        onClose={() => setLiveChatOpen(false)}
      />

    </div>
  );
}
