import { useCallback, useRef } from "react";
import BeatCard from "./BeatCard";
import BracketCursor from "./BracketCursor";
import {
  CITY_ARRIVAL_CHAPTER,
  TREE_ORBIT_CHAPTER,
  TUNNEL_TRAVEL_CHAPTER,
} from "./beatConfig";
import ChromeOverlay from "./ChromeOverlay";
import ParticleScene from "./ParticleScene";
import { beats, lizCards, tunnelCards } from "./beatConfig";
import { useScrollProgress } from "./useScrollProgress";

const totalWeight = beats.reduce((sum, beat) => sum + beat.scrollWeight, 0);

const ScrollExperience = () => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const { state: scrollState, stateRef: scrollStateRef } = useScrollProgress(scrollRef);

  const scrollToBeat = useCallback((index: number) => {
    if (!scrollRef.current) return;

    const el = scrollRef.current;
    const maxScroll = el.scrollHeight - el.clientHeight;
    let acc = 0;

    for (let i = 0; i < index && i < beats.length; i += 1) {
      acc += beats[i].scrollWeight / totalWeight;
    }

    el.scrollTo({ top: acc * maxScroll, behavior: "smooth" });
  }, []);

  const onPrev = useCallback(() => {
    if (scrollState.beatIndex > 0) {
      scrollToBeat(scrollState.beatIndex - 1);
    }
  }, [scrollState.beatIndex, scrollToBeat]);

  const onNext = useCallback(() => {
    if (scrollState.beatIndex < beats.length - 1) {
      scrollToBeat(scrollState.beatIndex + 1);
    }
  }, [scrollState.beatIndex, scrollToBeat]);

  const activeCards =
    scrollState.beatIndex === TREE_ORBIT_CHAPTER
      ? lizCards
      : scrollState.beatIndex === TUNNEL_TRAVEL_CHAPTER
        ? tunnelCards
        : [];

  return (
    <div
      style={{
        position: "relative",
        width: "100%",
        height: "100vh",
        overflow: "hidden",
        background: "#080810",
        cursor: "none",
      }}
    >
      <div style={{ position: "fixed", inset: 0, zIndex: 0 }}>
        <ParticleScene scrollState={scrollState} scrollStateRef={scrollStateRef} />
      </div>

      <div
        ref={scrollRef}
        style={{
          position: "absolute",
          inset: 0,
          zIndex: 10,
          overflowY: "auto",
          scrollbarWidth: "none",
          msOverflowStyle: "none",
        }}
      >
        <div style={{ height: `${totalWeight * 100}vh` }} />
      </div>

      <div style={{ position: "fixed", inset: 0, zIndex: 40, pointerEvents: "none" }}>
        {activeCards.map((card, index) => {
          const visible =
            scrollState.localProgress >= card.appearAt &&
            scrollState.localProgress <= card.disappearAt;

          return <BeatCard key={`${card.title}-${index}`} card={card} visible={visible} />;
        })}
      </div>

      {scrollState.beatIndex === CITY_ARRIVAL_CHAPTER && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 40,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            pointerEvents: "none",
          }}
        >
          <div style={{ textAlign: "center", fontFamily: "'Space Grotesk', sans-serif" }}>
            <h1
              style={{
                fontSize: "clamp(2.8rem, 5vw, 5rem)",
                fontWeight: 600,
                color: scrollState.localProgress > 0.5 ? "#F99FC9" : "#ffffff",
                transition: "color 1s ease",
                margin: 0,
              }}
            >
              {scrollState.localProgress > 0.5
                ? "That's why we built LIZ."
                : "Insurance built for the age of AI."}
            </h1>
            {scrollState.localProgress > 0.6 && (
              <button
                style={{
                  marginTop: 32,
                  fontSize: "0.9rem",
                  fontWeight: 400,
                  color: "#ffffff",
                  background: "none",
                  border: "1px solid rgba(255,255,255,0.35)",
                  padding: "12px 28px",
                  borderRadius: 24,
                  cursor: "pointer",
                  pointerEvents: "auto",
                  fontFamily: "'Space Grotesk', sans-serif",
                  transition: "border-color 0.3s ease",
                }}
                onMouseEnter={(event) => {
                  event.currentTarget.style.borderColor = "#ffffff";
                }}
                onMouseLeave={(event) => {
                  event.currentTarget.style.borderColor = "rgba(255,255,255,0.35)";
                }}
              >
                Request a demo →
              </button>
            )}
          </div>
        </div>
      )}

      <ChromeOverlay scrollState={scrollState} onPrev={onPrev} onNext={onNext} />
      <BracketCursor />
    </div>
  );
};

export default ScrollExperience;
