import React, { useState } from "react";
import {
  Vote,
  ShieldCheck,
  CheckCircle2,
  Clock,
  ArrowRight,
  ExternalLink,
  Shield,
  Lock,
  FileCheck2,
  Users,
  Smile,
  Radio,
  FileText,
  MessageSquare,
  Volume2,
  Building2,
  Sparkles,
} from "lucide-react";
import ReceiptModal from "./modals/ReceiptModal";
import IdentityWalletModal from "./modals/IdentityWalletModal";
import GuidelinesModal from "./modals/GuidelinesModal";
import LiveChatDrawer from "./modals/LiveChatDrawer";
import AccessibilityModal from "./modals/AccessibilityModal";
import CertificateModal from "./modals/CertificateModal";

export default function Dashboard({
  setActiveTab,
  selectedPreset,
  account,
  balance,
  electionInfo,
}) {
  const voterName = selectedPreset?.name || "Shravani Raut [27]";
  const voterId = selectedPreset?.voterId || "VOTER-27";
  const totalVotes = electionInfo?.totalVotes || 0;

  // Modals state
  const [identityWalletOpen, setIdentityWalletOpen] = useState(false);
  const [guidelinesOpen, setGuidelinesOpen] = useState(false);
  const [liveChatOpen, setLiveChatOpen] = useState(false);
  const [accessibilityOpen, setAccessibilityOpen] = useState(false);
  const [certificateOpen, setCertificateOpen] = useState(false);
  const [receiptModalData, setReceiptModalData] = useState(null);

  // Past ballots sample data
  const pastBallots = [
    {
      ballotTitle: "2024 Campus Sustainability Fund",
      voterName,
      voterId,
      candidateName: "Approved 78% (1,200 Solar panels)",
      blockNumber: "8421",
      timestamp: "Nov 14, 2026",
      txHash: "0x8x7a2f49c011e4d8a1c920fbc89e34a712f0c941",
    },
    {
      ballotTitle: "Civic Transit & Bike Paths Initiative",
      voterName,
      voterId,
      candidateName: "Passed (City-University shared)",
      blockNumber: "7219",
      timestamp: "Aug 02, 2026",
      txHash: "0x8x3e18f2d919c018a4bc89f182ea389bb02fbb02",
    },
    {
      ballotTitle: "Student Health & Wellness Program",
      voterName,
      voterId,
      candidateName: "Passed (Extended counseling staff)",
      blockNumber: "5104",
      timestamp: "Jan 19, 2026",
      txHash: "0x8x91d4e08f1b2c4d9a38f01c89e218ff38a4ff38",
    },
  ];

  const handleOpenReceipt = (item) => {
    setReceiptModalData(item);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      
      {/* 1. Top Welcome Banner Card */}
      <div className="bg-gradient-to-r from-blue-50/70 via-indigo-50/40 to-slate-50 border border-slate-200/90 rounded-3xl p-6 sm:p-7 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="flex items-center space-x-4">
          <div className="relative">
            <div className="h-16 w-16 rounded-full overflow-hidden border-2 border-white shadow-md ring-2 ring-indigo-100">
              <img
                src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&auto=format&fit=crop&q=80"
                alt="Voter Portrait"
                className="h-full w-full object-cover"
              />
            </div>
            <div className="absolute -bottom-1 -right-1 h-5 w-5 bg-emerald-500 rounded-full border-2 border-white flex items-center justify-center text-white text-[10px]">
              ✓
            </div>
          </div>

          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
                Welcome back, {voterName ? voterName.split(" ")[0] : "Voter"}
              </h2>
              <span className="bg-emerald-100 text-emerald-800 text-[11px] font-bold px-2.5 py-0.5 rounded-full flex items-center gap-1 border border-emerald-200">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-600"></span>
                Verified Voter
              </span>
              <span className="bg-cyan-100 text-cyan-800 text-[11px] font-bold px-2.5 py-0.5 rounded-full flex items-center gap-1 border border-cyan-200">
                <Smile className="h-3 w-3 text-cyan-700" />
                Face ID Active
              </span>
            </div>

            <div className="text-xs text-slate-500 font-medium mt-1 flex flex-wrap items-center gap-2">
              <span className="font-mono text-slate-700 font-bold">ID: #{voterId}</span>
              <span>•</span>
              <span className="flex items-center gap-1 text-slate-600">
                District 4 Campus Ward & SSGMCE CSE Academic Precinct 12
              </span>
            </div>
          </div>
        </div>

        {/* Right Electoral Standing & Identity Wallet Button */}
        <div className="flex items-center gap-4 bg-white/80 backdrop-blur-sm border border-slate-200/80 px-4 py-2.5 rounded-2xl shadow-sm self-stretch md:self-auto justify-between md:justify-start">
          <div>
            <div className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
              Electoral Standing
            </div>
            <div className="text-sm font-extrabold text-slate-800 flex items-center gap-1.5 mt-0.5">
              <ShieldCheck className="h-4 w-4 text-emerald-600" />
              Good Standing
            </div>
          </div>
          <button
            onClick={() => setIdentityWalletOpen(true)}
            className="text-xs font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-1 pl-3 border-l border-slate-200 transition-colors"
          >
            <span>Identity Wallet</span>
            <ExternalLink className="h-3 w-3" />
          </button>
        </div>
      </div>

      {/* 2. Top 4 Metric Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1 */}
        <div className="decentra-card decentra-card-hover rounded-2xl p-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-[11px] uppercase font-bold tracking-wider text-slate-400">
                Active Ballots Open
              </span>
              <div className="h-8 w-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
                <Vote className="h-4 w-4" />
              </div>
            </div>
            <div className="text-2xl font-extrabold text-slate-900 mt-2">1 Election</div>
            <div className="text-xs text-slate-500 font-medium mt-1 flex items-center gap-1">
              <Clock className="h-3.5 w-3.5 text-slate-400" />
              Closes in 4h 23m
            </div>
          </div>
          <button
            onClick={() => setActiveTab("cast-vote")}
            className="text-xs font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-1 mt-4 pt-3 border-t border-slate-100 group transition-colors"
          >
            <span>Cast Your Ballot</span>
            <ArrowRight className="h-3.5 w-3.5 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>

        {/* Card 2 */}
        <div className="decentra-card decentra-card-hover rounded-2xl p-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-[11px] uppercase font-bold tracking-wider text-slate-400">
                Total Votes Cast
              </span>
              <div className="h-8 w-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
                <FileCheck2 className="h-4 w-4" />
              </div>
            </div>
            <div className="text-2xl font-extrabold text-slate-900 mt-2">
              {totalVotes > 0 ? `${totalVotes} Ballots` : "3 Ballots"}
            </div>
            <div className="text-xs text-slate-500 font-medium mt-1 flex items-center gap-1">
              <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
              All Cryptographically Recorded
            </div>
          </div>
          <button
            onClick={() => setActiveTab("results")}
            className="text-[11px] text-slate-500 hover:text-indigo-600 font-medium mt-4 pt-3 border-t border-slate-100 flex items-center gap-1 text-left transition-colors"
          >
            <span>⎈ Zero discrepancies found</span>
          </button>
        </div>

        {/* Card 3 */}
        <div className="decentra-card decentra-card-hover rounded-2xl p-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-[11px] uppercase font-bold tracking-wider text-slate-400">
                Network Status
              </span>
              <div className="h-8 w-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
                <Radio className="h-4 w-4" />
              </div>
            </div>
            <div className="text-2xl font-extrabold text-slate-900 mt-2">Online & Secure</div>
            <div className="text-xs text-slate-500 font-medium mt-1 flex items-center gap-1">
              <span className="h-2 w-2 rounded-full bg-emerald-500"></span>
              100% Uptime • Hardhat Consensus
            </div>
          </div>
          <div className="text-[11px] text-slate-400 font-medium mt-4 pt-3 border-t border-slate-100">
            Block latency: 1.2s
          </div>
        </div>

        {/* Card 4 */}
        <div className="decentra-card decentra-card-hover rounded-2xl p-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-[11px] uppercase font-bold tracking-wider text-slate-400">
                Voting Integrity
              </span>
              <div className="h-8 w-8 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center">
                <Lock className="h-4 w-4" />
              </div>
            </div>
            <div className="text-2xl font-extrabold text-slate-900 mt-2">ZK-Proof</div>
            <div className="text-xs text-slate-500 font-medium mt-1 flex items-center gap-1">
              <Shield className="h-3.5 w-3.5 text-indigo-500" />
              Zero private data exposed
            </div>
          </div>
          <button
            onClick={() => setActiveTab("past-ballots")}
            className="text-[11px] text-slate-500 hover:text-indigo-600 font-medium mt-4 pt-3 border-t border-slate-100 flex items-center gap-1 text-left transition-colors"
          >
            <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" />
            <span>End-to-End Verifiable</span>
          </button>
        </div>
      </div>

      {/* 3. Main 2-Column Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* LEFT COLUMN: Featured Ballot Card & Security Promise (2 cols wide) */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Main Ballot Card */}
          <div className="decentra-card rounded-3xl p-6 sm:p-7 shadow-sm space-y-5">
            {/* Top Badge Row */}
            <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
              <span className="bg-indigo-50 text-indigo-700 font-bold px-3 py-1 rounded-full border border-indigo-200/60 flex items-center gap-1.5">
                <Sparkles className="h-3 w-3 text-indigo-600" />
                LIVE OFFICIAL BALLOT
              </span>
              <span className="text-slate-500 font-medium flex items-center gap-1">
                <Clock className="h-3.5 w-3.5 text-slate-400" />
                Voting closes at 8:00 PM EST
              </span>
            </div>

            {/* Title & Description */}
            <div>
              <h3 className="text-2xl font-extrabold text-slate-900 tracking-tight">
                2026 Annual Community & Campus Election
              </h3>
              <p className="text-slate-600 text-sm mt-1 leading-relaxed">
                Cast your decisive vote on our incoming Student Council executives, the municipal clean energy transit referendum, and university library extended operating budgets.
              </p>
            </div>

            {/* Hero Image with Tag Overlays */}
            <div className="relative rounded-2xl overflow-hidden aspect-[21/9] bg-slate-900 shadow-inner group">
              <img
                src="https://images.unsplash.com/photo-1541339907198-e08756dedf3f?w=1200&auto=format&fit=crop&q=80"
                alt="Campus Civic Assembly"
                className="w-full h-full object-cover opacity-90 group-hover:scale-105 transition-transform duration-700"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent"></div>

              {/* Badges on bottom of image */}
              <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between text-xs text-white font-medium">
                <div className="flex items-center gap-2 bg-black/50 backdrop-blur-md px-3 py-1.5 rounded-xl border border-white/10">
                  <Users className="h-3.5 w-3.5 text-indigo-300" />
                  <span>3 Contested Measures • 3 Candidates</span>
                </div>
                <div className="bg-black/50 backdrop-blur-md px-3 py-1.5 rounded-xl border border-white/10 font-mono text-[11px] text-slate-300">
                  Ballot #AC-2026
                </div>
              </div>
            </div>

            {/* Turnout Progress Bar */}
            <div className="space-y-2 pt-1">
              <div className="flex items-center justify-between text-xs font-bold text-slate-800">
                <span>Community Turnout (2,840 of 4,178 voters)</span>
                <div className="flex items-center gap-2">
                  <span className="bg-emerald-50 text-emerald-700 border border-emerald-200 px-2 py-0.5 rounded-md text-[11px]">
                    Quorum Met
                  </span>
                  <span className="text-sm font-extrabold text-slate-900">68%</span>
                </div>
              </div>

              {/* Progress Track */}
              <div className="h-3 w-full bg-slate-100 rounded-full overflow-hidden p-0.5 border border-slate-200">
                <div
                  className="h-full rounded-full bg-indigo-600 transition-all duration-700"
                  style={{ width: "68%" }}
                ></div>
              </div>

              <div className="flex items-center justify-between text-[11px] text-slate-400 font-medium">
                <span>Starts at 0%</span>
                <span>• Minimum 50% needed for binding resolution</span>
                <span>Goal: 100%</span>
              </div>
            </div>

            {/* Gentle Face Verification Notice */}
            <div className="bg-blue-50/70 border border-blue-200/80 rounded-2xl p-4 flex items-start gap-3.5">
              <div className="h-9 w-9 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center shrink-0 mt-0.5">
                <Smile className="h-5 w-5" />
              </div>
              <div className="text-xs">
                <div className="font-bold text-slate-900 mb-0.5">
                  Gentle Face Verification Notice
                </div>
                <p className="text-slate-600 leading-relaxed">
                  Requires a quick 3-second friendly face check before final submission to confirm voter identity while ensuring complete, permanent ballot anonymity.
                </p>
              </div>
            </div>

            {/* Vote Action Button */}
            <div className="flex flex-col sm:flex-row items-center gap-4 pt-2">
              <button
                onClick={() => setActiveTab("cast-vote")}
                className="w-full sm:w-auto bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-7 py-3.5 rounded-2xl text-sm shadow-md shadow-indigo-600/25 flex items-center justify-center gap-2 transition-all hover:scale-[1.01]"
              >
                <span>Vote in this Election</span>
                <ArrowRight className="h-4 w-4" />
              </button>
              <span className="text-xs text-slate-500 font-medium flex items-center gap-1.5">
                <Clock className="h-3.5 w-3.5 text-slate-400" />
                Estimated completion time: ~3 minutes
              </span>
            </div>
          </div>

          {/* How Your Vote Is Protected */}
          <div className="decentra-card rounded-3xl p-6 sm:p-7 shadow-sm space-y-4">
            <div className="flex items-center gap-2.5">
              <div className="h-7 w-7 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
                <ShieldCheck className="h-4 w-4" />
              </div>
              <h3 className="text-lg font-extrabold text-slate-900">How Your Vote Is Protected</h3>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              DecentraVote makes community governance transparent and honest without complex crypto jargon. Here is our simple three-tier voter security promise:
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
              <div
                onClick={() => setGuidelinesOpen(true)}
                className="bg-slate-50/70 hover:bg-slate-100/80 cursor-pointer border border-slate-200/80 rounded-2xl p-4 space-y-2 transition-colors"
              >
                <div className="h-8 w-8 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center">
                  <Lock className="h-4 w-4" />
                </div>
                <div className="text-xs font-bold text-slate-900">Zero Private Data Stored</div>
                <p className="text-[11px] text-slate-500 leading-relaxed">
                  Your name and student ID are never tied to candidate selections. Cryptographic proofs decouple identity from the ballot slip.
                </p>
              </div>

              <div
                onClick={() => setActiveTab("past-ballots")}
                className="bg-slate-50/70 hover:bg-slate-100/80 cursor-pointer border border-slate-200/80 rounded-2xl p-4 space-y-2 transition-colors"
              >
                <div className="h-8 w-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
                  <FileText className="h-4 w-4" />
                </div>
                <div className="text-xs font-bold text-slate-900">Verifiable Public Ledger</div>
                <p className="text-[11px] text-slate-500 leading-relaxed">
                  Every cast ballot receives a private tracker hash. You can verify your ballot was counted in the final tally without revealing your choices.
                </p>
              </div>

              <div
                onClick={() => setCertificateOpen(true)}
                className="bg-slate-50/70 hover:bg-slate-100/80 cursor-pointer border border-slate-200/80 rounded-2xl p-4 space-y-2 transition-colors"
              >
                <div className="h-8 w-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
                  <Shield className="h-4 w-4" />
                </div>
                <div className="text-xs font-bold text-slate-900">Tamper-Resistant Ledger</div>
                <p className="text-[11px] text-slate-500 leading-relaxed">
                  Votes cannot be deleted, duplicated, or modified by administrators, candidates, or outside network intrusions.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: Voting History & Need Help (1 col wide) */}
        <div className="space-y-6">
          
          {/* Your Voting History Card */}
          <div className="decentra-card rounded-3xl p-6 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Vote className="h-4 w-4 text-indigo-600" />
                <h3 className="text-sm font-extrabold text-slate-900">Your Voting History</h3>
              </div>
              <span className="text-[11px] font-medium text-slate-400">3 recorded</span>
            </div>

            {/* History Items with Working Receipts */}
            <div className="space-y-3">
              {pastBallots.map((ballot, idx) => (
                <div key={idx} className="p-3.5 rounded-2xl bg-slate-50/80 border border-slate-200/70 space-y-1.5">
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="text-slate-400 font-medium">{ballot.timestamp}</span>
                    <span className="bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded-md text-[10px]">
                      ✓ Counted
                    </span>
                  </div>
                  <div className="text-xs font-bold text-slate-900">{ballot.ballotTitle}</div>
                  <div className="text-[11px] text-slate-500">{ballot.candidateName}</div>
                  <div className="flex items-center justify-between pt-1 font-mono text-[10px]">
                    <span className="text-slate-400">
                      {ballot.txHash.substring(0, 10)}...{ballot.txHash.substring(ballot.txHash.length - 4)}
                    </span>
                    <button
                      onClick={() => handleOpenReceipt(ballot)}
                      className="text-indigo-600 font-bold hover:underline flex items-center gap-0.5"
                    >
                      View Receipt ↗
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <button
              onClick={() => setCertificateOpen(true)}
              className="w-full text-center text-xs font-bold text-indigo-600 hover:text-indigo-800 py-2 pt-3 border-t border-slate-100 block transition-colors"
            >
              Download Complete Audit Certificate (PDF)
            </button>
          </div>

          {/* Need Help Voting? Card with Working Handlers */}
          <div className="decentra-card rounded-3xl p-6 shadow-sm space-y-4">
            <div className="flex items-center gap-2">
              <div className="h-6 w-6 rounded-full bg-slate-100 text-slate-600 flex items-center justify-center font-bold text-xs">
                ?
              </div>
              <h3 className="text-sm font-extrabold text-slate-900">Need Help Voting?</h3>
            </div>
            <p className="text-xs text-slate-500 leading-relaxed">
              Support staff and student ombudspersons are active right now during open voting hours.
            </p>

            <div className="space-y-2 text-xs font-medium">
              <button
                onClick={() => setGuidelinesOpen(true)}
                className="w-full flex items-center justify-between p-3 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-700 transition-colors border border-slate-200/60"
              >
                <span className="flex items-center gap-2">
                  <FileText className="h-4 w-4 text-slate-500" />
                  Election Guidelines PDF
                </span>
                <span className="text-slate-400">↓</span>
              </button>

              <button
                onClick={() => setLiveChatOpen(true)}
                className="w-full flex items-center justify-between p-3 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-700 transition-colors border border-slate-200/60"
              >
                <span className="flex items-center gap-2">
                  <MessageSquare className="h-4 w-4 text-slate-500" />
                  Voter Support Live Chat
                </span>
                <span className="h-2 w-2 rounded-full bg-emerald-500"></span>
              </button>

              <button
                onClick={() => setAccessibilityOpen(true)}
                className="w-full flex items-center justify-between p-3 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-700 transition-colors border border-slate-200/60"
              >
                <span className="flex items-center gap-2">
                  <Volume2 className="h-4 w-4 text-slate-500" />
                  Accessibility & Audio Ballot
                </span>
                <span className="text-slate-400">→</span>
              </button>

              <div
                onClick={() => alert("Physical Campus Kiosk is located at: Student Union Building, 2nd Floor, Room 204. Operational from 9:00 AM to 8:00 PM EST.")}
                className="p-3 rounded-xl bg-blue-50/60 hover:bg-blue-50 cursor-pointer border border-blue-100 text-slate-700 flex items-start gap-2.5 transition-colors"
              >
                <Building2 className="h-4 w-4 text-blue-600 shrink-0 mt-0.5" />
                <div className="text-[11px] leading-tight">
                  <div className="font-bold text-slate-900">Physical Campus Kiosk</div>
                  <div className="text-slate-500 mt-0.5">Student Union Bldg, 2nd Fl, Rm 204</div>
                </div>
              </div>
            </div>
          </div>

        </div>

      </div>

      {/* Modals Mounted at Top Level */}
      <ReceiptModal
        isOpen={!!receiptModalData}
        onClose={() => setReceiptModalData(null)}
        receiptData={receiptModalData}
      />

      <IdentityWalletModal
        isOpen={identityWalletOpen}
        onClose={() => setIdentityWalletOpen(false)}
        voterName={voterName}
        voterId={voterId}
        account={account}
        balance={balance}
      />

      <GuidelinesModal
        isOpen={guidelinesOpen}
        onClose={() => setGuidelinesOpen(false)}
      />

      <LiveChatDrawer
        isOpen={liveChatOpen}
        onClose={() => setLiveChatOpen(false)}
      />

      <AccessibilityModal
        isOpen={accessibilityOpen}
        onClose={() => setAccessibilityOpen(false)}
      />

      <CertificateModal
        isOpen={certificateOpen}
        onClose={() => setCertificateOpen(false)}
        electionInfo={electionInfo}
      />

    </div>
  );
}
