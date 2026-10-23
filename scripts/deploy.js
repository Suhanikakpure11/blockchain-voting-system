const hre = require("hardhat");
const fs = require("fs");
const path = require("path");

async function main() {
  console.log("=================================================");
  console.log("Deploying Decentralized Voting System on Hardhat");
  console.log("Shri Sant Gajanan Maharaj College of Engineering");
  console.log("=================================================");

  const [admin, voter1, voter2, voter3] = await hre.ethers.getSigners();
  console.log(`Admin Address (Deployer): ${admin.address}`);
  console.log(`Voter 1 (Shravani Raut [27]): ${voter1.address}`);
  console.log(`Voter 2 (Shreya Katole [28]): ${voter2.address}`);
  console.log(`Voter 3 (Suhani Kakpure [33]): ${voter3.address}`);

  const title = "SSGMCE Student Council Election 2026-2027";
  const VotingFactory = await hre.ethers.getContractFactory("DecentralizedVoting");
  const voting = await VotingFactory.deploy(title);
  await voting.waitForDeployment();

  const contractAddress = await voting.getAddress();
  console.log(`\nContract successfully deployed at address: ${contractAddress}`);

  // Seed Candidates matching DecentraVote UI
  console.log("\nAdding initial candidates...");
  const candidate1Tx = await voting.addCandidate(
    "Dr. Elena Rostova",
    "Digital Rights & Privacy",
    "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=300&auto=format&fit=crop&q=80",
    "Upgrade open library digital repositories, protect student and civic research data privacy across campus infrastructure, and establish transparent oversight."
  );
  await candidate1Tx.wait();

  const candidate2Tx = await voting.addCandidate(
    "Marcus Vance",
    "Green Campus & Sustainability",
    "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=300&auto=format&fit=crop&q=80",
    "Solar canopy installations for all public parking and outdoor commons, expand municipal bike share corridors, and establish a 100% renewable energy student transition endowment."
  );
  await candidate2Tx.wait();

  const candidate3Tx = await voting.addCandidate(
    "Sarah Lin",
    "Transparency & Student Welfare",
    "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=300&auto=format&fit=crop&q=80",
    "Open budget tracking portal with monthly real-time public audit logs, expand non-copay mental health campus counseling, and civic legal aid center."
  );
  await candidate3Tx.wait();
  console.log("Added 3 Candidates successfully.");

  // Pre-register Voters corresponding to student details in abstract
  console.log("\nPre-registering eligible student voters on blockchain...");
  await (await voting.registerVoter("VOTER-27", voter1.address)).wait();
  await (await voting.registerVoter("VOTER-28", voter2.address)).wait();
  await (await voting.registerVoter("VOTER-33", voter3.address)).wait();
  console.log("Registered 3 student voters on blockchain.");

  // Start the election so voters can cast votes immediately
  console.log("\nStarting election on-chain...");
  const startTx = await voting.startElection();
  await startTx.wait();
  console.log("Election status set to ACTIVE (Voting Open).");

  // Export contract deployment info for frontend and server
  const artifactPath = path.join(__dirname, "../artifacts/contracts/Voting.sol/DecentralizedVoting.json");
  const artifact = JSON.parse(fs.readFileSync(artifactPath, "utf8"));

  const deploymentData = {
    contractAddress,
    networkName: hre.network.name,
    chainId: hre.network.config.chainId || 31337,
    deployedAt: new Date().toISOString(),
    adminAddress: admin.address,
    initialVoters: [
      { voterId: "VOTER-27", name: "Shravani Raut", rollNo: "27", address: voter1.address },
      { voterId: "VOTER-28", name: "Shreya Katole", rollNo: "28", address: voter2.address },
      { voterId: "VOTER-33", name: "Suhani Kakpure", rollNo: "33", address: voter3.address },
    ],
    abi: artifact.abi,
  };

  // Directories to output
  const targets = [
    path.join(__dirname, "../server/data"),
    path.join(__dirname, "../client/src"),
    path.join(__dirname, "../client/public"),
  ];

  for (const targetDir of targets) {
    if (!fs.existsSync(targetDir)) {
      fs.mkdirSync(targetDir, { recursive: true });
    }
    const targetFile = path.join(targetDir, "contract-deployment.json");
    fs.writeFileSync(targetFile, JSON.stringify(deploymentData, null, 2), "utf8");
    console.log(`Exported deployment details to: ${targetFile}`);
  }

  console.log("\nDeployment and seeding complete!");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("Deployment failed:", error);
    process.exit(1);
  });
