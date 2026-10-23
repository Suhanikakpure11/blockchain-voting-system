import React, { useState, useEffect, useCallback } from "react";
import { ethers } from "ethers";
import Header from "./components/Header";
import Footer from "./components/Footer";
import Dashboard from "./components/Dashboard";
import CastVote from "./components/CastVote";
import ResultsView from "./components/ResultsView";
import AuditLedgerView from "./components/AuditLedgerView";
import HelpView from "./components/HelpView";
import AdminView from "./components/AdminView";
import { getBlockchainContext, HARDHAT_DEFAULT_ACCOUNTS } from "./utils/blockchain";

export default function App() {
  const [activeTab, setActiveTab] = useState("dashboard"); // 'dashboard', 'cast-vote', 'results', 'past-ballots', 'help', 'admin'
  const [account, setAccount] = useState("");
  const [balance, setBalance] = useState("0");
  const [selectedPreset, setSelectedPreset] = useState(HARDHAT_DEFAULT_ACCOUNTS[1]); // Default to Voter 1 (Shravani Raut)
  const [contract, setContract] = useState(null);
  const [signer, setSigner] = useState(null);
  const [electionInfo, setElectionInfo] = useState(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Fetch election state and candidates from backend
  const fetchElectionData = useCallback(async () => {
    setIsRefreshing(true);
    try {
      const res = await fetch("/api/election");
      const data = await res.json();
      setElectionInfo(data);
    } catch (err) {
      console.warn("Could not fetch election info:", err.message);
    } finally {
      setIsRefreshing(false);
    }
  }, []);

  // Initialize blockchain connection & contract instance
  const initBlockchain = useCallback(async () => {
    try {
      const ctx = await getBlockchainContext(selectedPreset);
      setAccount(ctx.address || "");
      setBalance(ctx.balanceEth || "0");
      setSigner(ctx.signer);

      // Fetch contract deployment artifact
      let deployment = null;
      try {
        const depRes = await fetch("/contract-deployment.json");
        if (depRes.ok) deployment = await depRes.json();
      } catch (e) {
        // fallback
      }

      if (deployment && deployment.contractAddress && ctx.signer) {
        const contractInstance = new ethers.Contract(
          deployment.contractAddress,
          deployment.abi,
          ctx.signer
        );
        setContract(contractInstance);
      }
    } catch (err) {
      console.warn("Blockchain init warning:", err.message);
    }
  }, [selectedPreset]);

  // Connect MetaMask
  const connectMetaMask = async () => {
    if (!window.ethereum) {
      alert("MetaMask extension not found. You can switch to any of the pre-funded test accounts in the profile dropdown!");
      return;
    }
    try {
      setSelectedPreset(null);
      await window.ethereum.request({ method: "eth_requestAccounts" });
      await initBlockchain();
    } catch (err) {
      console.error("MetaMask connection failed:", err);
      alert("MetaMask connection error: " + err.message);
    }
  };

  useEffect(() => {
    fetchElectionData();
    const interval = setInterval(fetchElectionData, 10000);
    return () => clearInterval(interval);
  }, [fetchElectionData]);

  useEffect(() => {
    initBlockchain();
  }, [initBlockchain]);

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-900 flex flex-col justify-between selection:bg-indigo-500 selection:text-white">
      <div>
        <Header
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          account={account}
          balance={balance}
          selectedPreset={selectedPreset}
          setSelectedPreset={setSelectedPreset}
          connectMetaMask={connectMetaMask}
          electionInfo={electionInfo}
        />

        <main className="pb-12">
          {activeTab === "dashboard" && (
            <Dashboard
              setActiveTab={setActiveTab}
              selectedPreset={selectedPreset}
              account={account}
              electionInfo={electionInfo}
            />
          )}

          {activeTab === "cast-vote" && (
            <CastVote
              setActiveTab={setActiveTab}
              contract={contract}
              signer={signer}
              account={account}
              selectedPreset={selectedPreset}
              electionInfo={electionInfo}
              refreshElectionData={fetchElectionData}
            />
          )}

          {activeTab === "results" && (
            <ResultsView
              electionInfo={electionInfo}
              refreshElectionData={fetchElectionData}
              isRefreshing={isRefreshing}
            />
          )}

          {activeTab === "past-ballots" && (
            <AuditLedgerView contract={contract} electionInfo={electionInfo} />
          )}

          {activeTab === "help" && (
            <HelpView contract={contract} electionInfo={electionInfo} />
          )}

          {activeTab === "admin" && (
            <AdminView
              contract={contract}
              signer={signer}
              electionInfo={electionInfo}
              refreshElectionData={fetchElectionData}
            />
          )}
        </main>
      </div>

      <Footer setActiveTab={setActiveTab} />
    </div>
  );
}
