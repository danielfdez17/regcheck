import { spawn } from "node:child_process";
import readline from "node:readline";

const port = process.env.FRONTEND_PORT ?? "3001";
const host = process.env.FRONTEND_HOST ?? "0.0.0.0";

let childProcess = null;
let restartRequested = false;

function startServer() {
  childProcess = spawn(
    "pnpm",
    ["exec", "vite", "--host", host, "--port", port, "--strictPort"],
    {
      stdio: ["ignore", "inherit", "inherit"],
    },
  );

  childProcess.on("exit", (exitCode, exitSignal) => {
    childProcess = null;

    if (restartRequested) {
      restartRequested = false;
      startServer();
      return;
    }

    if (exitSignal === null && exitCode !== null && exitCode !== 0) {
      process.exitCode = exitCode;
    }
  });
}

function restartServer() {
  if (childProcess === null) {
    startServer();
    return;
  }

  restartRequested = true;
  childProcess.kill("SIGTERM");
}

const input = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

input.on("line", (line) => {
  const command = line.trim().toLowerCase();

  if (command === "r" || command === "restart") {
    restartServer();
    return;
  }

  if (command === "q" || command === "quit" || command === "exit") {
    process.exit(0);
  }
});

process.on("SIGINT", () => {
  if (childProcess !== null) {
    childProcess.kill("SIGINT");
  }

  input.close();
  process.exit(0);
});

console.log("Frontend dev server controls: type r + Enter to restart, q + Enter to quit.");
startServer();