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

export default function AdminView({ contract, signer, electionInfo, refreshElectionData }) {
  const [activeAdminTab, setActiveAdminTab] = useState("voters"); // 'voters', 'candidates'
  const [votersList, setVotersList] = useState([]);
  const [isLoadingVoters, setIsLoadingVoters] = useState(false);
  const [statusMessage, setStatusMessage] = useState({ type: "", text: "" });

  // Voter Form
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

  // Candidate Form
  const [candidateForm, setCandidateForm] = useState({
    name: "",
    party: "",
    symbolUrl: "",
    manifesto: "",
  });

  // Camera for enrollment
  const [enrollCamActive, setEnrollCamActive] = useState(false);
  const [faceExtracting, setFaceExtracting] = useState(false);
  const videoRef = useRef(null);
  const streamRef = useRef(null);

  useEffect(() => {
    fetchVoters();
    loadFaceModels();
    return () => stopCam();
  }, []);

  const fetchVoters = async () => {
    setIsLoadingVoters(true);
    try {
      const res = await fetch("/api/voters");
      const data = await res.json();
      setVotersList(Array.isArray(data) ? data : []);
    } catch (e) {
      console.error(e);
      setVotersList([]);
    } finally {
      setIsLoadingVoters(false);
    }
  };

  const startCam = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { width: 480, height: 360 } });
      streamRef.current = stream;
      if (videoRef.current) videoRef.current.srcObject = stream;
      setEnrollCamActive(true);
    } catch (e) {
      setStatusMessage({ type: "error", text: "Camera error: " + e.message });
    }
  };

  const stopCam = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
    setEnrollCamActive(false);
  };

  const captureFace = async () => {
    if (!videoRef.current) return;
    setFaceExtracting(true);
    try {
      const res = await extractFaceDescriptor(videoRef.current);
      if (!res.detected) throw new Error(res.error || "No face detected");

      setVoterForm((prev) => ({
        ...prev,
        faceDescriptor: res.descriptor,
        photoUrl: `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(voterForm.name || "voter")}`,
      }));

      setStatusMessage({ type: "success", text: "128-dimensional biometric facial embedding extracted!" });
      stopCam();
    } catch (err) {
      setStatusMessage({ type: "error", text: err.message });
    } finally {
      setFaceExtracting(false);
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    if (!voterForm.voterId || !voterForm.name || !voterForm.walletAddress) {
      setStatusMessage({ type: "error", text: "Please enter Voter ID, Name, and Wallet Address." });
      return;
    }

    try {
      setStatusMessage({ type: "info", text: "Registering voter on server and smart contract..." });
      const res = await fetch("/api/voters/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(voterForm),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Registration failed");

      setStatusMessage({ type: "success", text: `Voter ${voterForm.name} enrolled and authorized on-chain!` });
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
      fetchVoters();
      refreshElectionData();
    } catch (err) {
      setStatusMessage({ type: "error", text: err.message });
    }
  };

  const handleAddCandidate = async (e) => {
    e.preventDefault();
    if (!candidateForm.name || !candidateForm.party) {
      setStatusMessage({ type: "error", text: "Name and Party are required." });
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

      setStatusMessage({ type: "success", text: `Nominee ${candidateForm.name} deployed to blockchain!` });
      setCandidateForm({ name: "", party: "", symbolUrl: "", manifesto: "" });
      refreshElectionData();
    } catch (err) {
      setStatusMessage({ type: "error", text: err.message });
    }
  };

  const handleAction = async (act) => {
    try {
      setStatusMessage({ type: "info", text: `Broadcasting ${act} transaction...` });
      const ep = act === "start" ? "/api/admin/start-election" : act === "end" ? "/api/admin/end-election" : "/api/admin/reset-election";
      const res = await fetch(ep, { method: "POST" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || `Failed to ${act}`);

      setStatusMessage({ type: "success", text: `Election updated to: ${act.toUpperCase()}` });
      refreshElectionData();
    } catch (err) {
      setStatusMessage({ type: "error", text: err.message });
    }
  };

  const safeVoters = Array.isArray(votersList) ? votersList : [];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="bg-indigo-50 text-indigo-700 text-[11px] font-bold px-3 py-0.5 rounded-full border border-indigo-200">
              Election Administrator Console
            </span>
          </div>
          <h2 className="text-2xl font-extrabold text-slate-900 mt-1 tracking-tight">
            Campus Electoral Desk
          </h2>
          <p className="text-xs text-slate-500">
            Control election lifecycle, enroll biometric voters, and manage certified candidates on the smart contract.
          </p>
        </div>

        {/* Phase Buttons */}
        <div className="flex items-center space-x-2">
          <button
            onClick={() => handleAction("start")}
            className="bg-emerald-600 hover:bg-emerald-700 text-white px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-sm transition-all"
          >
            <Play className="h-3.5 w-3.5" /> Start Election
          </button>
          <button
            onClick={() => handleAction("end")}
            className="bg-rose-600 hover:bg-rose-700 text-white px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-sm transition-all"
          >
            <Square className="h-3.5 w-3.5" /> End Election
          </button>
          <button
            onClick={() => handleAction("reset")}
            className="bg-slate-100 hover:bg-slate-200 text-slate-700 px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all"
          >
            <RotateCcw className="h-3.5 w-3.5" /> Reset Demo
          </button>
        </div>
      </div>

      {/* Alert banner */}
      {statusMessage.text && (
        <div
          className={`p-4 rounded-2xl border text-xs font-medium flex items-center justify-between ${
            statusMessage.type === "success"
              ? "bg-emerald-50 border-emerald-200 text-emerald-800"
              : statusMessage.type === "error"
              ? "bg-rose-50 border-rose-200 text-rose-800"
              : "bg-indigo-50 border-indigo-200 text-indigo-800"
          }`}
        >
          <span>{statusMessage.text}</span>
          <button onClick={() => setStatusMessage({ type: "", text: "" })} className="text-slate-400 hover:text-slate-700 font-bold">
            ✕
          </button>
        </div>
      )}

      {/* Navigation Subtabs */}
      <div className="flex space-x-2 border-b border-slate-200 pb-3">
        <button
          onClick={() => setActiveAdminTab("voters")}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
            activeAdminTab === "voters"
              ? "bg-indigo-600 text-white shadow-sm"
              : "text-slate-600 hover:bg-slate-100"
          }`}
        >
          <UserPlus className="h-3.5 w-3.5" /> Voter Enrollment ({safeVoters.length})
        </button>
        <button
          onClick={() => setActiveAdminTab("candidates")}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
            activeAdminTab === "candidates"
              ? "bg-indigo-600 text-white shadow-sm"
              : "text-slate-600 hover:bg-slate-100"
          }`}
        >
          <PlusCircle className="h-3.5 w-3.5" /> Nominee Registration
        </button>
      </div>

      {/* Voters Enrollment Section */}
      {activeAdminTab === "voters" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Enrollment Form */}
          <div className="lg:col-span-1 decentra-card rounded-3xl p-6 shadow-sm space-y-4">
            <h3 className="text-sm font-extrabold text-slate-900 flex items-center gap-2">
              <Fingerprint className="h-4 w-4 text-indigo-600" />
              Enroll Eligible Student Voter
            </h3>

            <form onSubmit={handleRegister} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-600 font-bold mb-1">Voter ID *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. VOTER-45"
                  value={voterForm.voterId}
                  onChange={(e) => setVoterForm({ ...voterForm, voterId: e.target.value.toUpperCase() })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 font-mono text-xs focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-slate-600 font-bold mb-1">Full Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Rahul Sharma"
                  value={voterForm.name}
                  onChange={(e) => setVoterForm({ ...voterForm, name: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 text-xs focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-slate-600 font-bold mb-1">Roll Number</label>
                <input
                  type="text"
                  placeholder="e.g. 45"
                  value={voterForm.rollNo}
                  onChange={(e) => setVoterForm({ ...voterForm, rollNo: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 text-xs focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-slate-600 font-bold mb-1">Ethereum Wallet Address *</label>
                <input
                  type="text"
                  required
                  placeholder="0x..."
                  value={voterForm.walletAddress}
                  onChange={(e) => setVoterForm({ ...voterForm, walletAddress: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 font-mono text-[11px] focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              {/* Biometrics */}
              <div className="pt-2 border-t border-slate-100 space-y-2">
                <label className="block text-slate-800 font-bold">Biometric Facial Embedding</label>
                {enrollCamActive ? (
                  <div className="space-y-2">
                    <video ref={videoRef} autoPlay playsInline muted className="w-full rounded-2xl bg-black aspect-[4/3] object-cover" />
                    <button
                      type="button"
                      onClick={captureFace}
                      disabled={faceExtracting}
                      className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2 rounded-xl text-xs flex items-center justify-center gap-1.5"
                    >
                      {faceExtracting ? <RefreshCw className="h-4 w-4 animate-spin" /> : "Extract 128-d Biometrics"}
                    </button>
                  </div>
                ) : (
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={startCam}
                      className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 py-2 rounded-xl font-bold flex items-center justify-center gap-1.5"
                    >
                      <Camera className="h-3.5 w-3.5 text-indigo-600" /> Open WebCam
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        const mockVec = Array.from({ length: 128 }, () => Number(((Math.random() - 0.5) * 0.1).toFixed(6)));
                        setVoterForm({ ...voterForm, faceDescriptor: mockVec });
                        setStatusMessage({ type: "success", text: "Biometric vector generated!" });
                      }}
                      className="bg-slate-100 hover:bg-slate-200 text-slate-700 px-3 py-2 rounded-xl font-mono text-[11px]"
                    >
                      Auto-Vector
                    </button>
                  </div>
                )}

                {voterForm.faceDescriptor && (
                  <div className="text-emerald-700 text-[10px] font-mono flex items-center gap-1">
                    <CheckCircle2 className="h-3 w-3 text-emerald-600" /> Biometric Vector attached (128 floats)
                  </div>
                )}
              </div>

              <button
                type="submit"
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 rounded-2xl shadow-md shadow-indigo-600/20 text-xs transition-all mt-2"
              >
                Enroll Voter On Blockchain
              </button>
            </form>
          </div>

          {/* Table */}
          <div className="lg:col-span-2 decentra-card rounded-3xl p-6 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-extrabold text-slate-900 flex items-center gap-2">
                <Users className="h-4 w-4 text-indigo-600" />
                Authorized Enrolled Voters Roster
              </h3>
              <button onClick={fetchVoters} className="text-xs text-indigo-600 hover:underline flex items-center gap-1 font-bold">
                <RefreshCw className="h-3 w-3" /> Refresh
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-200 text-slate-400 font-bold uppercase text-[10px] tracking-wider">
                    <th className="pb-3">Voter ID</th>
                    <th className="pb-3">Student Name</th>
                    <th className="pb-3">Wallet</th>
                    <th className="pb-3">Biometrics</th>
                    <th className="pb-3">Ballot Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-mono">
                  {safeVoters.map((v) => (
                    <tr key={v.voterId} className="hover:bg-slate-50">
                      <td className="py-3 font-bold text-indigo-700">{v.voterId}</td>
                      <td className="py-3 font-sans font-bold text-slate-800">{v.name}</td>
                      <td className="py-3 text-slate-400 text-[11px]">
                        {v.walletAddress
                          ? `${v.walletAddress.substring(0, 6)}...${v.walletAddress.substring(v.walletAddress.length - 4)}`
                          : "No Wallet"}
                      </td>
                      <td className="py-3 font-sans">
                        <span className="bg-emerald-50 text-emerald-700 text-[10px] font-bold px-2 py-0.5 rounded-full border border-emerald-200">
                          Active
                        </span>
                      </td>
                      <td className="py-3 font-sans">
                        {v.onChain?.hasVoted ? (
                          <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded-full">
                            Voted (# {v.onChain.votedCandidateId})
                          </span>
                        ) : (
                          <span className="bg-slate-100 text-slate-600 text-[10px] font-semibold px-2 py-0.5 rounded-full">
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

      {/* Candidate Add Section */}
      {activeAdminTab === "candidates" && (
        <div className="decentra-card rounded-3xl p-6 sm:p-7 max-w-xl mx-auto shadow-sm space-y-4">
          <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
            <PlusCircle className="h-5 w-5 text-indigo-600" />
            Add Certified Nominee to Ballot
          </h3>

          <form onSubmit={handleAddCandidate} className="space-y-4 text-xs">
            <div>
              <label className="block text-slate-600 font-bold mb-1">Nominee Full Name *</label>
              <input
                type="text"
                required
                placeholder="e.g. Dr. Elena Rostova"
                value={candidateForm.name}
                onChange={(e) => setCandidateForm({ ...candidateForm, name: e.target.value })}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-slate-900 text-xs focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="block text-slate-600 font-bold mb-1">Affiliation / Party *</label>
              <input
                type="text"
                required
                placeholder="e.g. Digital Rights & Privacy"
                value={candidateForm.party}
                onChange={(e) => setCandidateForm({ ...candidateForm, party: e.target.value })}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-slate-900 text-xs focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="block text-slate-600 font-bold mb-1">Photo / Avatar Image URL</label>
              <input
                type="text"
                placeholder="https://... (or leave blank for auto robot avatar)"
                value={candidateForm.symbolUrl}
                onChange={(e) => setCandidateForm({ ...candidateForm, symbolUrl: e.target.value })}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-slate-900 font-mono text-xs focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="block text-slate-600 font-bold mb-1">Platform Proposals</label>
              <textarea
                rows={3}
                placeholder="Key proposals separated by line breaks..."
                value={candidateForm.manifesto}
                onChange={(e) => setCandidateForm({ ...candidateForm, manifesto: e.target.value })}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-slate-900 text-xs focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <button
              type="submit"
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3.5 rounded-2xl shadow-md shadow-indigo-600/20 text-xs transition-all"
            >
              Deploy Nominee to Smart Contract
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
