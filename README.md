# Decentralized Voting System Using Face Recognition and Blockchain

**SHRI SANT GAJANAN MAHARAJ COLLEGE OF ENGINEERING, SHEGAON**  
**DEPARTMENT OF COMPUTER SCIENCE & ENGINEERING**  
*Final Year, Seventh Semester | Autumn/Winter Session 2026-2027*  
*Subject:* **Blockchain Fundamentals (7KS05) TEC**

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
- **Biometric Layer**: SSD-MobileNet / TinyFaceDetector with 68 facial landmarks & FaceNet 128-d descriptor extraction.
- **Backend API**: Node.js, Express, Ethers.js v6, Multer.
- **Frontend UI**: React 18, Vite, Tailwind CSS, Lucide icons, Canvas-Confetti.

---

## 🚀 Live Services & Deployment Information

All three components are deployed and running locally:

| Component | Endpoint | Description |
|---|---|---|
| **Frontend Application** | [http://localhost:3000](http://localhost:3000) | Full responsive UI for Voters, Results, Admin & Audit |
| **Backend REST API** | [http://localhost:5000/api](http://localhost:5000/api) | Biometric verification & candidate/voter management |
| **Hardhat Ethereum Node** | [http://127.0.0.1:8545](http://127.0.0.1:8545) | Local EVM JSON-RPC provider (Chain ID 31337) |
| **Deployed Smart Contract** | `0x5FbDB2315678afecb367f032d93F642f64180aa3` | `DecentralizedVoting` contract |

---

## 🧪 Pre-Configured Test Accounts & Voters

The system comes pre-seeded with test accounts mapped to the student authors from the college abstract:

| Role | Name | Voter ID | Ethereum Wallet Address |
|---|---|---|---|
| **Election Admin** | Prof. Dr. N. M. Kandoi | `ADMIN-01` | `0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266` |
| **Voter 1** | Shravani Raut [27] | `VOTER-27` | `0x70997970C51812dc3A010C7d01b50e0d17dc79C8` |
| **Voter 2** | Shreya Katole [28] | `VOTER-28` | `0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC` |
| **Voter 3** | Suhani Kakpure [33] | `VOTER-33` | `0x90F79bf6EB2c4f870365E785982E1f101E93b906` |

*Note: You can switch between any of these accounts in 1-click using the account selector in the top-right header, or connect your personal MetaMask extension.*

---

## 📖 How to Test & Demonstrate the Project

### 1. Cast a Vote as an Authenticated Voter
1. Open [http://localhost:3000](http://localhost:3000).
2. On the **Voter Station** tab, enter Voter ID `VOTER-27` (or click the quick button for **Shravani [27]**).
3. Click **Proceed to Face Scan**.
4. In Step 2, the live webcam feed will activate with real-time biometric scanning. Click **Scan & Verify My Face** (or click **Simulate Match (Pass)** for instant evaluation).
5. Once identity is confirmed (>98% match confidence), the **Digital Ballot** unlocks!
6. Select your candidate (e.g., *Aarav Sharma - Digital Innovation Alliance*).
7. Click **Submit Tamper-Proof Vote**.
8. The transaction is signed and mined on the Ethereum blockchain. Confetti triggers and an immutable **Vote Receipt** with Block Number and Transaction Hash is generated!

### 2. Verify Duplicate Voting Prevention
- Try casting another vote with the same voter account.
- The smart contract will immediately revert with:
  > *"Duplicate voting prohibited: You have already cast your vote"*

### 3. Check Real-Time Results & Ledger
- Click **Live Tally** to view real-time vote distribution, turnout percentage, and candidate rankings updated straight from the Ethereum contract.
- Click **Audit Ledger** to view the raw `VoteCast`, `VoterRegistered`, and `CandidateAdded` blockchain events and verify your wallet address.

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

# Launch all services concurrently (Node + Server + Client)
npm run start
```
