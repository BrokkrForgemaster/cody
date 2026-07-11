"use client";

import { useEffect, useState } from "react";
import { LogoSmokeIntro } from "./LogoSmokeIntro";

type State = "pending" | "play" | "done";

export function AuthIntroGate({ children }: { children: React.ReactNode }) {
  // "pending" = server / pre-mount. Renders no intro overlay and children
  // at opacity 0. Matches server HTML exactly — no hydration mismatch.
  const [state, setState] = useState<State>("pending");

  useEffect(() => {
    setState("play");
  }, []);

  return (
    <>
      {state === "play" && (
        <LogoSmokeIntro onComplete={() => setState("done")} />
      )}
      <div
        style={{
          opacity:    state === "done" ? 1 : 0,
          transition: state === "done" ? "opacity 0.45s ease" : undefined,
        }}
      >
        {children}
      </div>
    </>
  );
}
