import { useEffect, useRef } from "react";

const BracketCursor = () => {
  const cursorRef = useRef<HTMLDivElement>(null);
  const mousePos = useRef({ x: -100, y: -100 });
  const currentPos = useRef({ x: -100, y: -100 });
  const rafRef = useRef<number>(0);

  useEffect(() => {
    const onMove = (event: MouseEvent) => {
      mousePos.current = { x: event.clientX, y: event.clientY };
    };

    window.addEventListener("mousemove", onMove);

    const animate = () => {
      currentPos.current.x += (mousePos.current.x - currentPos.current.x) * 0.12;
      currentPos.current.y += (mousePos.current.y - currentPos.current.y) * 0.12;

      if (cursorRef.current) {
        cursorRef.current.style.transform = `translate(${currentPos.current.x - 12}px, ${currentPos.current.y - 12}px)`;
      }

      rafRef.current = requestAnimationFrame(animate);
    };

    rafRef.current = requestAnimationFrame(animate);

    return () => {
      window.removeEventListener("mousemove", onMove);
      cancelAnimationFrame(rafRef.current);
    };
  }, []);

  return (
    <div
      ref={cursorRef}
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        pointerEvents: "none",
        zIndex: 9999,
        mixBlendMode: "difference",
        willChange: "transform",
      }}
    >
      <span
        style={{
          display: "block",
          width: 24,
          height: 24,
          fontFamily: "'Space Grotesk', sans-serif",
          fontSize: 20,
          fontWeight: 300,
          color: "rgba(255,255,255,0.65)",
          lineHeight: "24px",
          textAlign: "center",
          letterSpacing: "0.05em",
        }}
      >
        [ ]
      </span>
    </div>
  );
};

export default BracketCursor;
