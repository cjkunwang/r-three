import { useEffect, useRef } from "react";

export default function Slider({
  value,
  onChange,
}: {
  value: number;
  onChange: (val: number) => void;
}) {
  const isDragging = useRef(false);
  const trackRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onMove = (e: MouseEvent | TouchEvent) => {
      if (!isDragging.current || !trackRef.current) return;
      const clientX = "touches" in e ? e.touches[0].clientX : e.clientX;
      const rect = trackRef.current.getBoundingClientRect();
      const x = Math.max(0, Math.min(clientX - rect.left, rect.width));
      const percentage = x / rect.width;
      onChange(percentage);
    };
    const onUp = () => {
      isDragging.current = false;
      document.body.style.cursor = "";
    };
    window.addEventListener("mousemove", onMove);
    window.addEventListener("touchmove", onMove);
    window.addEventListener("mouseup", onUp);
    window.addEventListener("touchend", onUp);
    return () => {
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("touchmove", onMove);
      window.removeEventListener("mouseup", onUp);
      window.removeEventListener("touchend", onUp);
    };
  }, [onChange]);

  const onDown = (e: React.MouseEvent | React.TouchEvent) => {
    isDragging.current = true;
    document.body.style.cursor = "ew-resize";
    const clientX = "touches" in e ? e.touches[0].clientX : e.clientX;
    if (trackRef.current) {
      const rect = trackRef.current.getBoundingClientRect();
      const x = Math.max(0, Math.min(clientX - rect.left, rect.width));
      onChange(x / rect.width);
    }
  };

  return (
    <div
      ref={trackRef}
      style={{
        position: "absolute",
        top: 0,
        left: 0,
        width: "100%",
        height: "100%",
        zIndex: 10,
        cursor: "ew-resize",
        pointerEvents: "none",
      }}
    >
      <div
        style={{
          position: "absolute",
          left: `${value * 100}%`,
          top: 0,
          bottom: 0,
          width: "4px",
          background: "white",
          transform: "translateX(-50%)",
          pointerEvents: "auto",
          cursor: "ew-resize",
          boxShadow: "0 0 10px rgba(0,0,0,0.5)",
        }}
        onMouseDown={onDown}
        onTouchStart={onDown}
      >
        <div
          style={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            width: "32px",
            height: "32px",
            background: "white",
            borderRadius: "50%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            boxShadow: "0 2px 5px rgba(0,0,0,0.2)",
          }}
        >
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <path d="M15 18l-6-6 6-6" />
            <path
              d="M9 18l6-6-6-6"
              transform="rotate(180 12 12) translate(6 0)"
            />
          </svg>
        </div>
      </div>
    </div>
  );
}
