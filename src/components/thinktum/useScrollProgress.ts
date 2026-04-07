import { useCallback, useEffect, useRef, useState } from "react";
import type { MutableRefObject, RefObject } from "react";
import { TOTAL_BEATS, beats } from "./beatConfig";

export interface ScrollState {
  globalProgress: number;
  beatIndex: number;
  localProgress: number;
  counter: string;
}

const totalWeight = beats.reduce((sum, beat) => sum + beat.scrollWeight, 0);

export function getScrollState(scrollY: number, scrollHeight: number): ScrollState {
  const maxScroll = Math.max(1, scrollHeight);
  const globalProgress = Math.min(scrollY / maxScroll, 1);

  let accumulated = 0;
  let beatIndex = 0;
  let localProgress = 0;

  for (let i = 0; i < beats.length; i += 1) {
    const beatFraction = beats[i].scrollWeight / totalWeight;
    if (globalProgress <= accumulated + beatFraction + 0.005) {
      beatIndex = i;
      localProgress = Math.min(
        Math.max((globalProgress - accumulated) / beatFraction, 0),
        1
      );
      break;
    }
    accumulated += beatFraction;
    if (i === beats.length - 1) {
      beatIndex = i;
      localProgress = 1;
    }
  }

  const displayBeat = Math.min(Math.max(beatIndex, 0), TOTAL_BEATS - 1);
  const counterNum = beats[displayBeat]?.counterValue ?? 0;
  const counter = `${String(counterNum).padStart(2, "0")}/10`;

  return { globalProgress, beatIndex, localProgress, counter };
}

export function useScrollProgress(
  scrollRef: RefObject<HTMLDivElement | null>
): { state: ScrollState; stateRef: MutableRefObject<ScrollState> } {
  const stateRef = useRef<ScrollState>({
    globalProgress: 0,
    beatIndex: 0,
    localProgress: 0,
    counter: "00/10",
  });
  const [state, setState] = useState<ScrollState>(stateRef.current);
  const rafRef = useRef<number>(0);

  const onScroll = useCallback(() => {
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    rafRef.current = requestAnimationFrame(() => {
      if (!scrollRef.current) return;
      const el = scrollRef.current;
      const scrollY = el.scrollTop;
      const scrollHeight = el.scrollHeight - el.clientHeight;
      const nextState = getScrollState(scrollY, scrollHeight);
      stateRef.current = nextState;
      setState(nextState);
    });
  }, [scrollRef]);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    el.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => {
      el.removeEventListener("scroll", onScroll);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [scrollRef, onScroll]);

  return { state, stateRef };
}
