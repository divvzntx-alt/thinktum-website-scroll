import type { CSSProperties } from "react";
import { beats } from "./beatConfig";
import type { ScrollState } from "./useScrollProgress";

interface ChromeOverlayProps {
  scrollState: ScrollState;
  onPrev: () => void;
  onNext: () => void;
}

const ChromeOverlay = ({ scrollState, onPrev, onNext }: ChromeOverlayProps) => {
  const { beatIndex, counter } = scrollState;
  const beat = beats[beatIndex];
  const canPrev = beatIndex > 0;
  const canNext = beatIndex < beats.length - 1;
  const headlineVisible = beat?.textMode !== "hidden" && Boolean(beat?.headline);
  const supportVisible = beat?.textMode === "full" && Boolean(beat?.support);

  return (
    <div style={overlayStyle}>
      <Bracket position="top-left" />
      <Bracket position="top-right" />
      <Bracket position="bottom-left" />
      <Bracket position="bottom-right" />

      <div style={brandStyle}>thinktum</div>

      <div style={topRightStyle}>
        <div style={arrowGroupStyle}>
          <button onClick={onPrev} style={arrowStyle(canPrev)}>
            ▲
          </button>
          <button onClick={onNext} style={arrowStyle(canNext)}>
            ▼
          </button>
        </div>

        <span style={counterStyle}>{counter}</span>

        <div style={progressTrackStyle}>
          <div
            style={{
              ...progressFillStyle,
              height: `${scrollState.globalProgress * 100}%`,
            }}
          />
        </div>
      </div>

      <div style={copyWrapStyle}>
        <h1 style={{ ...headlineStyle, opacity: headlineVisible ? 1 : 0 }}>
          {beat?.headline}
        </h1>
        <p style={{ ...supportStyle, opacity: supportVisible ? 1 : 0 }}>
          {beat?.support}
        </p>
      </div>

      <div style={cityLabelStyle}>Chicago</div>
    </div>
  );
};

const Bracket = ({
  position,
}: {
  position: "top-left" | "top-right" | "bottom-left" | "bottom-right";
}) => {
  const offset = 28;
  const size = 22;
  const color = "rgba(255,255,255,0.22)";

  const posStyle: CSSProperties = {
    position: "absolute",
    width: size,
    height: size,
    ...(position.includes("top") ? { top: offset } : { bottom: offset }),
    ...(position.includes("left") ? { left: offset } : { right: offset }),
    borderColor: color,
    borderStyle: "solid",
    borderWidth: 0,
    ...(position.includes("top")
      ? { borderTopWidth: 1 }
      : { borderBottomWidth: 1 }),
    ...(position.includes("left")
      ? { borderLeftWidth: 1 }
      : { borderRightWidth: 1 }),
  };

  return <div style={posStyle} />;
};

const overlayStyle: CSSProperties = {
  position: "fixed",
  inset: 0,
  pointerEvents: "none",
  zIndex: 50,
  fontFamily: "'Space Grotesk', sans-serif",
};

const brandStyle: CSSProperties = {
  position: "absolute",
  top: 40,
  left: 40,
  fontSize: 12,
  fontWeight: 300,
  color: "rgba(255,255,255,0.45)",
  letterSpacing: "0.15em",
};

const topRightStyle: CSSProperties = {
  position: "absolute",
  top: 40,
  right: 40,
  display: "flex",
  alignItems: "flex-start",
  gap: 16,
};

const arrowGroupStyle: CSSProperties = {
  display: "flex",
  flexDirection: "column",
  gap: 4,
  pointerEvents: "auto",
};

const arrowStyle = (enabled: boolean): CSSProperties => ({
  background: "transparent",
  border: "none",
  outline: "none",
  fontSize: 11,
  fontWeight: 400,
  color: enabled ? "rgba(255,255,255,0.45)" : "rgba(255,255,255,0.18)",
  cursor: enabled ? "pointer" : "default",
  fontFamily: "'Space Grotesk', sans-serif",
  padding: 0,
});

const counterStyle: CSSProperties = {
  fontSize: 11,
  fontWeight: 500,
  color: "rgba(255,255,255,0.55)",
};

const progressTrackStyle: CSSProperties = {
  width: 2,
  height: 60,
  background: "rgba(255,255,255,0.12)",
  position: "relative",
};

const progressFillStyle: CSSProperties = {
  width: 2,
  position: "absolute",
  left: 0,
  bottom: 0,
  background: "rgba(255,255,255,0.55)",
  transition: "height 0.1s ease-out",
};

const copyWrapStyle: CSSProperties = {
  position: "absolute",
  bottom: 48,
  left: 40,
  maxWidth: 520,
};

const headlineStyle: CSSProperties = {
  fontSize: "clamp(2.2rem, 4vw, 4rem)",
  fontWeight: 600,
  color: "#ffffff",
  lineHeight: 1.1,
  margin: 0,
  transition: "opacity 0.6s ease",
};

const supportStyle: CSSProperties = {
  fontSize: "clamp(0.75rem, 1vw, 0.9rem)",
  fontWeight: 300,
  color: "rgba(255,255,255,0.45)",
  marginTop: 12,
  lineHeight: 1.6,
  transition: "opacity 0.6s ease",
};

const cityLabelStyle: CSSProperties = {
  position: "absolute",
  bottom: 48,
  right: 40,
  fontSize: 11,
  fontWeight: 400,
  color: "rgba(255,255,255,0.35)",
  letterSpacing: "0.2em",
  textTransform: "uppercase",
};

export default ChromeOverlay;
