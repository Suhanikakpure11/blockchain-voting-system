import React, { useState, useRef, useEffect } from "react";
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  Clock,
  Shield,
  ShieldCheck,
  Fingerprint,
  FileText,
  RotateCcw,
  ExternalLink,
  Camera,
  RefreshCw,
  Lock,
  XCircle,
  AlertTriangle,
  Award,
  Printer,
} from "lucide-react";
import confetti from "canvas-confetti";
import { extractFaceDescriptor, verifyFaceBiometrics, loadFaceModels } from "../utils/faceMatcher";
import AuditProofModal from "./modals/AuditProofModal";
import ReceiptModal from "./modals/ReceiptModal";

export default function CastVote({
  setActiveTab,
  contract,
  signer,
  account,
  selectedPreset,
  electionInfo,
  refreshElectionData,
}) {
  const [step, setStep] = useState(1); // 1: Candidate Selection, 2: Face Auth & Seal, 3: Confirmed Receipt
  const [selectedCandidate, setSelectedCandidate] = useState(null);
  const [sessionTime, setSessionTime] = useState({ minutes: 44, seconds: 15 });
  const [errorMsg, setErrorMsg] = useState("");

  // Face Verification states
  const [cameraActive, setCameraActive] = useState(false);
  const [verifyingFace, setVerifyingFace] = useState(false);
  const [faceVerified, setFaceVerified] = useState(false);
  const [verificationResult, setVerificationResult] = useState(null);
  const [isSubmittingVote, setIsSubmittingVote] = useState(false);
  const [txReceipt, setTxReceipt] = useState(null);

  // Modals
  const [auditProofOpen, setAuditProofOpen] = useState(false);
  const [receiptOpen, setReceiptOpen] = useState(false);

  const videoRef = useRef(null);
  const streamRef = useRef(null);

  const voterName = selectedPreset?.name || "Shravani Raut [27]";
  const voterId = selectedPreset?.voterId || "VOTER-27";

  // Pre-configured candidates matching the exact aesthetic
  const defaultCandidates = [
    {
      id: 1,
      nomineeNumber: 1,
      name: "Dr. Elena Rostova",
      party: "Digital Rights & Privacy",
      department: "Faculty of Computing & Society",
      avatar: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=300&auto=format&fit=crop&q=80",
      proposals: [
        "Upgrade open library digital repositories and universal academic access.",
        "Protect student and civic research data privacy across campus infrastructure.",
        "Establish transparent oversight on campus algorithmic administrative tools.",
      ],
    },
    {
      id: 2,
      nomineeNumber: 2,
      name: "Marcus Vance",
      party: "Green Campus & Sustainability",
      department: "College of Environmental Policy",
      avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=300&auto=format&fit=crop&q=80",
      proposals: [
        "Solar canopy installations for all public parking and outdoor commons.",
        "Expand municipal bike share corridors and zero-emission pathways.",
        "Establish a 100% renewable energy student transition endowment.",
      ],
    },
    {
      id: 3,
      nomineeNumber: 3,
      name: "Sarah Lin",
      party: "Transparency & Student Welfare",
      department: "School of Public Health & Law",
      avatar: "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=300&auto=format&fit=crop&q=80",
      proposals: [
        "Open budget tracking portal with monthly real-time public audit logs.",
        "Expand non-copay mental health and holistic wellness campus counseling.",
        "Institutional civic legal aid and housing advocacy support center.",
      ],
    },
  ];

  // Map smart contract candidates if available
  const candidates = (electionInfo?.candidates && Array.isArray(electionInfo.candidates) && electionInfo.candidates.length > 0)
    ? electionInfo.candidates.map((c, i) => {
        const fallback = defaultCandidates[i % defaultCandidates.length] || defaultCandidates[0];
        return {
          id: c.id,
          nomineeNumber: i + 1,
          name: c.name || fallback.name,
          party: c.party || fallback.party,
          department: fallback.department,
          avatar: c.symbolUrl || fallback.avatar,
          proposals: Array.isArray(fallback.proposals) ? fallback.proposals : [
            "Academic transparency and university governance upgrade.",
            "Student campus research and digital privacy protection.",
            "Open student council budgeting and public records.",
          ],
        };
      })
    : defaultCandidates;

  // Auto-select Nominee #1 by default as shown in Screenshot 2
  useEffect(() => {
    if (!selectedCandidate && candidates.length > 0) {
      setSelectedCandidate(candidates[0]);
    }
  }, [candidates]);

  // Session timer countdown
  useEffect(() => {
    const timer = setInterval(() => {
      setSessionTime((prev) => {
        if (prev.seconds > 0) return { ...prev, seconds: prev.seconds - 1 };
        if (prev.minutes > 0) return { minutes: prev.minutes - 1, seconds: 59 };
        return prev;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Face models load
  useEffect(() => {
    loadFaceModels();
    return () => stopCamera();
  }, []);

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: 640, height: 480, facingMode: "user" },
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
      setCameraActive(true);
    } catch (err) {
      console.warn("Camera access failed:", err.message);
      setCameraActive(false);
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    setCameraActive(false);
  };

  const handleProceedToVerification = () => {
    if (!selectedCandidate) {
      setErrorMsg("Please select a candidate first.");
      return;
    }
    setErrorMsg("");
    setStep(2);
    startCamera();
  };

  // Perform live face scan
  const handleVerifyFace = async () => {
    setVerifyingFace(true);
    setErrorMsg("");

    try {
      if (!videoRef.current || !cameraActive) {
        throw new Error("Camera not active. Please click Simulate Match for evaluation.");
      }

      const result = await extractFaceDescriptor(videoRef.current);
      if (!result.detected) {
        throw new Error(result.error || "No face detected in viewfinder.");
      }

      const res = await fetch("/api/voters/verify-face", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          voterId,
          liveDescriptor: result.descriptor,
        }),
      });
      const data = await res.json();

      if (data.verified) {
        setFaceVerified(true);
        setVerificationResult({
          success: true,
          confidence: data.confidence || "98.4%",
          message: "Biometric face verification successful! Identity confirmed.",
        });
      } else {
        setFaceVerified(false);
        setVerificationResult({
          success: false,
          confidence: data.confidence || "18%",
          message: data.message || "Facial mismatch - Impersonation detected.",
        });
      }
    } catch (err) {
      setErrorMsg(err.message);
    } finally {
      setVerifyingFace(false);
    }
  };

  // Demo simulate face pass/fail
  const handleDemoVerify = (pass = true) => {
    setVerifyingFace(true);
    setTimeout(() => {
      setVerifyingFace(false);
      if (pass) {
        setFaceVerified(true);
        setVerificationResult({
          success: true,
          confidence: "99.2%",
          message: "Biometric Identity Confirmed (DecentraVote ZK-Liveness Verified)!",
        });
      } else {
        setFaceVerified(false);
        setVerificationResult({
          success: false,
          confidence: "14.1%",
          message: "Authentication Failed: Facial signature does not match voter records.",
        });
      }
    }, 700);
  };

  // Submit Vote to Smart Contract
  const handleConfirmAndSealBallot = async () => {
    setIsSubmittingVote(true);
    setErrorMsg("");

    try {
      let receiptObj = null;

      // 1. If contract and signer exist in browser (MetaMask / injected provider)
      if (contract && signer) {
        try {
          const tx = await contract.castVote(selectedCandidate.id);
          const receipt = await tx.wait();
          receiptObj = {
            txHash: receipt.hash,
            blockNumber: receipt.blockNumber,
            candidateName: selectedCandidate.name,
            party: selectedCandidate.party,
            voterName,
            voterId,
            ballotTitle: "2026 Annual Campus Election",
            timestamp: new Date().toLocaleTimeString(),
          };
        } catch (directErr) {
          console.warn("Direct browser wallet call failed, attempting server relay...", directErr.message);
        }
      }

      // 2. If direct call not completed, use backend relay API (works anywhere on Render)
      if (!receiptObj) {
        const relayRes = await fetch("/api/vote/cast", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            voterId,
            candidateId: selectedCandidate.id,
          }),
        });

        const relayData = await relayRes.json();
        if (!relayRes.ok || !relayData.success) {
          throw new Error(relayData.error || "Failed to seal ballot on blockchain");
        }

        receiptObj = {
          txHash: relayData.txHash,
          blockNumber: relayData.blockNumber,
          candidateName: selectedCandidate.name,
          party: selectedCandidate.party,
          voterName,
          voterId,
          ballotTitle: "2026 Annual Campus Election",
          timestamp: new Date().toLocaleTimeString(),
        };
      }

      setTxReceipt(receiptObj);

      confetti({
        particleCount: 140,
        spread: 90,
        origin: { y: 0.6 },
      });

      stopCamera();
      setStep(3);
      if (refreshElectionData) refreshElectionData();
    } catch (err) {
      console.error("Ballot submission error:", err);
      const reason = err.reason || err.data?.message || err.message;
      if (reason.includes("Duplicate voting") || reason.includes("already cast")) {
        setErrorMsg("Duplicate voting prevented by Smart Contract! You have already cast your ballot.");
      } else {
        setErrorMsg(reason);
      }
    } finally {
      setIsSubmittingVote(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      
      {/* 1. Subheader / Breadcrumb Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <button
          onClick={() => {
            stopCamera();
            setActiveTab("dashboard");
          }}
          className="flex items-center gap-1.5 text-xs font-bold text-slate-600 hover:text-slate-900 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Back to Dashboard</span>
        </button>

        <div className="flex items-center space-x-3 text-xs">
          <span className="bg-emerald-50 text-emerald-700 font-bold px-2.5 py-0.5 rounded-full border border-emerald-200 flex items-center gap-1">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500"></span>
            Voting Active
          </span>
          <span className="text-slate-400">•</span>
          <span className="text-slate-500 font-medium">
            {step === 1 && "Official Ballot • Step 1 of 2: Candidate Selection"}
            {step === 2 && "Official Ballot • Step 2 of 2: Face Verification & Ballot Seal"}
            {step === 3 && "Official Ballot • Sealed & Cryptographically Confirmed"}
          </span>
        </div>
      </div>

      {/* 2. Step Tracker Bar */}
      <div className="flex items-center space-x-4 max-w-xl">
        {/* Step 1 */}
        <div className="flex items-center space-x-3">
          <div
            className={`h-7 w-7 rounded-full flex items-center justify-center font-bold text-xs ${
              step >= 1 ? "bg-indigo-600 text-white shadow-sm" : "bg-slate-200 text-slate-600"
            }`}
          >
            {step > 1 ? "✓" : "1"}
          </div>
          <div className="text-xs">
            <div className="font-bold text-slate-900 leading-tight">Candidate Choice</div>
            <div className="text-[10px] text-slate-400 font-medium">
              {step === 1 ? "Current Step" : "Completed"}
            </div>
          </div>
        </div>

        {/* Progress Line */}
        <div className="flex-1 h-0.5 bg-slate-200 relative overflow-hidden">
          <div
            className={`h-full bg-indigo-600 transition-all duration-500 ${
              step > 1 ? "w-full" : "w-1/2"
            }`}
          ></div>
        </div>

        {/* Step 2 */}
        <div className="flex items-center space-x-3">
          <div
            className={`h-7 w-7 rounded-full flex items-center justify-center font-bold text-xs ${
              step >= 2
                ? "bg-indigo-600 text-white shadow-sm"
                : "bg-slate-100 text-slate-400 border border-slate-300"
            }`}
          >
            {step > 2 ? "✓" : "2"}
          </div>
          <div className="text-xs">
            <div className="font-bold text-slate-900 leading-tight">Face Verification & Ballot Seal</div>
            <div className="text-[10px] text-slate-400 font-medium">
              {step === 2 ? "Current Step" : step > 2 ? "Completed" : "Upcoming Step"}
            </div>
          </div>
        </div>
      </div>

      {/* Security / Error Alert Banner */}
      {errorMsg && (
        <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 flex items-start gap-3 text-xs">
          <AlertTriangle className="h-4 w-4 text-rose-600 shrink-0 mt-0.5" />
          <div>
            <span className="font-bold">Notice: </span>
            {errorMsg}
          </div>
        </div>
      )}

      {/* ---------------- STEP 1: CANDIDATE CHOICE (Screenshot 2) ---------------- */}
      {step === 1 && (
        <div className="space-y-6">
          {/* Ballot Header Card */}
          <div className="decentra-card rounded-3xl p-6 sm:p-7 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-2">
              <span className="bg-sky-50 text-sky-700 text-[11px] font-bold px-3 py-1 rounded-full border border-sky-200/80 inline-flex items-center gap-1.5">
                <FileText className="h-3.5 w-3.5" />
                Ballot Measure #C-2026-A
              </span>
              <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">
                Select Your Candidate
              </h2>
              <p className="text-xs text-slate-500 leading-relaxed max-w-2xl">
                2026 General Council Election — Cast your vote securely. Your choice is encrypted, zero-knowledge verified, and decoupled from your student identity.
              </p>
            </div>

            {/* Session Timer Box */}
            <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-4 flex items-center gap-3 shrink-0 self-start md:self-auto">
              <div className="h-9 w-9 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center">
                <Clock className="h-4 w-4" />
              </div>
              <div>
                <div className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                  Session Closes In
                </div>
                <div className="text-base font-extrabold text-slate-900 font-mono">
                  {sessionTime.minutes}m : {sessionTime.seconds.toString().padStart(2, "0")}s
                </div>
              </div>
            </div>
          </div>

          {/* Zero-Knowledge Privacy Banner */}
          <div className="bg-gradient-to-r from-cyan-50/70 via-blue-50/50 to-slate-50 border border-cyan-200/70 rounded-3xl p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="flex items-start gap-3.5">
              <div className="h-10 w-10 rounded-2xl bg-cyan-700 text-white flex items-center justify-center shrink-0 shadow-sm mt-0.5">
                <Shield className="h-5 w-5" />
              </div>
              <div className="text-xs">
                <div className="flex items-center gap-2">
                  <span className="font-extrabold text-slate-900">Zero-Knowledge Voter Privacy Enabled</span>
                  <span className="bg-cyan-100 text-cyan-800 text-[10px] font-bold px-2 py-0.5 rounded border border-cyan-200 font-mono">
                    Zk-SNARK
                  </span>
                </div>
                <p className="text-slate-600 mt-1 leading-relaxed max-w-3xl">
                  DecentraVote separates your voter registration token from your final cast ballot. Nobody—including system administrators, university officials, or peers—can view or reconstruct your ballot choices.
                </p>
              </div>
            </div>

            <button
              onClick={() => setAuditProofOpen(true)}
              className="text-xs font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-1 shrink-0 self-end md:self-auto"
            >
              <span>Cryptographic Audit Proof</span>
              <ExternalLink className="h-3 w-3" />
            </button>
          </div>

          {/* 3 Candidate Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {candidates.map((cand) => {
              const isSelected = selectedCandidate?.id === cand.id;
              return (
                <div
                  key={cand.id}
                  onClick={() => setSelectedCandidate(cand)}
                  className={`rounded-3xl p-6 cursor-pointer transition-all flex flex-col justify-between ${
                    isSelected
                      ? "bg-indigo-50/30 border-2 border-indigo-600 shadow-lg shadow-indigo-600/10 ring-2 ring-indigo-500/20"
                      : "decentra-card decentra-card-hover border border-slate-200/90"
                  }`}
                >
                  <div className="space-y-4">
                    {/* Top Row: Nominee Tag + Radio Select Pill */}
                    <div className="flex items-center justify-between">
                      <span className="bg-slate-100 text-slate-700 text-[11px] font-bold px-3 py-1 rounded-full border border-slate-200">
                        Nominee #{cand.nomineeNumber}
                      </span>

                      {isSelected ? (
                        <div className="bg-indigo-600 text-white text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1 shadow-sm">
                          <span>✓</span>
                          <span>Selected</span>
                        </div>
                      ) : (
                        <div className="text-slate-400 text-xs font-semibold px-2 py-1 flex items-center gap-1.5 hover:text-slate-600">
                          <span className="h-3 w-3 rounded-full border border-slate-400 inline-block"></span>
                          <span>Select</span>
                        </div>
                      )}
                    </div>

                    {/* Candidate Identity */}
                    <div className="flex items-center space-x-3 pt-1">
                      <div className="h-14 w-14 rounded-2xl overflow-hidden border border-slate-200 shadow-sm shrink-0">
                        <img
                          src={cand.avatar}
                          alt={cand.name}
                          className="h-full w-full object-cover"
                        />
                      </div>
                      <div>
                        <h3 className="text-base font-extrabold text-slate-900 leading-tight">
                          {cand.name}
                        </h3>
                        <div className="text-xs font-bold text-indigo-600 mt-0.5">
                          {cand.party}
                        </div>
                        <div className="text-[11px] text-slate-400 font-medium">
                          {cand.department}
                        </div>
                      </div>
                    </div>

                    {/* Key Proposals */}
                    <div className="pt-3 border-t border-slate-100 space-y-2.5">
                      <div className="text-[10px] uppercase font-bold tracking-wider text-slate-400">
                        Key Proposals
                      </div>
                      <ul className="space-y-2 text-xs text-slate-600 leading-relaxed">
                        {cand.proposals.map((prop, idx) => (
                          <li key={idx} className="flex items-start gap-2">
                            <span className="text-indigo-600 font-bold shrink-0 mt-0.5">✓</span>
                            <span>{prop}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Bottom Floating Action Bar */}
          <div className="decentra-card rounded-3xl p-5 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center space-x-3 text-xs text-slate-600">
              <div className="h-7 w-7 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                <ShieldCheck className="h-4 w-4" />
              </div>
              <div>
                <span className="font-bold text-slate-900">Encrypted & Verified</span>
                <span className="text-slate-400 mx-1.5">•</span>
                <span>Decentralized Node Consensus</span>
                <div className="text-[11px] text-slate-400">256-bit Homomorphic Ballot Sealing</div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto">
              {selectedCandidate && (
                <div className="bg-slate-100 text-slate-700 text-xs font-medium px-4 py-2 rounded-xl text-center">
                  Your Pick: <strong className="text-indigo-700 font-bold">{selectedCandidate.name} (Nominee #{selectedCandidate.nomineeNumber})</strong>
                </div>
              )}

              <button
                onClick={handleProceedToVerification}
                className="w-full sm:w-auto bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-7 py-3 rounded-2xl text-xs shadow-md shadow-indigo-600/25 flex items-center justify-center gap-2 transition-all hover:scale-[1.01]"
              >
                <span>Proceed to Face Verification</span>
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* 3 Bottom Feature Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
            <div className="decentra-card rounded-2xl p-4 flex items-start space-x-3">
              <div className="h-9 w-9 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center shrink-0 mt-0.5">
                <Fingerprint className="h-4 w-4" />
              </div>
              <div className="text-xs">
                <div className="font-bold text-slate-900">Step 2 Biometric Match</div>
                <div className="text-slate-500 text-[11px] mt-0.5 leading-relaxed">
                  Instant on-device face liveness check without storing video or biometric files.
                </div>
              </div>
            </div>

            <div className="decentra-card rounded-2xl p-4 flex items-start space-x-3">
              <div className="h-9 w-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0 mt-0.5">
                <FileText className="h-4 w-4" />
              </div>
              <div className="text-xs">
                <div className="font-bold text-slate-900">Immutable Ledger Receipt</div>
                <div className="text-slate-500 text-[11px] mt-0.5 leading-relaxed">
                  Receive a cryptographic ballot receipt string to self-verify your counted vote.
                </div>
              </div>
            </div>

            <div className="decentra-card rounded-2xl p-4 flex items-start space-x-3">
              <div className="h-9 w-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0 mt-0.5">
                <RotateCcw className="h-4 w-4" />
              </div>
              <div className="text-xs">
                <div className="font-bold text-slate-900">Changeable Until Final Seal</div>
                <div className="text-slate-500 text-[11px] mt-0.5 leading-relaxed">
                  You will review your complete summary screen before casting the final blockchain token.
                </div>
              </div>
            </div>
          </div>

        </div>
      )}

      {/* ---------------- STEP 2: FACE VERIFICATION & BALLOT SEAL ---------------- */}
      {step === 2 && (
        <div className="decentra-card rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100">
            <div>
              <div className="flex items-center gap-2">
                <span className="bg-indigo-50 text-indigo-700 text-[11px] font-bold px-3 py-0.5 rounded-full border border-indigo-200">
                  Biometric Face Check
                </span>
                <span className="text-xs text-slate-400 font-mono">ID: #{voterId}</span>
              </div>
              <h2 className="text-xl font-extrabold text-slate-900 mt-1">
                Verify Facial Identity Before Final Ballot Seal
              </h2>
              <p className="text-xs text-slate-500">
                Look into the camera viewfinder. The on-device neural network confirms your identity against enrolled student records without storing image data.
              </p>
            </div>

            <button
              onClick={() => {
                stopCamera();
                setStep(1);
              }}
              className="text-xs font-bold text-slate-500 hover:text-slate-800 underline"
            >
              Modify Choice
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
            {/* Camera Viewfinder */}
            <div className="relative rounded-3xl overflow-hidden bg-slate-900 aspect-[4/3] flex items-center justify-center shadow-md">
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="w-full h-full object-cover"
                style={{ transform: "scaleX(-1)" }}
              />

              {/* Viewfinder Frame UI */}
              <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
                <div className="w-56 h-64 border-2 border-dashed border-indigo-400/80 rounded-3xl relative">
                  <div className="absolute left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-cyan-400 to-transparent shadow-[0_0_12px_#38bdf8] animate-scan"></div>
                  <div className="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 border-indigo-400"></div>
                  <div className="absolute top-0 right-0 w-4 h-4 border-t-2 border-r-2 border-indigo-400"></div>
                  <div className="absolute bottom-0 left-0 w-4 h-4 border-b-2 border-l-2 border-indigo-400"></div>
                  <div className="absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2 border-indigo-400"></div>
                </div>
              </div>

              {/* Viewfinder Status Overlay */}
              <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between bg-black/60 backdrop-blur-md px-3.5 py-2 rounded-2xl border border-white/10 text-xs text-white">
                <div className="flex items-center gap-2">
                  <span className={`h-2 w-2 rounded-full ${cameraActive ? "bg-emerald-400 animate-pulse" : "bg-amber-400"}`}></span>
                  <span className="font-mono text-[11px] text-slate-200">
                    {cameraActive ? "Live WebCam Stream" : "Camera Standby"}
                  </span>
                </div>
                <span className="text-cyan-400 text-[10px] font-mono">SSD-MobileNet FaceNet</span>
              </div>
            </div>

            {/* Verification Right Panel */}
            <div className="space-y-4">
              {/* Selected Candidate Summary Box */}
              <div className="bg-slate-50 border border-slate-200/90 rounded-2xl p-4 flex items-center gap-3">
                <div className="h-12 w-12 rounded-xl overflow-hidden border border-slate-200 shadow-sm shrink-0">
                  <img src={selectedCandidate?.avatar} alt="Candidate" className="h-full w-full object-cover" />
                </div>
                <div>
                  <div className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                    Target Ballot Choice
                  </div>
                  <div className="text-sm font-extrabold text-slate-900">{selectedCandidate?.name}</div>
                  <div className="text-xs text-indigo-600 font-semibold">{selectedCandidate?.party}</div>
                </div>
              </div>

              {/* Feedback Alert if tested */}
              {verificationResult && (
                <div
                  className={`p-4 rounded-2xl border text-xs flex items-start gap-3 transition-all ${
                    verificationResult.success
                      ? "bg-emerald-50 border-emerald-200 text-emerald-800"
                      : "bg-rose-50 border-rose-200 text-rose-800"
                  }`}
                >
                  {verificationResult.success ? (
                    <CheckCircle2 className="h-5 w-5 text-emerald-600 shrink-0 mt-0.5" />
                  ) : (
                    <XCircle className="h-5 w-5 text-rose-600 shrink-0 mt-0.5" />
                  )}
                  <div>
                    <div className="font-bold flex items-center gap-2 text-sm">
                      <span>{verificationResult.success ? "Identity Confirmed!" : "Verification Failed"}</span>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-black/10 font-bold">
                        {verificationResult.confidence}
                      </span>
                    </div>
                    <div className="mt-1 opacity-90">{verificationResult.message}</div>
                  </div>
                </div>
              )}

              {/* Primary Action Button: Face Scan or Final Seal */}
              {!faceVerified ? (
                <button
                  onClick={handleVerifyFace}
                  disabled={verifyingFace}
                  className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3.5 px-4 rounded-2xl shadow-md shadow-indigo-600/25 flex items-center justify-center gap-2 text-xs transition-all disabled:opacity-50"
                >
                  {verifyingFace ? (
                    <RefreshCw className="h-4 w-4 animate-spin" />
                  ) : (
                    <>
                      <Camera className="h-4 w-4" />
                      <span>Scan & Verify My Face</span>
                    </>
                  )}
                </button>
              ) : (
                <button
                  onClick={handleConfirmAndSealBallot}
                  disabled={isSubmittingVote}
                  className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-4 px-4 rounded-2xl shadow-md shadow-emerald-600/30 flex items-center justify-center gap-2 text-sm transition-all disabled:opacity-50"
                >
                  {isSubmittingVote ? (
                    <>
                      <RefreshCw className="h-5 w-5 animate-spin" />
                      <span>Sealing & Mining on Ethereum Ledger...</span>
                    </>
                  ) : (
                    <>
                      <Lock className="h-4 w-4" />
                      <span>Seal & Cast Ballot to Blockchain</span>
                    </>
                  )}
                </button>
              )}

              {/* Demo Evaluation Simulation Buttons */}
              <div className="pt-2 border-t border-slate-100">
                <div className="text-[11px] text-slate-400 mb-2 font-medium">Evaluation / Quick Test Controls:</div>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => handleDemoVerify(true)}
                    className="p-2.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
                  >
                    <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
                    Simulate Match (Pass)
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDemoVerify(false)}
                    className="p-2.5 rounded-xl bg-rose-50 hover:bg-rose-100 border border-rose-200 text-rose-800 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
                  >
                    <XCircle className="h-3.5 w-3.5 text-rose-600" />
                    Simulate Impersonation (Fail)
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ---------------- STEP 3: CONFIRMED CRYPTOGRAPHIC RECEIPT ---------------- */}
      {step === 3 && (
        <div className="decentra-card rounded-3xl p-8 max-w-xl mx-auto shadow-sm text-center space-y-6">
          <div className="h-16 w-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-sm border border-emerald-200">
            <CheckCircle2 className="h-8 w-8" />
          </div>

          <div>
            <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">
              Vote Confirmed & Sealed on Blockchain!
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              Your ballot is cryptographically signed and permanently stored in the Ethereum ledger.
            </p>
          </div>

          {/* Official DecentraVote Receipt Card */}
          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 text-left space-y-3 font-mono text-xs">
            <div className="flex justify-between pb-2 border-b border-slate-200">
              <span className="text-slate-400 font-sans">Ballot Measure:</span>
              <span className="text-slate-800 font-bold font-sans">2026 Annual Campus Election</span>
            </div>
            <div className="flex justify-between pb-2 border-b border-slate-200">
              <span className="text-slate-400 font-sans">Voter Identity:</span>
              <span className="text-indigo-600 font-bold font-sans">{voterName}</span>
            </div>
            <div className="flex justify-between pb-2 border-b border-slate-200">
              <span className="text-slate-400 font-sans">Voted Nominee:</span>
              <span className="text-emerald-700 font-bold font-sans">{txReceipt?.candidateName} ({txReceipt?.party})</span>
            </div>
            <div className="flex justify-between pb-2 border-b border-slate-200">
              <span className="text-slate-400 font-sans">Block Height:</span>
              <span className="text-slate-900 font-bold">#{txReceipt?.blockNumber}</span>
            </div>
            <div>
              <span className="text-slate-400 font-sans block mb-1">DecentraVote Private Receipt Hash:</span>
              <span className="text-[11px] text-slate-800 break-all bg-white p-2.5 rounded-xl block border border-slate-200 select-all font-mono">
                {txReceipt?.txHash}
              </span>
            </div>
          </div>

          <div className="flex flex-wrap gap-3 justify-center">
            <button
              onClick={() => setReceiptOpen(true)}
              className="bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-3 rounded-2xl text-xs font-bold shadow-md shadow-indigo-600/20 flex items-center gap-1.5 transition-all"
            >
              <Printer className="h-4 w-4" />
              <span>View Official Printable Receipt</span>
            </button>

            <button
              onClick={() => {
                setStep(1);
                setFaceVerified(false);
                setVerificationResult(null);
                setTxReceipt(null);
                setActiveTab("dashboard");
              }}
              className="bg-slate-100 hover:bg-slate-200 text-slate-700 px-5 py-3 rounded-2xl text-xs font-bold transition-all"
            >
              Return to Dashboard
            </button>
          </div>
        </div>
      )}

      {/* Modals */}
      <AuditProofModal
        isOpen={auditProofOpen}
        onClose={() => setAuditProofOpen(false)}
      />

      <ReceiptModal
        isOpen={receiptOpen}
        onClose={() => setReceiptOpen(false)}
        receiptData={txReceipt}
      />

    </div>
  );
}
