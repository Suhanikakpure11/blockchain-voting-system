import React, { useState, useRef, useEffect } from "react";
import {
  Camera,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Fingerprint,
  Vote,
  ShieldCheck,
  RefreshCw,
  ExternalLink,
  Lock,
  ArrowRight,
  UserCheck,
  Sparkles,
  Award,
} from "lucide-react";
import confetti from "canvas-confetti";
import { extractFaceDescriptor, verifyFaceBiometrics, loadFaceModels } from "../utils/faceMatcher";

export default function VoterPortal({ contract, signer, userAddress, electionInfo, refreshElectionData }) {
  const [step, setStep] = useState(1); // 1: ID lookup, 2: Face auth, 3: Ballot, 4: Confirmed
  const [voterIdInput, setVoterIdInput] = useState("VOTER-27");
  const [voterProfile, setVoterProfile] = useState(null);
  const [onChainStatus, setOnChainStatus] = useState(null);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  // Face auth states
  const [cameraActive, setCameraActive] = useState(false);
  const [faceModelReady, setFaceModelReady] = useState(false);
  const [verifyingFace, setVerifyingFace] = useState(false);
  const [verificationResult, setVerificationResult] = useState(null);
  const [liveStream, setLiveStream] = useState(null);

  // Voting states
  const [selectedCandidate, setSelectedCandidate] = useState(null);
  const [isSubmittingVote, setIsSubmittingVote] = useState(false);
  const [txReceipt, setTxReceipt] = useState(null);

  const videoRef = useRef(null);
  const canvasRef = useRef(null);

  // Load models on mount
  useEffect(() => {
    loadFaceModels().then((ok) => setFaceModelReady(ok));
    return () => {
      stopCamera();
    };
  }, []);

  // Fetch voter info from backend and blockchain
  const lookupVoter = async (idToLookup) => {
    const id = idToLookup || voterIdInput;
    if (!id.trim()) {
      setErrorMsg("Please enter a valid Voter ID");
      return;
    }

    setLoading(true);
    setErrorMsg("");
    setVerificationResult(null);

    try {
      const res = await fetch(`/api/voters/${id.trim()}`);
      if (!res.ok) {
        throw new Error(`Voter ID '${id}' not found in registry`);
      }
      const data = await res.json();
      setVoterProfile(data);

      // Check on-chain status
      if (contract && data.walletAddress) {
        try {
          const onChain = await contract.getVoter(data.walletAddress);
          setOnChainStatus({
            isRegistered: onChain.isRegistered,
            hasVoted: onChain.hasVoted,
            votedCandidateId: Number(onChain.votedCandidateId),
            votedTimestamp: Number(onChain.votedTimestamp),
          });

          if (onChain.hasVoted) {
            setErrorMsg(`Voter ${data.name} has ALREADY voted on the blockchain! Duplicate voting prohibited.`);
          }
        } catch (e) {
          console.warn("Could not query contract voter:", e);
        }
      }

      setStep(2);
      startCamera();
    } catch (err) {
      setErrorMsg(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Start webcam
  const startCamera = async () => {
    try {
      setErrorMsg("");
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: 640, height: 480, facingMode: "user" },
      });
      setLiveStream(stream);
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
      setCameraActive(true);
    } catch (err) {
      console.warn("Webcam access error:", err.message);
      setCameraActive(false);
      // Fallback message
      setErrorMsg("Camera access not available. You can use Demo Face Verification below to proceed.");
    }
  };

  const stopCamera = () => {
    if (liveStream) {
      liveStream.getTracks().forEach((track) => track.stop());
      setLiveStream(null);
    }
    setCameraActive(false);
  };

  // Perform Face Verification
  const handleVerifyFace = async () => {
    if (!videoRef.current && !cameraActive) {
      setErrorMsg("Camera is not active. Use Demo Verification if camera is unavailable.");
      return;
    }

    setVerifyingFace(true);
    setErrorMsg("");

    try {
      // Extract 128-d descriptor from current live webcam frame
      const result = await extractFaceDescriptor(videoRef.current);

      if (!result.detected) {
        throw new Error(result.error || "No face detected in video stream.");
      }

      // Send live descriptor to server to compare with voter's registered biometric template
      const verifyRes = await fetch("/api/voters/verify-face", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          voterId: voterProfile.voterId,
          liveDescriptor: result.descriptor,
        }),
      });

      const verifyData = await verifyRes.json();

      if (verifyData.verified) {
        setVerificationResult({
          success: true,
          confidence: verifyData.confidence || "98.4%",
          message: verifyData.message || "Face identity verified successfully!",
        });
        stopCamera();
        setTimeout(() => setStep(3), 1200);
      } else {
        setVerificationResult({
          success: false,
          confidence: verifyData.confidence || "15%",
          message: verifyData.message || "Facial match failed. Impersonation detected.",
        });
      }
    } catch (err) {
      setErrorMsg("Verification error: " + err.message);
    } finally {
      setVerifyingFace(false);
    }
  };

  // Quick Demo Verification (for immediate presentation/testing)
  const handleDemoVerify = (asMatched = true) => {
    setVerifyingFace(true);
    setTimeout(() => {
      setVerifyingFace(false);
      if (asMatched) {
        setVerificationResult({
          success: true,
          confidence: "99.2%",
          message: "Biometric Identity Confirmed (Demo Match) - Voter authenticated!",
        });
        stopCamera();
        setTimeout(() => setStep(3), 800);
      } else {
        setVerificationResult({
          success: false,
          confidence: "22.5%",
          message: "Impersonation Alert: Live facial structure does not match registered voter record.",
        });
      }
    }, 1000);
  };

  // Cast Vote on Smart Contract
  const handleCastVote = async () => {
    if (!selectedCandidate) {
      setErrorMsg("Please select a candidate to vote for.");
      return;
    }
    if (!contract || !signer) {
      setErrorMsg("Smart contract signer not connected. Please connect wallet.");
      return;
    }

    setIsSubmittingVote(true);
    setErrorMsg("");

    try {
      console.log(`Casting vote for candidate ID: ${selectedCandidate.id}...`);
      const tx = await contract.castVote(selectedCandidate.id);
      console.log(`Vote tx submitted: ${tx.hash}. Waiting for block confirmation...`);

      const receipt = await tx.wait();
      console.log(`Vote confirmed in block ${receipt.blockNumber}!`);

      setTxReceipt({
        txHash: receipt.hash,
        blockNumber: receipt.blockNumber,
        candidateName: selectedCandidate.name,
        party: selectedCandidate.party,
        timestamp: new Date().toLocaleTimeString(),
      });

      // Confetti celebration
      confetti({
        particleCount: 120,
        spread: 80,
        origin: { y: 0.6 },
      });

      setStep(4);
      refreshElectionData();
    } catch (err) {
      console.error("Cast vote error:", err);
      const reason = err.reason || err.data?.message || err.message;
      if (reason.includes("Duplicate voting prohibited") || reason.includes("already cast")) {
        setErrorMsg("Duplicate voting prevented by Smart Contract! You have already cast your ballot.");
      } else if (reason.includes("not registered")) {
        setErrorMsg("Wallet address is not registered on the smart contract.");
      } else {
        setErrorMsg(reason);
      }
    } finally {
      setIsSubmittingVote(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto py-6 px-4">
      {/* Step Tracker */}
      <div className="mb-8">
        <div className="flex items-center justify-between relative">
          <div className="absolute top-1/2 left-0 w-full h-0.5 bg-slate-800 -z-0 transform -translate-y-1/2"></div>
          {[
            { num: 1, label: "Voter ID" },
            { num: 2, label: "Face Biometrics" },
            { num: 3, label: "Digital Ballot" },
            { num: 4, label: "Receipt" },
          ].map((s) => (
            <div key={s.num} className="flex flex-col items-center relative z-10">
              <div
                className={`h-9 w-9 rounded-full flex items-center justify-center font-bold text-xs transition-all ${
                  step === s.num
                    ? "bg-indigo-600 text-white ring-4 ring-indigo-500/30 scale-110 shadow-lg shadow-indigo-600/50"
                    : step > s.num
                    ? "bg-emerald-600 text-white"
                    : "bg-slate-800 text-slate-400 border border-slate-700"
                }`}
              >
                {step > s.num ? <CheckCircle2 className="h-5 w-5" /> : s.num}
              </div>
              <span className={`text-[11px] mt-2 font-medium ${step >= s.num ? "text-slate-200" : "text-slate-500"}`}>
                {s.label}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Global Error Banner */}
      {errorMsg && (
        <div className="mb-6 p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 flex items-start gap-3">
          <AlertTriangle className="h-5 w-5 text-rose-400 shrink-0 mt-0.5" />
          <div className="text-sm">
            <span className="font-semibold">Security Alert: </span>
            {errorMsg}
          </div>
        </div>
      )}

      {/* ---------------- STEP 1: VOTER LOOKUP ---------------- */}
      {step === 1 && (
        <div className="glass-card rounded-2xl p-6 sm:p-8 shadow-2xl">
          <div className="text-center max-w-lg mx-auto mb-8">
            <div className="inline-flex p-3 rounded-2xl bg-indigo-500/10 text-indigo-400 mb-3 border border-indigo-500/20">
              <Fingerprint className="h-8 w-8" />
            </div>
            <h2 className="text-2xl font-bold text-white tracking-tight">Voter Biometric Verification</h2>
            <p className="text-slate-400 text-sm mt-1">
              Enter your registered Voter ID to initiate biometric facial verification and unlock your cryptographic ballot.
            </p>
          </div>

          <div className="max-w-md mx-auto space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                Student Voter ID
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={voterIdInput}
                  onChange={(e) => setVoterIdInput(e.target.value.toUpperCase())}
                  placeholder="e.g. VOTER-27"
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-white font-mono text-base focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>

            {/* Quick Demo Pre-fills */}
            <div>
              <div className="text-xs text-slate-400 mb-2 font-medium">Quick Select (Student Authors):</div>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: "VOTER-27", name: "Shravani [27]" },
                  { id: "VOTER-28", name: "Shreya [28]" },
                  { id: "VOTER-33", name: "Suhani [33]" },
                ].map((s) => (
                  <button
                    key={s.id}
                    type="button"
                    onClick={() => {
                      setVoterIdInput(s.id);
                      lookupVoter(s.id);
                    }}
                    className="p-2 rounded-lg bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700 text-slate-300 text-xs font-mono transition-all text-center"
                  >
                    <div className="font-bold text-indigo-400">{s.id}</div>
                    <div className="text-[10px] text-slate-400 truncate">{s.name}</div>
                  </button>
                ))}
              </div>
            </div>

            <button
              onClick={() => lookupVoter()}
              disabled={loading}
              className="w-full bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white font-semibold py-3 px-4 rounded-xl shadow-lg shadow-indigo-600/30 flex items-center justify-center gap-2 transition-all disabled:opacity-50"
            >
              {loading ? (
                <RefreshCw className="h-5 w-5 animate-spin" />
              ) : (
                <>
                  <span>Proceed to Face Scan</span>
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {/* ---------------- STEP 2: FACE RECOGNITION ---------------- */}
      {step === 2 && (
        <div className="glass-card rounded-2xl p-6 sm:p-8 shadow-2xl">
          <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-800">
            <div>
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <Camera className="h-5 w-5 text-indigo-400" />
                Biometric Facial Verification
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Verifying live face against registered student record:{" "}
                <span className="text-indigo-300 font-semibold">{voterProfile?.name}</span> ({voterProfile?.voterId})
              </p>
            </div>
            <button
              onClick={() => {
                stopCamera();
                setStep(1);
              }}
              className="text-xs text-slate-400 hover:text-slate-200 underline"
            >
              Change ID
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
            {/* Live Camera Feed */}
            <div className="relative rounded-2xl overflow-hidden bg-slate-900 border border-slate-700 aspect-[4/3] flex items-center justify-center">
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="w-full h-full object-cover mirror"
                style={{ transform: "scaleX(-1)" }}
              />

              {/* Viewfinder Target UI */}
              <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
                <div className="w-56 h-64 border-2 border-dashed border-indigo-400/60 rounded-3xl relative">
                  {/* Scan Laser */}
                  <div className="absolute left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-cyan-400 to-transparent shadow-[0_0_10px_#22d3ee] animate-scan"></div>
                  {/* Corner brackets */}
                  <div className="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 border-indigo-400"></div>
                  <div className="absolute top-0 right-0 w-4 h-4 border-t-2 border-r-2 border-indigo-400"></div>
                  <div className="absolute bottom-0 left-0 w-4 h-4 border-b-2 border-l-2 border-indigo-400"></div>
                  <div className="absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2 border-indigo-400"></div>
                </div>
              </div>

              {/* Status pill over video */}
              <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between bg-slate-950/80 backdrop-blur-md px-3 py-1.5 rounded-xl border border-white/10 text-xs">
                <div className="flex items-center gap-2">
                  <span className={`h-2 w-2 rounded-full ${cameraActive ? "bg-emerald-400 animate-pulse" : "bg-rose-400"}`}></span>
                  <span className="text-slate-300 font-mono text-[11px]">
                    {cameraActive ? "Live Cam Active" : "Camera Standby"}
                  </span>
                </div>
                <span className="text-indigo-400 text-[10px] font-mono">SSD-MobileNet FaceNet</span>
              </div>
            </div>

            {/* Verification Panel & Actions */}
            <div className="space-y-4">
              {/* Registered Profile Card */}
              <div className="bg-slate-900/80 border border-slate-800 p-4 rounded-xl flex items-center gap-3">
                <img
                  src={voterProfile?.photoUrl || "https://api.dicebear.com/7.x/bottts/svg?seed=voter"}
                  alt="Registered Face"
                  className="w-14 h-14 rounded-xl object-cover border border-indigo-500/40"
                />
                <div>
                  <div className="text-xs text-indigo-400 font-mono font-semibold">{voterProfile?.voterId}</div>
                  <div className="text-sm font-bold text-white">{voterProfile?.name}</div>
                  <div className="text-xs text-slate-400 font-mono truncate max-w-[200px]">
                    {voterProfile?.walletAddress}
                  </div>
                </div>
              </div>

              {/* Verification Feedback Result */}
              {verificationResult && (
                <div
                  className={`p-4 rounded-xl border text-sm flex items-start gap-3 transition-all ${
                    verificationResult.success
                      ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-300"
                      : "bg-rose-500/10 border-rose-500/30 text-rose-300"
                  }`}
                >
                  {verificationResult.success ? (
                    <CheckCircle2 className="h-5 w-5 text-emerald-400 shrink-0 mt-0.5" />
                  ) : (
                    <XCircle className="h-5 w-5 text-rose-400 shrink-0 mt-0.5" />
                  )}
                  <div>
                    <div className="font-bold flex items-center gap-2">
                      <span>{verificationResult.success ? "Biometric Match Confirmed!" : "Authentication Denied"}</span>
                      <span className="text-xs font-mono px-2 py-0.5 rounded bg-black/30">
                        {verificationResult.confidence}
                      </span>
                    </div>
                    <div className="text-xs mt-1 opacity-90">{verificationResult.message}</div>
                  </div>
                </div>
              )}

              {/* Camera Trigger */}
              <button
                onClick={handleVerifyFace}
                disabled={verifyingFace}
                className="w-full bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-semibold py-3 px-4 rounded-xl shadow-lg shadow-emerald-600/30 flex items-center justify-center gap-2 transition-all disabled:opacity-50"
              >
                {verifyingFace ? (
                  <RefreshCw className="h-5 w-5 animate-spin" />
                ) : (
                  <>
                    <Camera className="h-4 w-4" />
                    <span>Scan & Verify My Face</span>
                  </>
                )}
              </button>

              {/* Demo Simulation Buttons (for instant presentation / evaluation) */}
              <div className="pt-2 border-t border-slate-800">
                <div className="text-[11px] text-slate-400 mb-2 flex items-center gap-1">
                  <Sparkles className="h-3.5 w-3.5 text-amber-400" />
                  <span>Evaluation / Demo Triggers:</span>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => handleDemoVerify(true)}
                    className="p-2 rounded-lg bg-emerald-950/40 hover:bg-emerald-900/60 border border-emerald-700/50 text-emerald-300 text-xs font-medium flex items-center justify-center gap-1.5 transition-all"
                  >
                    <CheckCircle2 className="h-3.5 w-3.5" />
                    Simulate Match (Pass)
                  </button>
                  <button
                    onClick={() => handleDemoVerify(false)}
                    className="p-2 rounded-lg bg-rose-950/40 hover:bg-rose-900/60 border border-rose-700/50 text-rose-300 text-xs font-medium flex items-center justify-center gap-1.5 transition-all"
                  >
                    <XCircle className="h-3.5 w-3.5" />
                    Simulate Impersonation (Fail)
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ---------------- STEP 3: DIGITAL BALLOT ---------------- */}
      {step === 3 && (
        <div className="space-y-6">
          <div className="glass-card rounded-2xl p-6 shadow-xl flex flex-wrap items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 text-[11px] font-bold px-2.5 py-0.5 rounded-full flex items-center gap-1">
                  <CheckCircle2 className="h-3.5 w-3.5" /> Biometrically Authenticated
                </span>
                <span className="text-xs text-slate-400 font-mono">{voterProfile?.voterId}</span>
              </div>
              <h2 className="text-xl font-bold text-white mt-1">Official Digital Ballot</h2>
              <p className="text-xs text-slate-400">
                Select your chosen candidate. Your ballot will be cryptographically signed and stored immutably on the Ethereum blockchain.
              </p>
            </div>

            <div className="text-right">
              <div className="text-[11px] text-slate-400">Election State</div>
              <div className="text-sm font-bold text-emerald-400 flex items-center gap-1 justify-end">
                <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse"></span>
                {electionInfo?.state || "Active"}
              </div>
            </div>
          </div>

          {/* Candidate Ballot Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {electionInfo?.candidates && electionInfo.candidates.length > 0 ? (
              electionInfo.candidates.map((cand) => {
                const isSelected = selectedCandidate?.id === cand.id;
                return (
                  <div
                    key={cand.id}
                    onClick={() => setSelectedCandidate(cand)}
                    className={`rounded-2xl p-5 cursor-pointer transition-all border relative flex flex-col justify-between ${
                      isSelected
                        ? "bg-indigo-950/60 border-indigo-500 ring-2 ring-indigo-500/50 shadow-xl shadow-indigo-600/30 scale-[1.02]"
                        : "glass-card glass-card-hover border-slate-800"
                    }`}
                  >
                    {isSelected && (
                      <div className="absolute top-3 right-3 h-6 w-6 rounded-full bg-indigo-600 text-white flex items-center justify-center shadow-md">
                        <CheckCircle2 className="h-4 w-4" />
                      </div>
                    )}

                    <div>
                      <div className="flex items-center space-x-3 mb-4">
                        <img
                          src={cand.symbolUrl || `https://api.dicebear.com/7.x/bottts/svg?seed=${cand.name}`}
                          alt={cand.name}
                          className="w-14 h-14 rounded-2xl bg-slate-800 p-1 border border-slate-700 object-cover"
                        />
                        <div>
                          <span className="text-[10px] font-mono text-indigo-400 font-bold uppercase tracking-wider">
                            Candidate #{cand.id}
                          </span>
                          <h3 className="text-base font-bold text-white leading-tight">{cand.name}</h3>
                          <div className="text-xs text-slate-400 font-medium">{cand.party}</div>
                        </div>
                      </div>

                      <div className="bg-slate-900/60 rounded-xl p-3 border border-slate-800/80 mb-4">
                        <div className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-1">
                          Key Manifesto
                        </div>
                        <p className="text-xs text-slate-300 leading-relaxed italic">
                          "{cand.manifesto || "Dedicated to students and technological progress."}"
                        </p>
                      </div>
                    </div>

                    <button
                      type="button"
                      className={`w-full py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                        isSelected
                          ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/40"
                          : "bg-slate-800 text-slate-300 hover:bg-slate-700"
                      }`}
                    >
                      <Vote className="h-4 w-4" />
                      {isSelected ? "Selected Candidate" : "Select Candidate"}
                    </button>
                  </div>
                );
              })
            ) : (
              <div className="col-span-3 text-center py-12 text-slate-500">
                No candidates loaded. Please check blockchain connectivity or deploy candidates in Admin desk.
              </div>
            )}
          </div>

          {/* Submit Ballot Action */}
          <div className="glass-card rounded-2xl p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div>
              <div className="text-sm font-semibold text-white">
                Selected:{" "}
                <span className="text-indigo-400">
                  {selectedCandidate ? `${selectedCandidate.name} (${selectedCandidate.party})` : "None Selected"}
                </span>
              </div>
              <div className="text-xs text-slate-400 mt-0.5">
                Signing wallet: <span className="font-mono text-slate-300">{userAddress || "Not Connected"}</span>
              </div>
            </div>

            <button
              onClick={handleCastVote}
              disabled={!selectedCandidate || isSubmittingVote}
              className="w-full sm:w-auto bg-gradient-to-r from-indigo-600 via-violet-600 to-indigo-600 hover:from-indigo-500 hover:to-violet-500 text-white font-bold py-3.5 px-8 rounded-xl shadow-xl shadow-indigo-600/40 flex items-center justify-center gap-2 transition-all disabled:opacity-50"
            >
              {isSubmittingVote ? (
                <>
                  <RefreshCw className="h-5 w-5 animate-spin" />
                  <span>Recording on Ethereum Ledger...</span>
                </>
              ) : (
                <>
                  <Lock className="h-4 w-4" />
                  <span>Submit Tamper-Proof Vote</span>
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {/* ---------------- STEP 4: VOTE RECEIPT ---------------- */}
      {step === 4 && (
        <div className="glass-card rounded-2xl p-8 max-w-xl mx-auto shadow-2xl text-center">
          <div className="h-16 w-16 bg-emerald-500/20 text-emerald-400 rounded-full flex items-center justify-center mx-auto mb-4 border border-emerald-500/40">
            <CheckCircle2 className="h-10 w-10" />
          </div>

          <h2 className="text-2xl font-bold text-white tracking-tight">Vote Confirmed on Blockchain!</h2>
          <p className="text-slate-400 text-sm mt-1">
            Your vote has been immutably committed to the decentralized Ethereum ledger.
          </p>

          {/* Official Receipt Card */}
          <div className="bg-slate-900 border border-slate-700/80 rounded-2xl p-5 my-6 text-left space-y-3 font-mono text-xs">
            <div className="flex justify-between pb-2 border-b border-slate-800">
              <span className="text-slate-400">Institution:</span>
              <span className="text-slate-200 font-sans font-semibold">SSGMCE Shegaon</span>
            </div>
            <div className="flex justify-between pb-2 border-b border-slate-800">
              <span className="text-slate-400">Voter:</span>
              <span className="text-indigo-400 font-sans font-bold">{voterProfile?.name}</span>
            </div>
            <div className="flex justify-between pb-2 border-b border-slate-800">
              <span className="text-slate-400">Voter ID:</span>
              <span className="text-slate-200">{voterProfile?.voterId}</span>
            </div>
            <div className="flex justify-between pb-2 border-b border-slate-800">
              <span className="text-slate-400">Voted Candidate:</span>
              <span className="text-emerald-400 font-sans font-bold">{txReceipt?.candidateName}</span>
            </div>
            <div className="flex justify-between pb-2 border-b border-slate-800">
              <span className="text-slate-400">Block Number:</span>
              <span className="text-indigo-300 font-bold">#{txReceipt?.blockNumber}</span>
            </div>
            <div>
              <span className="text-slate-400 block mb-1">Transaction Hash:</span>
              <span className="text-[11px] text-slate-300 break-all bg-black/40 p-2 rounded block border border-slate-800">
                {txReceipt?.txHash}
              </span>
            </div>
          </div>

          <div className="flex gap-3 justify-center">
            <button
              onClick={() => {
                setStep(1);
                setVoterProfile(null);
                setSelectedCandidate(null);
                setTxReceipt(null);
              }}
              className="bg-slate-800 hover:bg-slate-700 text-slate-200 px-5 py-2.5 rounded-xl text-xs font-semibold transition-all"
            >
              Return to Voting Station
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
