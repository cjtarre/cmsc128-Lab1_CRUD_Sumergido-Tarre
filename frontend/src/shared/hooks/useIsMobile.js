import { useMediaQuery } from "./useMediaQuery";

const MOBILE_QUERY = "(max-width: 639px)";

export function useIsMobile() {
    return useMediaQuery(MOBILE_QUERY);
}
