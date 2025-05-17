// A reusable hook (useLoadingBar) and component (LoadingBar) to display and control a top loading progress bar with animated progress and theme-based styling.

"use client";

import { useTheme } from "next-themes";
import { useEffect, useRef, useState } from "react";

// hook
export function useLoadingBar() {
  const [loadingBarVisible, setLoadingBarVisible] = useState(false);
  const [loadingProgress, setLoadingProgress] = useState(0);
  const progressInterval = useRef<number | null>(null);

  const startLoadingBar = () => {
    setLoadingBarVisible(true);
    setLoadingProgress(0);
    progressInterval.current = window.setInterval(() => {
      setLoadingProgress((prev) => {
        if (prev >= 80) {
          clearInterval(progressInterval.current!);
          progressInterval.current = null;
          return 80;
        }
        return prev + 1;
      });
    }, 15);
  };

  const completeLoadingBar = () => {
    if (progressInterval.current) {
      clearInterval(progressInterval.current);
      progressInterval.current = null;
    }
    setLoadingProgress(100);
    setTimeout(() => {
      setLoadingBarVisible(false);
      setLoadingProgress(0);
    }, 300);
  };

  useEffect(() => {
    return () => {
      if (progressInterval.current) clearInterval(progressInterval.current);
    };
  }, []);

  return {
    loadingBarVisible,
    loadingProgress,
    startLoadingBar,
    completeLoadingBar,
  };
}

// component
export function LoadingBar({ visible, progress }: { visible: boolean; progress: number }) {
  const { resolvedTheme } = useTheme();

  if (!visible) return null;

  return (
    <div className="fixed top-0 left-0 z-[9999] h-[3px] w-full bg-transparent">
      <div
        className={`h-full transition-width duration-300 ease-out ${
          resolvedTheme === "dark"
            ? "bg-white shadow-[0_0_12px_2px_rgba(255,255,255,0.6)]"
            : "bg-black shadow-[0_0_12px_2px_rgba(0,0,0,0.5)]"
        }`}
        style={{ width: `${progress}%` }}
      />
    </div>
  );
}