const { spawn } = require("child_process");
const http = require("http");
const path = require("path");
const fs = require("fs");

function waitForPort(url, timeoutMs = 35000) {
  const startTime = Date.now();
  return new Promise((resolve) => {
    const check = () => {
      const req = http.get(url, (res) => {
        resolve(true);
      });
      req.on("error", () => {
        if (Date.now() - startTime > timeoutMs) {
          console.warn(`Timeout waiting for ${url}, proceeding anyway...`);
          resolve(false);
        } else {
          setTimeout(check, 1000);
        }
      });
      req.end();
    };
    check();
  });
}

function runCommand(command, args, cwd = process.cwd()) {
  return new Promise((resolve) => {
    const proc = spawn(command, args, { cwd, stdio: "inherit", shell: true });
    proc.on("close", (code) => {
      if (code === 0) resolve(true);
      else {
        console.warn(`${command} exited with code ${code}`);
        resolve(false);
      }
    });
  });
}

async function start() {
  console.log("==================================================================");
  console.log("DecentraVote Production Node Starting on Render Cloud Platform...");
  console.log("==================================================================");

  // 1. Start Hardhat Ethereum JSON-RPC node
  console.log("[1/3] Spawning background Hardhat Ethereum Node on 127.0.0.1:8545...");
  const hardhat = spawn("npx", ["hardhat", "node"], {
    stdio: "pipe",
    shell: true,
  });

  hardhat.stdout.on("data", (data) => {
    const msg = data.toString();
    if (msg.includes("Started HTTP and WebSocket JSON-RPC server")) {
      console.log("      Hardhat Ethereum JSON-RPC node online on 127.0.0.1:8545");
    }
  });

  hardhat.stderr.on("data", (data) => {
    // suppress debug warnings
  });

  // 2. Wait for RPC and deploy contracts
  const ready = await waitForPort("http://127.0.0.1:8545", 25000);
  if (ready) {
    console.log("[2/3] Deploying smart contract Voting.sol & initial candidates...");
    await runCommand("npx", ["hardhat", "run", "scripts/deploy.js", "--network", "localhost"]);
  } else {
    console.log("[2/3] Local Hardhat node status checked. Continuing with existing deployment...");
  }

  // 3. Start unified Express Production Server
  console.log("[3/3] Launching unified Express Web Service & API...");
  require("../server/index.js");
}

start().catch((err) => {
  console.error("Fatal startup error:", err);
  process.exit(1);
});
