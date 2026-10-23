const express = require("express");
const cors = require("cors");
const fs = require("fs");
const path = require("path");
const multer = require("multer");
const { ethers } = require("ethers");

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: true, limit: "50mb" }));

// Upload directory for voter face photos
const UPLOADS_DIR = path.join(__dirname, "uploads");
const DATA_DIR = path.join(__dirname, "data");
const VOTERS_FILE = path.join(DATA_DIR, "voters.json");
const DEPLOYMENT_FILE = path.join(DATA_DIR, "contract-deployment.json");

if (!fs.existsSync(UPLOADS_DIR)) fs.mkdirSync(UPLOADS_DIR, { recursive: true });
if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });

app.use("/uploads", express.static(UPLOADS_DIR));

// Configure multer storage
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, UPLOADS_DIR);
  },
  filename: function (req, file, cb) {
    const ext = path.extname(file.originalname) || ".jpg";
    cb(null, `voter-${Date.now()}${ext}`);
  },
});
const upload = multer({ storage });

// Helper to get contract instance
function getBlockchainDetails() {
  if (!fs.existsSync(DEPLOYMENT_FILE)) {
    return { contract: null, provider: null, signer: null, deployment: null };
  }
  try {
    const deployment = JSON.parse(fs.readFileSync(DEPLOYMENT_FILE, "utf8"));
    const provider = new ethers.JsonRpcProvider("http://127.0.0.1:8545");
    // Hardhat Account #0 default private key
    const adminPrivateKey = "0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80";
    const signer = new ethers.Wallet(adminPrivateKey, provider);
    const contract = new ethers.Contract(deployment.contractAddress, deployment.abi, signer);
    return { contract, provider, signer, deployment };
  } catch (err) {
    console.error("Blockchain connection error:", err.message);
    return { contract: null, provider: null, signer: null, deployment: null };
  }
}

// Helpers for voter file
function getVoters() {
  if (!fs.existsSync(VOTERS_FILE)) return [];
  try {
    return JSON.parse(fs.readFileSync(VOTERS_FILE, "utf8"));
  } catch (e) {
    return [];
  }
}

function saveVoters(voters) {
  fs.writeFileSync(VOTERS_FILE, JSON.stringify(voters, null, 2), "utf8");
}

// Euclidean distance calculation for 128-d face descriptors
function calculateEuclideanDistance(desc1, desc2) {
  if (!desc1 || !desc2 || desc1.length !== desc2.length) return 1.0;
  let sum = 0;
  for (let i = 0; i < desc1.length; i++) {
    const diff = desc1[i] - desc2[i];
    sum += diff * diff;
  }
  return Math.sqrt(sum);
}

// ----------------- ROUTES -----------------

// Health Check
app.get("/api/health", (req, res) => {
  res.json({
    status: "ok",
    timestamp: new Date().toISOString(),
    service: "SSGMCE Decentralized Voting System Backend",
  });
});

// Get election overview & contract details
app.get("/api/election", async (req, res) => {
  try {
    const { contract, deployment } = getBlockchainDetails();
    if (!contract) {
      return res.status(200).json({
        deployed: false,
        message: "Smart contract not yet deployed or hardhat node offline",
      });
    }

    const summary = await contract.getElectionSummary();
    const rawCandidates = await contract.getAllCandidates();

    const candidates = rawCandidates.map((c) => ({
      id: Number(c.id),
      name: c.name,
      party: c.party,
      symbolUrl: c.symbolUrl,
      manifesto: c.manifesto,
      voteCount: Number(c.voteCount),
    }));

    const stateEnum = ["Created", "Active", "Ended"];

    res.json({
      deployed: true,
      contractAddress: deployment.contractAddress,
      chainId: deployment.chainId,
      title: summary[0],
      admin: summary[1],
      state: stateEnum[Number(summary[2])] || "Unknown",
      rawState: Number(summary[2]),
      candidateCount: Number(summary[3]),
      registeredVoterCount: Number(summary[4]),
      totalVotes: Number(summary[5]),
      candidates,
    });
  } catch (error) {
    console.error("Error fetching election summary:", error.message);
    res.status(500).json({ error: error.message });
  }
});

// Get all candidates
app.get("/api/candidates", async (req, res) => {
  try {
    const { contract } = getBlockchainDetails();
    if (!contract) return res.json([]);
    const raw = await contract.getAllCandidates();
    const candidates = raw.map((c) => ({
      id: Number(c.id),
      name: c.name,
      party: c.party,
      symbolUrl: c.symbolUrl,
      manifesto: c.manifesto,
      voteCount: Number(c.voteCount),
    }));
    res.json(candidates);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get voters list
app.get("/api/voters", async (req, res) => {
  try {
    const voters = getVoters();
    const { contract } = getBlockchainDetails();

    // Augment with live on-chain status if contract is online
    const augmentedVoters = await Promise.all(
      voters.map(async (v) => {
        let onChainStatus = { isRegistered: false, hasVoted: false, votedCandidateId: 0 };
        if (contract && v.walletAddress) {
          try {
            const voterData = await contract.getVoter(v.walletAddress);
            onChainStatus = {
              isRegistered: voterData.isRegistered,
              hasVoted: voterData.hasVoted,
              votedCandidateId: Number(voterData.votedCandidateId),
              votedTimestamp: Number(voterData.votedTimestamp),
            };
          } catch (e) {
            // ignore address error
          }
        }
        return {
          voterId: v.voterId,
          name: v.name,
          rollNo: v.rollNo,
          email: v.email,
          department: v.department,
          walletAddress: v.walletAddress,
          photoUrl: v.photoUrl,
          hasBiometrics: !!v.faceDescriptor,
          onChain: onChainStatus,
        };
      })
    );

    res.json(augmentedVoters);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get specific voter
app.get("/api/voters/:voterId", (req, res) => {
  const voters = getVoters();
  const voter = voters.find((v) => v.voterId.toLowerCase() === req.params.voterId.toLowerCase());
  if (!voter) return res.status(404).json({ error: "Voter not found" });

  res.json({
    voterId: voter.voterId,
    name: voter.name,
    rollNo: voter.rollNo,
    email: voter.email,
    department: voter.department,
    walletAddress: voter.walletAddress,
    photoUrl: voter.photoUrl,
    hasBiometrics: !!voter.faceDescriptor,
  });
});

// Register or update voter facial biometrics & details
app.post("/api/voters/register", upload.single("photo"), async (req, res) => {
  try {
    const { voterId, name, rollNo, email, department, walletAddress, faceDescriptor } = req.body;

    if (!voterId || !name || !walletAddress) {
      return res.status(400).json({ error: "voterId, name, and walletAddress are required" });
    }

    let parsedDescriptor = null;
    if (faceDescriptor) {
      parsedDescriptor = typeof faceDescriptor === "string" ? JSON.parse(faceDescriptor) : faceDescriptor;
    }

    let photoUrl = "";
    if (req.file) {
      photoUrl = `http://localhost:${PORT}/uploads/${req.file.filename}`;
    } else if (req.body.photoUrl) {
      photoUrl = req.body.photoUrl;
    }

    const voters = getVoters();
    const existingIndex = voters.findIndex((v) => v.voterId.toLowerCase() === voterId.toLowerCase());

    const voterRecord = {
      voterId,
      name,
      rollNo: rollNo || "",
      email: email || "",
      department: department || "Computer Science & Engineering",
      walletAddress,
      photoUrl: photoUrl || (existingIndex >= 0 ? voters[existingIndex].photoUrl : ""),
      faceDescriptor: parsedDescriptor || (existingIndex >= 0 ? voters[existingIndex].faceDescriptor : null),
      isRegisteredOnChain: false,
      registeredAt: new Date().toISOString(),
    };

    // Register on blockchain smart contract
    const { contract } = getBlockchainDetails();
    if (contract) {
      try {
        const onChainVoter = await contract.getVoter(walletAddress);
        if (!onChainVoter.isRegistered) {
          const tx = await contract.registerVoter(voterId, walletAddress);
          await tx.wait();
          voterRecord.isRegisteredOnChain = true;
          console.log(`Registered voter ${voterId} on blockchain: Tx ${tx.hash}`);
        } else {
          voterRecord.isRegisteredOnChain = true;
        }
      } catch (err) {
        console.warn("Smart contract registration warning:", err.message);
      }
    }

    if (existingIndex >= 0) {
      voters[existingIndex] = { ...voters[existingIndex], ...voterRecord };
    } else {
      voters.push(voterRecord);
    }

    saveVoters(voters);
    res.json({ success: true, voter: voterRecord });
  } catch (error) {
    console.error("Voter registration error:", error);
    res.status(500).json({ error: error.message });
  }
});

// Verify live facial biometrics against registered template
app.post("/api/voters/verify-face", (req, res) => {
  try {
    const { voterId, liveDescriptor } = req.body;

    if (!voterId || !liveDescriptor) {
      return res.status(400).json({
        verified: false,
        error: "voterId and liveDescriptor vector are required",
      });
    }

    const voters = getVoters();
    const voter = voters.find((v) => v.voterId.toLowerCase() === voterId.toLowerCase());

    if (!voter) {
      return res.status(404).json({
        verified: false,
        error: `Voter ${voterId} not found in registered voters registry`,
      });
    }

    if (!voter.faceDescriptor || voter.faceDescriptor.length === 0) {
      return res.status(400).json({
        verified: false,
        error: `Voter ${voter.name} (${voterId}) does not have biometric face template registered yet. Please register face biometric in Admin panel first.`,
      });
    }

    const distance = calculateEuclideanDistance(voter.faceDescriptor, liveDescriptor);
    // Standard face-api Euclidean distance threshold: < 0.5 is a match
    const MATCH_THRESHOLD = 0.50;
    const isMatch = distance <= MATCH_THRESHOLD;

    // Calculate match confidence percentage
    const confidence = Math.max(0, Math.min(100, Math.round((1 - distance / MATCH_THRESHOLD) * 40 + 60)));

    if (isMatch) {
      return res.json({
        verified: true,
        voterId: voter.voterId,
        name: voter.name,
        walletAddress: voter.walletAddress,
        distance: distance.toFixed(4),
        confidence: `${confidence}%`,
        message: "Biometric face verification successful! Identity confirmed.",
      });
    } else {
      return res.json({
        verified: false,
        voterId: voter.voterId,
        distance: distance.toFixed(4),
        confidence: `${Math.max(10, Math.round((1 - distance) * 100))}%`,
        message: "Biometric authentication failed: Face does not match registered voter records. Impersonation detected.",
      });
    }
  } catch (error) {
    console.error("Face verification error:", error);
    res.status(500).json({ error: error.message });
  }
});

// Admin endpoint: Start election
app.post("/api/admin/start-election", async (req, res) => {
  try {
    const { contract } = getBlockchainDetails();
    if (!contract) return res.status(500).json({ error: "Contract not connected" });

    const tx = await contract.startElection();
    const receipt = await tx.wait();
    res.json({ success: true, txHash: receipt.hash });
  } catch (error) {
    res.status(500).json({ error: error.reason || error.message });
  }
});

// Admin endpoint: End election
app.post("/api/admin/end-election", async (req, res) => {
  try {
    const { contract } = getBlockchainDetails();
    if (!contract) return res.status(500).json({ error: "Contract not connected" });

    const tx = await contract.endElection();
    const receipt = await tx.wait();
    res.json({ success: true, txHash: receipt.hash });
  } catch (error) {
    res.status(500).json({ error: error.reason || error.message });
  }
});

// Admin endpoint: Reset election
app.post("/api/admin/reset-election", async (req, res) => {
  try {
    const { contract } = getBlockchainDetails();
    if (!contract) return res.status(500).json({ error: "Contract not connected" });

    const newTitle = req.body.title || "SSGMCE Student Council Election 2026-2027";
    const tx = await contract.resetElection(newTitle);
    const receipt = await tx.wait();
    res.json({ success: true, txHash: receipt.hash });
  } catch (error) {
    res.status(500).json({ error: error.reason || error.message });
  }
});

// Admin endpoint: Add Candidate
app.post("/api/admin/add-candidate", async (req, res) => {
  try {
    const { name, party, symbolUrl, manifesto } = req.body;
    if (!name || !party) {
      return res.status(400).json({ error: "Candidate name and party are required" });
    }

    const { contract } = getBlockchainDetails();
    if (!contract) return res.status(500).json({ error: "Contract not connected" });

    const tx = await contract.addCandidate(
      name,
      party,
      symbolUrl || `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(name)}`,
      manifesto || ""
    );
    const receipt = await tx.wait();
    res.json({ success: true, txHash: receipt.hash });
  } catch (error) {
    res.status(500).json({ error: error.reason || error.message });
  }
});

// Audit Trail: Fetch blockchain events
app.get("/api/audit-trail", async (req, res) => {
  try {
    const { contract, provider } = getBlockchainDetails();
    if (!contract) return res.json([]);

    const currentBlock = await provider.getBlockNumber();
    const fromBlock = Math.max(0, currentBlock - 5000);

    const voteEvents = await contract.queryFilter(contract.filters.VoteCast(), fromBlock);
    const regEvents = await contract.queryFilter(contract.filters.VoterRegistered(), fromBlock);
    const candidateEvents = await contract.queryFilter(contract.filters.CandidateAdded(), fromBlock);

    const parsedVotes = voteEvents.map((e) => ({
      type: "VoteCast",
      voterAddress: e.args[0],
      voterId: e.args[1],
      candidateId: Number(e.args[2]),
      timestamp: Number(e.args[3]),
      txHash: e.transactionHash,
      blockNumber: e.blockNumber,
    }));

    const parsedRegs = regEvents.map((e) => ({
      type: "VoterRegistered",
      voterId: e.args[0],
      voterAddress: e.args[1],
      txHash: e.transactionHash,
      blockNumber: e.blockNumber,
    }));

    const parsedCandidates = candidateEvents.map((e) => ({
      type: "CandidateAdded",
      candidateId: Number(e.args[0]),
      name: e.args[1],
      party: e.args[2],
      txHash: e.transactionHash,
      blockNumber: e.blockNumber,
    }));

    const allEvents = [...parsedVotes, ...parsedRegs, ...parsedCandidates].sort(
      (a, b) => b.blockNumber - a.blockNumber
    );

    res.json(allEvents);
  } catch (error) {
    console.error("Audit trail fetch error:", error.message);
    res.status(500).json({ error: error.message });
  }
});

app.listen(PORT, () => {
  console.log(`=================================================`);
  console.log(`SSGMCE Voting Backend Server running on port ${PORT}`);
  console.log(`REST API available at: http://localhost:${PORT}/api`);
  console.log(`=================================================`);
});
