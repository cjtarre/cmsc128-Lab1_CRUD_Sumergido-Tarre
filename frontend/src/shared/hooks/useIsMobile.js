import { useEffect, useState } from "react";

const MOBILE_QUERY = "(max-width: 639px)";

export function useIsMobile() {
    const [isMobile, setIsMobile] = useState(
        () => window.matchMedia(MOBILE_QUERY).matches
    );

    useEffect(() => {
        const media = window.matchMedia(MOBILE_QUERY);
        const update = () => setIsMobile(media.matches);

        update();
        media.addEventListener("change", update);
        return () => media.removeEventListener("change", update);
    }, []);

    return isMobile;
}
