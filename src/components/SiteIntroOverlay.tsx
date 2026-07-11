"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { LogoSmokeIntro } from "./LogoSmokeIntro";

const SESSION_KEY = "fc_intro_v1";

export function SiteIntroOverlay() {
  const [play, setPlay] = useState(false);

  useEffect(() => {
    try {
      if (!sessionStorage.getItem(SESSION_KEY)) {
        sessionStorage.setItem(SESSION_KEY, "1");
        setPlay(true);
      }
    } catch {
      setPlay(true);
    }
  }, []);

  if (!play) return null;

  return createPortal(
    <LogoSmokeIntro onComplete={() => setPlay(false)} />,
    document.body
  );
}
