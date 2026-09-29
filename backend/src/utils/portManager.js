import { execSync } from "node:child_process";

/**
 * Finds process IDs currently listening on the specified TCP port.
 *
 * @param {number|string} port
 * @returns {number[]} Array of PIDs
 */
export function findProcessIdsOnPort(port) {
  const pids = new Set();
  const targetPort = String(port);

  if (process.platform === "win32") {
    try {
      const stdout = execSync("netstat -ano -p tcp", {
        encoding: "utf8",
        stdio: ["ignore", "pipe", "ignore"],
      });
      const lines = stdout.split("\n");

      for (const line of lines) {
        if (line.includes(`:${targetPort}`) && line.includes("LISTENING")) {
          const parts = line.trim().split(/\s+/);
          const pid = parts[parts.length - 1];
          const parsedPid = parseInt(pid, 10);
          if (!isNaN(parsedPid) && parsedPid !== 0 && parsedPid !== process.pid) {
            pids.add(parsedPid);
          }
        }
      }
    } catch {
      // Netstat error or empty output
    }
  } else {
    try {
      const stdout = execSync(`lsof -ti:${targetPort}`, {
        encoding: "utf8",
        stdio: ["ignore", "pipe", "ignore"],
      });
      const lines = stdout.trim().split("\n");
      for (const line of lines) {
        const pid = parseInt(line.trim(), 10);
        if (!isNaN(pid) && pid !== process.pid) {
          pids.add(pid);
        }
      }
    } catch {
      // lsof error or no process
    }
  }

  return Array.from(pids);
}

/**
 * Terminates any orphaned or stale processes bound to the target port.
 *
 * @param {number|string} port
 * @param {object} options
 * @param {boolean} options.verbose
 * @returns {Promise<boolean>}
 */
export async function ensurePortAvailable(port, { verbose = true } = {}) {
  const pids = findProcessIdsOnPort(port);
  if (pids.length === 0) return true;

  if (verbose) {
    console.log(`[PortManager] Port ${port} is currently occupied by PID(s): ${pids.join(", ")}`);
    console.log(`[PortManager] Releasing port ${port} by terminating previous process...`);
  }

  for (const pid of pids) {
    try {
      if (process.platform === "win32") {
        execSync(`taskkill /F /PID ${pid}`, { stdio: "ignore" });
      } else {
        process.kill(pid, "SIGKILL");
      }
      if (verbose) {
        console.log(`[PortManager] ✓ Successfully freed port ${port} (terminated PID ${pid})`);
      }
    } catch (err) {
      if (verbose) {
        console.warn(`[PortManager] Notice: Could not terminate PID ${pid}: ${err.message}`);
      }
    }
  }

  // Allow OS TCP stack to transition socket out of TIME_WAIT / FIN_WAIT
  await new Promise((resolve) => setTimeout(resolve, 350));
  return true;
}
