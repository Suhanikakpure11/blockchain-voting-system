# Decentralized Voting System Using Face Recognition and Blockchain

[![Deploy to Render](https://render.com/images/deploy-to-render-button.svg)](https://render.com/deploy?repo=https://github.com/Suhanikakpure11/blockchain-voting-system)

**SHRI SANT GAJANAN MAHARAJ COLLEGE OF ENGINEERING, SHEGAON**  
**DEPARTMENT OF COMPUTER SCIENCE & ENGINEERING**  
*Final Year, Seventh Semester | Autumn/Winter Session 2026-2027*  
*Subject:* **Blockchain Fundamentals (7KS05) TEC**

---

### 🚀 Live Cloud Deployment on Render

This project is fully configured and actively deployed on **Render.com** as a unified Web Service:

- **Live Deployed Application**: [https://blockchain-voting-system-ucl9.onrender.com/](https://blockchain-voting-system-ucl9.onrender.com/)
- **GitHub Repository**: [https://github.com/Suhanikakpure11/blockchain-voting-system](https://github.com/Suhanikakpure11/blockchain-voting-system)
- **1-Click Blueprint Deploy**: [Deploy to Render](https://render.com/deploy?repo=https://github.com/Suhanikakpure11/blockchain-voting-system)
- **Build Command**: `npm run render-build`
- **Start Command**: `npm start`

---

### Student Details
- **Shravani Raut** [Roll No: 27]
- **Shreya Katole** [Roll No: 28]
- **Suhani Kakpure** [Roll No: 33]

**Project Guide:** Prof. Dr. N. M. Kandoi, *Professor, Dept. of CSE*

---

## 📌 Project Overview & Abstract

Traditional voting systems face critical vulnerabilities including voter impersonation, unauthorized voting, duplicate voting, and centralized tampering of tally records. This project implements a **Decentralized Voting System Using Face Recognition and Blockchain**, where:
1. **Biometric Face Recognition**: Voters are authenticated through live real-time facial recognition and 128-dimensional embedding verification before accessing their digital ballot.
2. **Blockchain Immutability**: Votes are recorded through a Solidity smart contract deployed on Ethereum using Hardhat, guaranteeing tamper-proof records, transparent counting, and cryptographic receipts.
3. **Double-Voting Prevention**: The smart contract strictly enforces one-person-one-vote through decentralized state assertions.

---

## 🏗️ System Architecture & Technology Stack

```
   ┌──────────────────────────────────────────────────────────────┐
   │                    React.js Frontend                         │
   │  - MetaMask / Ethers.js Wallet Connection                    │
   │  - Real-time Webcam Face Recognition (@vladmandic/face-api)  │
   │  - Voter Station, Live Results, Admin Desk, Audit Ledger     │
   └───────────────┬───────────────────────────────┬──────────────┘
                   │                               │
         REST API  │                               │  Web3 JSON-RPC
         (5000)    │                               │  (8545)
                   ▼                               ▼
   ┌──────────────────────────────┐   ┌──────────────────────────────┐
   │    Node.js / Express API     │   │   Ethereum / Hardhat Node    │
   │  - Biometric Vector Registry │   │  - Chain ID: 31337           │
   │  - Voter Profile Storage     │   │  - DecentralizedVoting.sol   │
   │  - Facial Euclidean Distance │   │  - Cryptographic Consensus   │
   │  - Audit Trail Sync          │   │  - Tamper-proof Event Logs   │
   └──────────────────────────────┘   └──────────────────────────────┘
```

- **Smart Contract**: Solidity `^0.8.20` with optimizer enabled, deployed with Hardhat.
- **Backend**: Node.js & Express REST API (`/api/election`, `/api/candidates`, `/api/voters`, `/api/voters/verify-face`, `/api/vote/cast`, `/api/audit-trail`).
- **Frontend**: React 18, Vite, Tailwind CSS, Lucide Icons, Canvas Confetti.
- **Biometrics**: Client-side `@vladmandic/face-api` (TinyFaceDetector, FaceLandmark68, FaceRecognitionNet 128-d descriptor extraction) with server-side Euclidean distance matching.

---

## 🔑 Pre-Funded Test Electoral Accounts

The following Hardhat pre-funded test accounts are pre-seeded in the system:

| Role | Name | Roll No / ID | Wallet Address | Initial Balance |
| :--- | :--- | :--- | :--- | :--- |
| **Admin** | Dr. N. M. Kandoi | `ADMIN-01` | `0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266` | 10,000 ETH |
| **Voter 1** | Shravani Raut | `VOTER-27` | `0x70997970C51812dc3A010C7d01b50e0d17dc79C8` | 10,000 ETH |
| **Voter 2** | Shreya Katole | `VOTER-28` | `0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC` | 10,000 ETH |
| **Voter 3** | Suhani Kakpure | `VOTER-33` | `0x90F79bf6EB2c4f870365E785982E1f101E93b906` | 10,000 ETH |

*Note: You can switch between any of these accounts in 1-click using the account selector in the top-right header, or connect your personal MetaMask extension.*

---

## 📖 How to Test & Demonstrate the Project

### 1. Cast a Vote as an Authenticated Voter
1. Open the application.
2. On the **Cast Vote** tab, select your preferred candidate.
3. Click **Proceed to Face Scan**.
4. In Step 2, the live webcam feed will activate with real-time biometric scanning. Look into the camera (or click **Simulate Match (Pass)** for instant evaluation).
5. Once identity is confirmed (>98% match confidence), the digital ballot confirms your identity!
6. Click **Confirm & Seal Ballot**.
7. The transaction is signed and mined on the Ethereum blockchain. Confetti triggers and an immutable **Vote Receipt** with Block Number and Transaction Hash is generated!

### 2. Verify Duplicate Voting Prevention
- Try casting another vote with the same voter account.
- The smart contract will immediately revert with:
  > *"Duplicate voting prevented by Smart Contract! You have already cast your ballot."*

### 3. Check Real-Time Results & Ledger
- Click **Results** to view real-time vote distribution, turnout percentage, and candidate rankings updated straight from the Ethereum contract.
- Click **Past Ballots** to view the raw `VoteCast`, `VoterRegistered`, and `CandidateAdded` blockchain events and verify your wallet address.

### 4. Admin Management Desk
- Switch account to **Admin** (or click **Admin Desk**).
- Add new candidates, enroll new voters with biometric facial captures, and control the election state (*Start*, *End*, *Reset*).

---

## 🛠️ CLI Commands

```bash
# Run unit tests (Solidity contract verification)
npm run test

# Re-deploy & re-seed contract
npm run deploy

# Launch local production runner (Hardhat Node + Server + Client)
npm run start
```
