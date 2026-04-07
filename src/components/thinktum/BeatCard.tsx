import type { CSSProperties } from "react";
import type { BeatCard as BeatCardType } from "./beatConfig";

interface BeatCardProps {
  card: BeatCardType;
  visible: boolean;
}

const BeatCard = ({ card, visible }: BeatCardProps) => {
  return (
    <div
      style={{
        ...cardStyle,
        ...(card.side === "left" ? { left: 60 } : { right: 60 }),
        opacity: visible ? 1 : 0,
        pointerEvents: visible ? "auto" : "none",
        transition: visible ? "opacity 0.6s ease" : "opacity 0.4s ease",
      }}
    >
      <Corner pos="tl" />
      <Corner pos="tr" />
      <Corner pos="bl" />
      <Corner pos="br" />

      <h3 style={titleStyle}>{card.title}</h3>
      <p style={bodyStyle}>{card.body}</p>
      <button style={buttonStyle}>{card.cta}</button>
    </div>
  );
};

const Corner = ({ pos }: { pos: "tl" | "tr" | "bl" | "br" }) => {
  const style: CSSProperties = {
    position: "absolute",
    width: 6,
    height: 6,
    borderColor: "rgba(255,255,255,0.35)",
    borderStyle: "solid",
    borderWidth: 0,
    ...(pos.includes("t") ? { top: -1, borderTopWidth: 1 } : { bottom: -1, borderBottomWidth: 1 }),
    ...(pos.includes("l") ? { left: -1, borderLeftWidth: 1 } : { right: -1, borderRightWidth: 1 }),
  };

  return <div style={style} />;
};

const cardStyle: CSSProperties = {
  position: "absolute",
  top: "50%",
  transform: "translateY(-50%)",
  maxWidth: 320,
  padding: "24px 28px",
  background: "rgba(255,255,255,0.04)",
  border: "1px solid rgba(255,255,255,0.12)",
  borderRadius: 2,
  backdropFilter: "blur(8px)",
  WebkitBackdropFilter: "blur(8px)",
  fontFamily: "'Space Grotesk', sans-serif",
};

const titleStyle: CSSProperties = {
  fontSize: "1.1rem",
  fontWeight: 500,
  color: "#ffffff",
  margin: 0,
  marginBottom: 8,
};

const bodyStyle: CSSProperties = {
  fontSize: "0.82rem",
  fontWeight: 300,
  color: "rgba(255,255,255,0.55)",
  lineHeight: 1.6,
  margin: 0,
  whiteSpace: "pre-line",
};

const buttonStyle: CSSProperties = {
  marginTop: 16,
  fontSize: "0.82rem",
  fontWeight: 400,
  color: "#F99FC9",
  background: "none",
  border: "none",
  padding: 0,
  cursor: "pointer",
  fontFamily: "'Space Grotesk', sans-serif",
  letterSpacing: "0.02em",
};

export default BeatCard;
