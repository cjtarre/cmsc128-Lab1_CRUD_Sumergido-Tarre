import { useEffect, useState } from "react";

const identity = (value) => value;

export function useSyncedQueryState(queryData, transform = identity) {
    const [state, setState] = useState(() => {
        if (!Array.isArray(queryData)) return [];
        return transform(queryData);
    });

    useEffect(() => {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setState(Array.isArray(queryData) ? transform(queryData) : []);
    }, [queryData, transform]);

    return [state, setState];
}
