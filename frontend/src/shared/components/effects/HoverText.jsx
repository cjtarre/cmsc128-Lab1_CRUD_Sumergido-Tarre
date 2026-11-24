import { useState } from "react";

function HoverText({ text, className = "" }) {
    const [active, setActive] = useState(-1);
    const [cursor, setCursor] = useState({ x: 0, y: 0 });

    const handleMouseMove = (event) => {
        const spans = event.currentTarget.querySelectorAll("span[data-letter]");
        let hovered = -1;

        spans.forEach((span, index) => {
            const rect = span.getBoundingClientRect();

            if (
                event.clientX >= rect.left &&
                event.clientX <= rect.right &&
                event.clientY >= rect.top &&
                event.clientY <= rect.bottom
            ) {
                hovered = index;
            }
        });

        setActive(hovered);
        setCursor({
            x: event.clientX,
            y: event.clientY,
        });
    };

    return (
        <div
            className={`relative flex cursor-none justify-center ${className}`}
            onMouseMove={handleMouseMove}
            onMouseLeave={() => setActive(-1)}
        >
            {text.split("").map((char, index) => (
                <span
                    key={index}
                    data-letter
                    className="inline-block transition-all duration-150 ease-out"
                    style={{
                        transform:
                            active === index
                                ? "translateY(-18px) scale(1.12) rotate(-5deg)"
                                : "translateY(0) scale(1) rotate(0)",
                    }}
                >
                    {char === " " ? "\u00A0" : char}
                </span>
            ))}

            {active !== -1 && (
                <span
                    className="pointer-events-none fixed z-50 h-4 w-4 -translate-x-1/2 -translate-y-1/2 rounded-full bg-green-400 opacity-70"
                    style={{
                        left: cursor.x,
                        top: cursor.y,
                    }}
                />
            )}
        </div>
    );
}

export default HoverText;