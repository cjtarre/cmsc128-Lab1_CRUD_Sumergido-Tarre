import { useRef, useState } from "react";

function HoverText({ text, className = "" }) {
    const [active, setActive] = useState(-1);
    const activeRef = useRef(-1);
    const cursorRef = useRef(null);

    const handleMouseMove = (event) => {
        const letter = event.target.closest("[data-letter]");
        const hovered = letter
            ? Number(letter.dataset.letterIndex)
            : -1;

        if (activeRef.current !== hovered) {
            activeRef.current = hovered;
            setActive(hovered);
        }

        if (cursorRef.current) {
            cursorRef.current.style.left = `${event.clientX}px`;
            cursorRef.current.style.top = `${event.clientY}px`;
        }
    };

    return (
        <div
            className={`relative flex cursor-none justify-center ${className}`}
            onMouseMove={handleMouseMove}
            onMouseLeave={() => {
                activeRef.current = -1;
                setActive(-1);
            }}
        >
            {text.split("").map((char, index) => (
                <span
                    key={index}
                    data-letter
                    data-letter-index={index}
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
                    ref={cursorRef}
                    className="pointer-events-none fixed z-50 h-4 w-4 -translate-x-1/2 -translate-y-1/2 rounded-full bg-green-400 opacity-70"
                />
            )}
        </div>
    );
}

export default HoverText;