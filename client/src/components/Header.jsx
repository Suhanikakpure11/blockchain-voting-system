import React, { useState } from "react";
import { Vote, Bell, CheckCircle2, ChevronDown, Wallet, ExternalLink, Shield, LogOut } from "lucide-react";
import { HARDHAT_DEFAULT_ACCOUNTS } from "../utils/blockchain";

export default function Header({
  activeTab,
  setActiveTab,
  account,
  balance,
  selectedPreset,
  setSelectedPreset,
  connectMetaMask,
  electionInfo,
}) {
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);

  // Current user display name & ID
  const currentUserName = selectedPreset ? selectedPreset.name : account ? `${account.substring(0, 6)}...${account.substring(account.length - 4)}` : "Guest Voter";
  const currentVoterId = selectedPreset ? selectedPreset.voterId : "VOT-GUEST";

  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-50 shadow-[0_1px_3px_0_rgba(0,0,0,0.03)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20 gap-4">
          
          {/* Left Brand & Live Pill */}
          <div className="flex items-center space-x-3">
            <div
              onClick={() => setActiveTab("dashboard")}
              className="flex items-center space-x-3 cursor-pointer group"
            >
              <div className="h-10 w-10 rounded-xl bg-indigo-600 flex items-center justify-center text-white shadow-md shadow-indigo-600/20 group-hover:bg-indigo-700 transition-colors">
                <Vote className="h-5 w-5" />
              </div>
              <div>
                <div className="text-lg font-extrabold text-slate-900 tracking-tight leading-tight">
                  DecentraVote
                </div>
                <div className="text-[11px] font-medium text-slate-400 -mt-0.5">
                  Campus & Civic Portal
                </div>
              </div>
            </div>

            {/* Voting Open Status Pill */}
            <div className="hidden sm:flex items-center space-x-1.5 bg-emerald-50 text-emerald-700 border border-emerald-200/80 px-3 py-1 rounded-full text-xs font-semibold">
              <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></span>
              <span>{electionInfo?.state === "Active" ? "Voting Open" : electionInfo?.state || "Voting Open"}</span>
            </div>
          </div>

          {/* Center Navigation Tabs */}
          <nav className="hidden md:flex items-center space-x-1">
            <button
              onClick={() => setActiveTab("dashboard")}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                activeTab === "dashboard"
                  ? "bg-indigo-600 text-white shadow-sm"
                  : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
              }`}
            >
              Dashboard
            </button>

            <button
              onClick={() => setActiveTab("cast-vote")}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                activeTab === "cast-vote"
                  ? "bg-indigo-600 text-white shadow-sm"
                  : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
              }`}
            >
              Cast Vote
            </button>

            <button
              onClick={() => setActiveTab("results")}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                activeTab === "results"
                  ? "bg-indigo-600 text-white shadow-sm"
                  : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
              }`}
            >
              Results
            </button>

            <button
              onClick={() => setActiveTab("past-ballots")}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                activeTab === "past-ballots"
                  ? "bg-indigo-600 text-white shadow-sm"
                  : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
              }`}
            >
              Past Ballots
            </button>

            <button
              onClick={() => setActiveTab("help")}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                activeTab === "help"
                  ? "bg-indigo-600 text-white shadow-sm"
                  : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
              }`}
            >
              Help & Verification
            </button>

            <button
              onClick={() => setActiveTab("admin")}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                activeTab === "admin"
                  ? "bg-indigo-600 text-white shadow-sm"
                  : "text-slate-500 hover:text-indigo-600 hover:bg-indigo-50/60"
              }`}
            >
              Admin Desk
            </button>
          </nav>

          {/* Right Section: Bell + User Pill */}
          <div className="flex items-center space-x-3">
            {/* Notification Bell */}
            <button
              onClick={() => alert("No unread alerts. Smart contract consensus is normal.")}
              className="h-10 w-10 rounded-full flex items-center justify-center text-slate-500 hover:text-slate-700 hover:bg-slate-100 transition-colors border border-transparent hover:border-slate-200"
              title="Notifications"
            >
              <Bell className="h-4 w-4" />
            </button>

            {/* User Profile Pill with Dropdown */}
            <div className="relative">
              <button
                onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                className="flex items-center space-x-2.5 bg-slate-50 hover:bg-slate-100 border border-slate-200/90 rounded-full py-1.5 pl-1.5 pr-3 transition-all"
              >
                <div className="h-8 w-8 rounded-full bg-indigo-100 border border-indigo-200 flex items-center justify-center text-indigo-700 font-bold text-xs overflow-hidden">
                  <img
                    src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80"
                    alt="User Avatar"
                    className="h-full w-full object-cover"
                  />
                </div>
                <div className="text-left">
                  <div className="text-xs font-bold text-slate-900 leading-tight">
                    {currentUserName}
                  </div>
                  <div className="text-[10px] font-semibold text-indigo-600 leading-none">
                    Verified Voter
                  </div>
                </div>
                <ChevronDown className="h-3.5 w-3.5 text-slate-400 ml-1" />
              </button>

              {/* Profile / Account Switcher Dropdown */}
              {profileDropdownOpen && (
                <div className="absolute right-0 mt-2 w-72 bg-white rounded-2xl shadow-xl border border-slate-200 p-2 z-50 animate-in fade-in zoom-in-95 duration-100">
                  <div className="px-3 py-2 border-b border-slate-100">
                    <div className="text-xs font-bold text-slate-900">{currentUserName}</div>
                    <div className="text-[11px] text-slate-500 font-mono">ID: #{currentVoterId}</div>
                    <div className="text-[11px] text-indigo-600 font-mono mt-0.5 truncate">
                      {account ? `${account.substring(0, 10)}...${account.substring(account.length - 8)}` : "Wallet Not Connected"}
                    </div>
                  </div>

                  <div className="py-2">
                    <div className="px-3 py-1 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                      Switch Student Profile / Signer
                    </div>
                    {HARDHAT_DEFAULT_ACCOUNTS.map((acc, idx) => (
                      <button
                        key={idx}
                        onClick={() => {
                          setSelectedPreset(acc);
                          setProfileDropdownOpen(false);
                        }}
                        className={`w-full text-left px-3 py-2 rounded-xl text-xs flex items-center justify-between transition-colors ${
                          selectedPreset?.address.toLowerCase() === acc.address.toLowerCase()
                            ? "bg-indigo-50 text-indigo-900 font-bold"
                            : "text-slate-700 hover:bg-slate-50"
                        }`}
                      >
                        <div>
                          <div>{acc.name}</div>
                          <div className="text-[10px] text-slate-400 font-mono">{acc.voterId} • {acc.role}</div>
                        </div>
                        {selectedPreset?.address.toLowerCase() === acc.address.toLowerCase() && (
                          <CheckCircle2 className="h-4 w-4 text-indigo-600" />
                        )}
                      </button>
                    ))}
                  </div>

                  <div className="pt-2 border-t border-slate-100">
                    <button
                      onClick={() => {
                        connectMetaMask();
                        setProfileDropdownOpen(false);
                      }}
                      className="w-full text-left px-3 py-2 rounded-xl text-xs font-semibold text-slate-700 hover:bg-slate-50 flex items-center gap-2"
                    >
                      <Wallet className="h-4 w-4 text-amber-500" />
                      <span>Connect External MetaMask</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Mobile Navigation Row */}
        <div className="flex md:hidden overflow-x-auto space-x-2 py-2 border-t border-slate-100 text-xs">
          {["dashboard", "cast-vote", "results", "past-ballots", "help", "admin"].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-3 py-1.5 rounded-lg font-semibold shrink-0 capitalize ${
                activeTab === tab ? "bg-indigo-600 text-white" : "text-slate-600 hover:bg-slate-100"
              }`}
            >
              {tab.replace("-", " ")}
            </button>
          ))}
        </div>
      </div>
    </header>
  );
}
