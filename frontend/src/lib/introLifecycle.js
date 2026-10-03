// Document-level authoritative lifecycle for homepage intro animation
// Possible states: "idle" -> "running" -> "completed"

const isInitialHome =
  typeof window !== "undefined" &&
  (window.location.pathname === "/" || window.location.pathname === "");

// Only initialize to "idle" if the initial document opened on "/"
// Any non-homepage initial load immediately marks intro as "completed"
let introStatus = isInitialHome ? "idle" : "completed";

export function getIntroStatus() {
  return introStatus;
}

export function shouldPlayIntro() {
  return introStatus === "idle";
}

export function markIntroRunning() {
  if (introStatus === "idle") {
    introStatus = "running";
    return true;
  }
  return false;
}

export function markIntroCompleted() {
  introStatus = "completed";
}
