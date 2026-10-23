import React, { useState } from "react";
import { X, Send, MessageSquare, Bot, User, ShieldCheck } from "lucide-react";

export default function LiveChatDrawer({ isOpen, onClose }) {
  const [messages, setMessages] = useState([
    {
      sender: "bot",
      text: "Hello! I am the DecentraVote Campus Support Assistant. How can I help you with your ballot today?",
      time: "Just now",
    },
  ]);
  const [input, setInput] = useState("");

  if (!isOpen) return null;

  const handleSend = (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userText = input.trim();
    const newMessages = [...messages, { sender: "user", text: userText, time: "Just now" }];
    setMessages(newMessages);
    setInput("");

    // Automated smart answer
    setTimeout(() => {
      let reply = "Support is active! Please ensure your webcam is enabled and positioned directly facing good lighting. Once verified, you can select your candidate and submit your cryptographic ballot.";
      const lower = userText.toLowerCase();

      if (lower.includes("face") || lower.includes("camera") || lower.includes("biometric")) {
        reply = "Face verification checks your live camera stream against registered student landmarks using 128-d vectors. No video is ever stored. If camera access is blocked, you can use the 'Simulate Match' demo button.";
      } else if (lower.includes("anonymous") || lower.includes("privacy")) {
        reply = "Yes! DecentraVote uses ZK principles to decouple your voter identity token from the candidate ballot recorded on the blockchain.";
      } else if (lower.includes("twice") || lower.includes("duplicate") || lower.includes("again")) {
        reply = "Duplicate voting is strictly prohibited. The Solidity smart contract will reject any second voting transaction attempt.";
      } else if (lower.includes("receipt") || lower.includes("verify")) {
        reply = "After voting, you receive a cryptographic transaction hash and block number. You can check it anytime on the 'Past Ballots' tab.";
      }

      setMessages((prev) => [...prev, { sender: "bot", text: reply, time: "Just now" }]);
    }, 600);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-sm flex justify-end animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-md h-full shadow-2xl flex flex-col justify-between border-l border-slate-200 animate-in slide-in-from-right duration-300">
        
        {/* Header */}
        <div className="p-5 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <div className="flex items-center space-x-3">
            <div className="h-9 w-9 bg-emerald-100 text-emerald-700 rounded-xl flex items-center justify-center font-bold">
              <Bot className="h-5 w-5" />
            </div>
            <div>
              <div className="text-sm font-extrabold text-slate-900 flex items-center gap-2">
                <span>Voter Support Live Chat</span>
                <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></span>
              </div>
              <div className="text-[11px] text-slate-400">Campus Ombudsperson Team • Online</div>
            </div>
          </div>

          <button
            onClick={onClose}
            className="h-8 w-8 rounded-full bg-white hover:bg-slate-200 text-slate-500 flex items-center justify-center transition-colors border border-slate-200"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Message Log */}
        <div className="flex-1 p-5 overflow-y-auto space-y-3.5 text-xs">
          {messages.map((m, idx) => (
            <div
              key={idx}
              className={`flex flex-col ${m.sender === "user" ? "items-end" : "items-start"}`}
            >
              <div
                className={`max-w-[85%] p-3.5 rounded-2xl leading-relaxed ${
                  m.sender === "user"
                    ? "bg-indigo-600 text-white rounded-br-none shadow-sm"
                    : "bg-slate-100 text-slate-800 rounded-bl-none border border-slate-200/60"
                }`}
              >
                {m.text}
              </div>
              <span className="text-[10px] text-slate-400 mt-1 px-1">{m.time}</span>
            </div>
          ))}
        </div>

        {/* Suggested Quick Prompts */}
        <div className="px-4 py-2 border-t border-slate-100 flex gap-2 overflow-x-auto text-[11px]">
          {["How does face check work?", "Is my vote anonymous?", "Can I vote twice?"].map((q, i) => (
            <button
              key={i}
              onClick={() => setInput(q)}
              className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg shrink-0 transition-colors"
            >
              {q}
            </button>
          ))}
        </div>

        {/* Input Bar */}
        <form onSubmit={handleSend} className="p-4 border-t border-slate-200 bg-white flex gap-2">
          <input
            type="text"
            placeholder="Type your voter question..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            className="flex-1 bg-slate-50 border border-slate-200 rounded-2xl px-4 py-2.5 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
          <button
            type="submit"
            className="h-10 w-10 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl flex items-center justify-center shrink-0 shadow-sm"
          >
            <Send className="h-4 w-4" />
          </button>
        </form>

      </div>
    </div>
  );
}
