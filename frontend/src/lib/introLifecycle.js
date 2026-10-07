// Document-level authoritative lifecycle for homepage intro animation
// Possible states: "idle" -> "running" -> "completed"

const initialPath =
  typeof window !== "undefined"
    ? (window.location.pathname || "/").replace(/\/+$/, "") || "/"
    : "/";

// Only true when the browser document was initially loaded or refreshed directly at "/"
const isInitialHome =
  typeof window !== "undefined" &&
  (initialPath === "/" || initialPath === "/index.html");

// Only initialize to "idle" if the browser document opened directly on "/"
// Any non-homepage initial load immediately marks intro as "completed"
let introStatus = isInitialHome ? "idle" : "completed";

if (typeof window !== "undefined") {
  window.__subashIntroStatus = () => introStatus;
}

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
