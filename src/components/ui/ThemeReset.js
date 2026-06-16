"use client";

import { useTheme } from "next-themes";
import { useEffect } from "react";

export default function ThemeReset() {
  const { setTheme } = useTheme();

  useEffect(() => {
    // Force light mode on the landing page so the dark mode preference from the dashboard doesn't bleed into the logged-out experience.
    setTheme("light");
  }, [setTheme]);

  return null;
}
