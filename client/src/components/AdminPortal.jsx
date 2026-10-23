import React, { useState, useEffect, useRef } from "react";
import {
  ShieldAlert,
  UserPlus,
  Play,
  Square,
  RotateCcw,
  Camera,
  CheckCircle2,
  RefreshCw,
  PlusCircle,
  Users,
  Fingerprint,
} from "lucide-react";
import { extractFaceDescriptor, loadFaceModels } from "../utils/faceMatcher";

export default function AdminPortal({ contract, signer, userAddress, electionInfo, refreshElectionData }) {
  const [activeAdminTab, setActiveAdminTab] = useState("voters"); // 'voters', 'candidates', 'controls'
  const [votersList, setVotersList] = useState([]);
  const [isLoadingVoters, setIsLoadingVoters] = useState(false);
  const [statusMessage, setStatusMessage] = useState({ type: "", text: "" });

  // New Voter Form state
  const [voterForm, setVoterForm] = useState({
    voterId: "",
    name: "",
    rollNo: "",
    department: "Computer Science & Engineering",
    walletAddress: "",
    email: "",
    photoUrl: "",
    faceDescriptor: null,
  });

  // Candidate Form state
  const [candidateForm, setCandidateForm] = useState({
    name: "",
    party: "",
    symbolUrl: "",
    manifesto: "",
  });

  // Webcam for voter enrollment
  const [enrollCamActive, setEnrollCamActive] = useState(false);
  const [faceExtracting, setFaceExtracting] = useState(false);
  const enrollVideoRef = useRef(null);
  const enrollStreamRef = useRef(null);

  useEffect(() => {
    fetchVotersList();
    loadFaceModels();
    return () => stopEnrollCam();
  }, []);

  const fetchVotersList = async () => {
    setIsLoadingVoters(true);
    try {
      const res = await fetch("/api/voters");
      const data = await res.json();
      setVotersList(data);
    } catch (e) {
      console.error("Failed to load voters:", e);
    } finally {
      setIsLoadingVoters(false);
    }
  };

  const startEnrollCam = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { width: 480, height: 360 } });
      enrollStreamRef.current = stream;
      if (enrollVideoRef.current) enrollVideoRef.current.srcObject = stream;
      setEnrollCamActive(true);
    } catch (err) {
      setStatusMessage({ type: "error", text: "Camera access failed: " + err.message });
    }
  };

  const stopEnrollCam = () => {
    if (enrollStreamRef.current) {
      enrollStreamRef.current.getTracks().forEach((t) => t.stop());
      enrollStreamRef.current = null;
    }
    setEnrollCamActive(false);
  };

  // Capture photo & extract 128-d descriptor
  const captureAndExtractFace = async () => {
    if (!enrollVideoRef.current) return;
    setFaceExtracting(true);
    try {
      const result = await extractFaceDescriptor(enrollVideoRef.current);
      if (!result.detected) {
        throw new Error(result.error || "No face detected in camera");
      }

      setVoterForm((prev) => ({
        ...prev,
        faceDescriptor: result.descriptor,
        photoUrl: `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(voterForm.name || "voter")}`,
      }));

      setStatusMessage({
        type: "success",
        text: "128-dimensional biometric facial embedding extracted successfully!",
      });
      stopEnrollCam();
    } catch (err) {
      setStatusMessage({ type: "error", text: err.message });
    } finally {
      setFaceExtracting(false);
    }
  };

  // Submit Voter Registration
  const handleRegisterVoter = async (e) => {
    e.preventDefault();
    if (!voterForm.voterId || !voterForm.name || !voterForm.walletAddress) {
      setStatusMessage({ type: "error", text: "Please fill Voter ID, Name, and Wallet Address." });
      return;
    }

    setStatusMessage({ type: "info", text: "Registering voter on server and Ethereum blockchain..." });

    try {
      const res = await fetch("/api/voters/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(voterForm),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Registration failed");

      setStatusMessage({
        type: "success",
        text: `Voter ${voterForm.name} (${voterForm.voterId}) registered on-chain successfully!`,
      });

      setVoterForm({
        voterId: "",
        name: "",
        rollNo: "",
        department: "Computer Science & Engineering",
        walletAddress: "",
        email: "",
        photoUrl: "",
        faceDescriptor: null,
      });

      fetchVotersList();
      refreshElectionData();
    } catch (err) {
      setStatusMessage({ type: "error", text: err.message });
    }
  };

  // Add Candidate
  const handleAddCandidate = async (e) => {
    e.preventDefault();
    if (!candidateForm.name || !candidateForm.party) {
      setStatusMessage({ type: "error", text: "Candidate name and party required." });
      return;
    }

    try {
      setStatusMessage({ type: "info", text: "Adding candidate to Ethereum smart contract..." });
      const res = await fetch("/api/admin/add-candidate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(candidateForm),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to add candidate");

      setStatusMessage({ type: "success", text: `Candidate ${candidateForm.name} added to smart contract!` });
      setCandidateForm({ name: "", party: "", symbolUrl: "", manifesto: "" });
      refreshElectionData();
    } catch (err) {
      setStatusMessage({ type: "error", text: err.message });
    }
  };

  // Election Lifecycle
  const handleElectionAction = async (action) => {
    try {
      setStatusMessage({ type: "info", text: `Submitting ${action} transaction to blockchain...` });
      const endpoint =
        action === "start"
          ? "/api/admin/start-election"
          : action === "end"
          ? "/api/admin/end-election"
          : "/api/admin/reset-election";

      const res = await fetch(endpoint, { method: "POST" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || `Failed to ${action} election`);

      setStatusMessage({ type: "success", text: `Election status updated: ${action.toUpperCase()}` });
      refreshElectionData();
    } catch (err) {
      setStatusMessage({ type: "error", text: err.message });
    }
  };

  return (
    <div className="max-w-5xl mx-auto py-6 px-4 space-y-6">
      {/* Title */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 text-[10px] font-bold px-2 py-0.5 rounded-full">
              Election Administrator Console
            </span>
          </div>
          <h2 className="text-2xl font-bold text-white mt-1">Admin Management Desk</h2>
          <p className="text-xs text-slate-400">
            Control election lifecycle, register biometric voters, and manage official candidates on the smart contract.
          </p>
        </div>

        {/* Phase Action Buttons */}
        <div className="flex items-center space-x-2">
          <button
            onClick={() => handleElectionAction("start")}
            className="bg-emerald-600 hover:bg-emerald-500 text-white px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-md shadow-emerald-600/30 transition-all"
          >
            <Play className="h-3.5 w-3.5" /> Start Election
          </button>
          <button
            onClick={() => handleElectionAction("end")}
            className="bg-rose-600 hover:bg-rose-500 text-white px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-md shadow-rose-600/30 transition-all"
          >
            <Square className="h-3.5 w-3.5" /> End Election
          </button>
          <button
            onClick={() => handleElectionAction("reset")}
            className="bg-slate-800 hover:bg-slate-700 text-slate-300 px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all"
          >
            <RotateCcw className="h-3.5 w-3.5" /> Reset Demo
          </button>
        </div>
      </div>

      {/* Status Alert Banner */}
      {statusMessage.text && (
        <div
          className={`p-4 rounded-xl border text-xs font-medium flex items-center justify-between ${
            statusMessage.type === "success"
              ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-300"
              : statusMessage.type === "error"
              ? "bg-rose-500/10 border-rose-500/30 text-rose-300"
              : "bg-indigo-500/10 border-indigo-500/30 text-indigo-300"
          }`}
        >
          <span>{statusMessage.text}</span>
          <button onClick={() => setStatusMessage({ type: "", text: "" })} className="text-slate-400 hover:text-white">
            ×
          </button>
        </div>
      )}

      {/* Inner Subtabs */}
      <div className="flex space-x-2 border-b border-slate-800 pb-3">
        <button
          onClick={() => setActiveAdminTab("voters")}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
            activeAdminTab === "voters"
              ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/30"
              : "text-slate-400 hover:text-slate-200 bg-slate-900"
          }`}
        >
          <UserPlus className="h-3.5 w-3.5" /> Voter Enrollment ({votersList.length})
        </button>
        <button
          onClick={() => setActiveAdminTab("candidates")}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
            activeAdminTab === "candidates"
              ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/30"
              : "text-slate-400 hover:text-slate-200 bg-slate-900"
          }`}
        >
          <PlusCircle className="h-3.5 w-3.5" /> Candidate Registration
        </button>
      </div>

      {/* ---------------- TAB: VOTER REGISTRATION & LIST ---------------- */}
      {activeAdminTab === "voters" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Registration Form */}
          <div className="lg:col-span-1 glass-card rounded-2xl p-5 border border-slate-800 space-y-4">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Fingerprint className="h-4 w-4 text-indigo-400" />
              Enroll Eligible Voter
            </h3>

            <form onSubmit={handleRegisterVoter} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-400 font-semibold mb-1">Voter ID *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. VOTER-45"
                  value={voterForm.voterId}
                  onChange={(e) => setVoterForm({ ...voterForm, voterId: e.target.value.toUpperCase() })}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white font-mono"
                />
              </div>

              <div>
                <label className="block text-slate-400 font-semibold mb-1">Student Full Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Rahul Sharma"
                  value={voterForm.name}
                  onChange={(e) => setVoterForm({ ...voterForm, name: e.target.value })}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white"
                />
              </div>

              <div>
                <label className="block text-slate-400 font-semibold mb-1">Roll Number</label>
                <input
                  type="text"
                  placeholder="e.g. 45"
                  value={voterForm.rollNo}
                  onChange={(e) => setVoterForm({ ...voterForm, rollNo: e.target.value })}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white"
                />
              </div>

              <div>
                <label className="block text-slate-400 font-semibold mb-1">Ethereum Wallet Address *</label>
                <input
                  type="text"
                  required
                  placeholder="0x..."
                  value={voterForm.walletAddress}
                  onChange={(e) => setVoterForm({ ...voterForm, walletAddress: e.target.value })}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white font-mono text-[11px]"
                />
              </div>

              {/* Facial Biometrics Capture */}
              <div className="pt-2 border-t border-slate-800">
                <label className="block text-slate-300 font-bold mb-2">Biometric Facial Embedding</label>
                {enrollCamActive ? (
                  <div className="space-y-2">
                    <video ref={enrollVideoRef} autoPlay playsInline muted className="w-full rounded-xl bg-black" />
                    <button
                      type="button"
                      onClick={captureAndExtractFace}
                      disabled={faceExtracting}
                      className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-2 rounded-lg flex items-center justify-center gap-1.5"
                    >
                      {faceExtracting ? <RefreshCw className="h-4 w-4 animate-spin" /> : "Extract 128-d Biometrics"}
                    </button>
                  </div>
                ) : (
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={startEnrollCam}
                      className="flex-1 bg-slate-800 hover:bg-slate-700 text-indigo-400 border border-indigo-500/30 py-2 rounded-lg flex items-center justify-center gap-1.5 font-semibold"
                    >
                      <Camera className="h-3.5 w-3.5" /> Open Webcam
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        // Generate mock 128-d vector for instant manual enrollment
                        const mockVector = Array.from({ length: 128 }, () => (Math.random() - 0.5) * 0.1);
                        setVoterForm({ ...voterForm, faceDescriptor: mockVector });
                        setStatusMessage({ type: "success", text: "Biometric face vector generated!" });
                      }}
                      className="bg-slate-800 hover:bg-slate-700 text-slate-300 px-3 py-2 rounded-lg font-mono text-[11px]"
                    >
                      Auto-Vector
                    </button>
                  </div>
                )}

                {voterForm.faceDescriptor && (
                  <div className="mt-2 text-emerald-400 font-mono text-[10px] flex items-center gap-1">
                    <CheckCircle2 className="h-3 w-3" /> Biometric Face Descriptor attached (128 floats)
                  </div>
                )}
              </div>

              <button
                type="submit"
                className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-2.5 rounded-xl shadow-lg shadow-indigo-600/30 transition-all mt-3"
              >
                Register Voter On-Chain
              </button>
            </form>
          </div>

          {/* Registered Voters Table */}
          <div className="lg:col-span-2 glass-card rounded-2xl p-5 border border-slate-800 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Users className="h-4 w-4 text-cyan-400" />
                Enrolled Voters Roster
              </h3>
              <button
                onClick={fetchVotersList}
                className="text-xs text-indigo-400 hover:text-indigo-300 flex items-center gap-1"
              >
                <RefreshCw className="h-3 w-3" /> Refresh
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-800 text-slate-400">
                    <th className="pb-2">Voter ID</th>
                    <th className="pb-2">Student Name</th>
                    <th className="pb-2">Wallet</th>
                    <th className="pb-2">Biometrics</th>
                    <th className="pb-2">Vote Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 font-mono">
                  {votersList.map((v) => (
                    <tr key={v.voterId} className="hover:bg-slate-800/30">
                      <td className="py-2.5 font-bold text-indigo-400">{v.voterId}</td>
                      <td className="py-2.5 font-sans font-semibold text-white">{v.name}</td>
                      <td className="py-2.5 text-slate-400 text-[11px]">
                        {v.walletAddress.substring(0, 6)}...{v.walletAddress.substring(v.walletAddress.length - 4)}
                      </td>
                      <td className="py-2.5 font-sans">
                        <span className="bg-emerald-500/10 text-emerald-400 text-[10px] px-2 py-0.5 rounded-full border border-emerald-500/20">
                          Active
                        </span>
                      </td>
                      <td className="py-2.5 font-sans">
                        {v.onChain?.hasVoted ? (
                          <span className="bg-emerald-500/20 text-emerald-400 text-[10px] font-bold px-2 py-0.5 rounded-full">
                            Voted (# {v.onChain.votedCandidateId})
                          </span>
                        ) : (
                          <span className="bg-slate-800 text-slate-400 text-[10px] px-2 py-0.5 rounded-full">
                            Eligible
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ---------------- TAB: CANDIDATE REGISTRATION ---------------- */}
      {activeAdminTab === "candidates" && (
        <div className="glass-card rounded-2xl p-6 border border-slate-800 max-w-xl mx-auto">
          <h3 className="text-base font-bold text-white mb-4 flex items-center gap-2">
            <PlusCircle className="h-5 w-5 text-indigo-400" />
            Add Candidate to Ballot
          </h3>

          <form onSubmit={handleAddCandidate} className="space-y-4 text-xs">
            <div>
              <label className="block text-slate-400 font-semibold mb-1">Candidate Full Name *</label>
              <input
                type="text"
                required
                placeholder="e.g. Aarav Sharma"
                value={candidateForm.name}
                onChange={(e) => setCandidateForm({ ...candidateForm, name: e.target.value })}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-2.5 text-white"
              />
            </div>

            <div>
              <label className="block text-slate-400 font-semibold mb-1">Party / Student Group *</label>
              <input
                type="text"
                required
                placeholder="e.g. Tech Progressive Party"
                value={candidateForm.party}
                onChange={(e) => setCandidateForm({ ...candidateForm, party: e.target.value })}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-2.5 text-white"
              />
            </div>

            <div>
              <label className="block text-slate-400 font-semibold mb-1">Symbol / Avatar Image URL</label>
              <input
                type="text"
                placeholder="https://... (or leave blank for auto robot avatar)"
                value={candidateForm.symbolUrl}
                onChange={(e) => setCandidateForm({ ...candidateForm, symbolUrl: e.target.value })}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-2.5 text-white font-mono"
              />
            </div>

            <div>
              <label className="block text-slate-400 font-semibold mb-1">Manifesto / Platform</label>
              <textarea
                rows={3}
                placeholder="Key goals and student initiatives..."
                value={candidateForm.manifesto}
                onChange={(e) => setCandidateForm({ ...candidateForm, manifesto: e.target.value })}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-2.5 text-white"
              />
            </div>

            <button
              type="submit"
              className="w-full bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white font-bold py-3 rounded-xl shadow-lg shadow-indigo-600/30 transition-all text-sm"
            >
              Deploy Candidate to Smart Contract
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
