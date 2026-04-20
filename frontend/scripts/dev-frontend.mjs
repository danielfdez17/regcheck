import { spawn } from "node:child_process";
import readline from "node:readline";

const port = process.env.FRONTEND_PORT ?? "3001";
const host = process.env.FRONTEND_HOST ?? "0.0.0.0";

let childProcess = null;
let restartRequested = false;
let shutdownRequested = false;

function startServer() {
  if (shutdownRequested) {
    return;
  }

  childProcess = spawn(
    "pnpm",
    ["exec", "vite", "--host", host, "--port", port, "--strictPort"],
    {
      stdio: ["ignore", "inherit", "inherit"],
    },
  );

  childProcess.on("exit", (exitCode, exitSignal) => {
    childProcess = null;

    if (shutdownRequested) {
      process.exit(exitCode ?? 0);
      return;
    }

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

function shutdownServer(signal = "SIGTERM") {
  shutdownRequested = true;
  restartRequested = false;

  if (childProcess === null) {
    process.exit(0);
    return;
  }

  const processToStop = childProcess;
  processToStop.kill(signal);

  // Fallback in case Vite hangs during shutdown and does not release the port.
  setTimeout(() => {
    if (childProcess === processToStop) {
      processToStop.kill("SIGKILL");
    }
  }, 1500);
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
    input.close();
    shutdownServer();
  }
});

process.on("SIGINT", () => {
  input.close();
  shutdownServer("SIGINT");
});

console.log(
  "Frontend dev server controls: type r + Enter to restart, q + Enter to quit.",
);
startServer();
