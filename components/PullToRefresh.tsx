"use client";

import { useState, useRef, useCallback } from "react";
import { motion, useMotionValue, useTransform } from "framer-motion";
import { hapticTap } from "@/lib/haptics";

const THRESHOLD = 80;

export default function PullToRefresh({
  onRefresh,
  children,
}: {
  onRefresh: () => void | Promise<void>;
  children: React.ReactNode;
}) {
  const [refreshing, setRefreshing] = useState(false);
  const y = useMotionValue(0);
  const spinnerOpacity = useTransform(y, [0, THRESHOLD / 2, THRESHOLD], [0, 0.5, 1]);
  const spinnerScale = useTransform(y, [0, THRESHOLD], [0.5, 1]);
  const startYRef = useRef(0);
  const draggingRef = useRef(false);

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    if (window.scrollY === 0 && !refreshing) {
      startYRef.current = e.touches[0].clientY;
      draggingRef.current = true;
    }
  }, [refreshing]);

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    if (!draggingRef.current) return;
    const delta = Math.max(0, e.touches[0].clientY - startYRef.current);
    // Apply resistance
    y.set(delta * 0.4);
  }, [y]);

  const handleTouchEnd = useCallback(async () => {
    if (!draggingRef.current) return;
    draggingRef.current = false;

    if (y.get() >= THRESHOLD * 0.4) {
      hapticTap();
      setRefreshing(true);
      await onRefresh();
      setRefreshing(false);
    }
    y.set(0);
  }, [y, onRefresh]);

  return (
    <div
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      className="relative"
    >
      {/* Pull indicator */}
      <motion.div
        className="absolute left-1/2 -translate-x-1/2 top-0 z-10 flex items-center justify-center"
        style={{ opacity: spinnerOpacity, scale: spinnerScale, y: useTransform(y, (v) => v - 32) }}
      >
        <div
          className={`w-8 h-8 border-2 border-copper rounded-full ${
            refreshing ? "border-t-transparent animate-spin" : "border-t-copper"
          }`}
        />
      </motion.div>

      {children}
    </div>
  );
}
