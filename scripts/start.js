const { spawn } = require("child_process");
const http = require("http");
const path = require("path");

function waitForPort(url, timeoutMs = 30000) {
  const startTime = Date.now();
  return new Promise((resolve, reject) => {
    const check = () => {
      const req = http.get(url, (res) => {
        resolve();
      });
      req.on("error", () => {
        if (Date.now() - startTime > timeoutMs) {
          reject(new Error(`Timeout waiting for ${url}`));
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
  return new Promise((resolve, reject) => {
    const proc = spawn(command, args, {
      cwd,
      stdio: "inherit",
      shell: true,
    });
    proc.on("close", (code) => {
      if (code === 0) resolve();
      else reject(new Error(`${command} ${args.join(" ")} exited with code ${code}`));
    });
  });
}

async function main() {
  console.log("=================================================");
  console.log("Starting Decentralized Voting System Ecosystem...");
  console.log("=================================================");

  // 1. Start Hardhat Node
  console.log("\n[1/4] Spawning Hardhat Ethereum Node on http://127.0.0.1:8545...");
  const hardhatNode = spawn("npx", ["hardhat", "node"], {
    stdio: "pipe",
    shell: true,
  });

  hardhatNode.stdout.on("data", (d) => {
    const s = d.toString();
    if (s.includes("Started HTTP and WebSocket JSON-RPC server")) {
      console.log("      Hardhat JSON-RPC node ready!");
    }
  });

  hardhatNode.stderr.on("data", (d) => {
    // console.error(`[Hardhat Error] ${d}`);
  });

  // Wait for Hardhat to be ready
  await waitForPort("http://127.0.0.1:8545");
  console.log("      Connection established to Hardhat Ethereum Node.");

  // 2. Deploy and seed smart contracts
  console.log("\n[2/4] Deploying & seeding Voting.sol smart contract...");
  await runCommand("npx", ["hardhat", "run", "scripts/deploy.js", "--network", "localhost"]);

  // 3. Start Backend Express API
  console.log("\n[3/4] Starting Node.js/Express Backend Server...");
  const backendServer = spawn("node", ["server/index.js"], {
    stdio: "inherit",
    shell: true,
  });

  // Wait for backend
  await waitForPort("http://localhost:5000/api/health");
  console.log("      Backend API is healthy at http://localhost:5000/api");

  // 4. Start React Frontend
  console.log("\n[4/4] Starting Vite React Frontend Client...");
  const frontend = spawn("npm", ["--prefix", "client", "run", "dev"], {
    stdio: "inherit",
    shell: true,
  });

  console.log("\n=================================================");
  console.log("All services are LIVE and fully connected!");
  console.log("Frontend UI:   http://localhost:3000");
  console.log("Backend API:   http://localhost:5000/api");
  console.log("Ethereum RPC:  http://127.0.0.1:8545");
  console.log("=================================================");

  // Clean shutdown
  const shutdown = () => {
    console.log("\nShutting down all services...");
    try { hardhatNode.kill(); } catch (e) {}
    try { backendServer.kill(); } catch (e) {}
    try { frontend.kill(); } catch (e) {}
    process.exit(0);
  };

  process.on("SIGINT", shutdown);
  process.on("SIGTERM", shutdown);
}

main().catch((err) => {
  console.error("Startup error:", err);
  process.exit(1);
});
