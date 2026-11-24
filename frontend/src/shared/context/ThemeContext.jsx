import { createContext, useContext, useEffect, useState } from "react";

const ThemeContext = createContext(null);

export function ThemeProvider({ children }) {
    const [theme, setTheme] = useState(
        () => localStorage.getItem("takdaTheme") || "light"
    );

    const setThemeImmediately = (nextTheme) => {
        const value = typeof nextTheme === "function"
            ? nextTheme(theme)
            : nextTheme;
        const dark = value === "dark";

        document.documentElement.classList.toggle("dark", dark);
        document.documentElement.style.colorScheme = dark ? "dark" : "light";
        document.querySelector('meta[name="theme-color"]')?.setAttribute(
            "content",
            dark ? "#020617" : "#f3f9f5"
        );
        localStorage.setItem("takdaTheme", value);
        setTheme(value);
    };

    useEffect(() => {
        const dark = theme === "dark";
        document.documentElement.classList.toggle("dark", dark);
        document.documentElement.style.colorScheme = dark ? "dark" : "light";
        document.querySelector('meta[name="theme-color"]')?.setAttribute(
            "content",
            dark ? "#020617" : "#f3f9f5"
        );
        localStorage.setItem("takdaTheme", theme);
    }, [theme]);

    return (
        <ThemeContext.Provider value={{ theme, setTheme: setThemeImmediately }}>
            {children}
        </ThemeContext.Provider>
    );
}

// eslint-disable-next-line react-refresh/only-export-components
export function useTheme() {
    return useContext(ThemeContext);
}