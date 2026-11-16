import { useEffect, useState } from "react";
import { Music2 } from "lucide-react";
import { Link } from "react-router-dom";

import { getFocusPlaylists } from "../../focus/services/focusPlaylistService";

const PROFILE_PLAYLIST_LIMIT = 3;
const sleeves = [
    "from-emerald-950 via-emerald-800 to-teal-500",
    "from-indigo-950 via-indigo-800 to-sky-500",
    "from-rose-950 via-rose-800 to-orange-500",
];

function ProfileFocusPlaylists() {
    const [playlists, setPlaylists] = useState([]);
    const [status, setStatus] = useState("loading");

    useEffect(() => {
        const controller = new AbortController();
        getFocusPlaylists(controller.signal).then((saved) => {
            if (controller.signal.aborted) return;
            setPlaylists(saved);
            setStatus("ready");
        }).catch(() => {
            if (!controller.signal.aborted) setStatus("error");
        });
        return () => controller.abort();
    }, []);

    return (
        <section aria-labelledby="profile-focus-playlists"
            className="overflow-hidden rounded-2xl border border-white/70 bg-white/85 shadow-[0_10px_30px_rgba(15,23,42,0.05)] backdrop-blur-xl dark:border-white/10 dark:bg-slate-900/85 dark:shadow-black/20">
            <div className="flex flex-wrap items-center gap-3 border-b border-slate-100/80 px-5 py-4 dark:border-white/[0.07] sm:px-6">
                <span className="grid size-9 shrink-0 place-items-center rounded-lg bg-green-50 text-green-800 dark:bg-green-950 dark:text-green-300">
                    <Music2 size={17} aria-hidden="true" />
                </span>
                <h3 id="profile-focus-playlists" className="mr-auto text-sm font-semibold text-slate-800 dark:text-slate-100">
                    Saved focus playlists
                </h3>
                <Link to="/focus" className="text-xs font-medium text-green-800 hover:underline dark:text-green-300">
                    {playlists.length > PROFILE_PLAYLIST_LIMIT ? "View all in Focus Mode" : "Open Focus Mode"}
                </Link>
            </div>

            <div className="px-5 py-4 sm:px-6">
                {status === "loading" && <p role="status" className="text-xs text-slate-600 dark:text-slate-400">Loading playlists…</p>}
                {status === "error" && <p role="status" className="text-xs text-slate-600 dark:text-slate-400">Your playlists couldn’t load.</p>}
                {status === "ready" && playlists.length === 0 && (
                    <p className="text-xs text-slate-600 dark:text-slate-400">Save a playlist in Focus Mode to find it here.</p>
                )}
                {playlists.length > 0 && (
                    <ul className="grid grid-cols-2 gap-x-4 gap-y-5 sm:grid-cols-3 sm:gap-x-6">
                        {playlists.slice(0, PROFILE_PLAYLIST_LIMIT).map(({ id, name }, index) => (
                            <li key={id} className="min-w-0">
                                <Link to={`/focus?playlist=${encodeURIComponent(id)}`} title={name} aria-label={name}
                                    className="group relative block aspect-[4/3] w-full max-w-48 rounded-sm focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-green-700">
                                    <span aria-hidden="true"
                                        className="absolute top-1/2 right-1 grid aspect-square w-[69%] -translate-y-1/2 place-items-center rounded-full bg-slate-950 shadow-md transition-transform group-hover:translate-x-1 group-focus-visible:translate-x-1 motion-reduce:transition-none">
                                        <span className="absolute inset-[7%] rounded-full border border-white/20" />
                                        <span className="absolute inset-[15%] rounded-full border border-white/15" />
                                        <span className="absolute inset-[24%] rounded-full border border-white/15" />
                                    </span>
                                    <span className={`relative isolate flex aspect-square w-3/4 flex-col justify-end overflow-hidden rounded-sm bg-linear-to-br p-2.5 text-white shadow-md sm:p-3 ${sleeves[index]}`}>
                                        <span aria-hidden="true" className="absolute -top-1/4 -right-1/4 -z-10 aspect-square w-full rounded-full border border-white/30 bg-white/10" />
                                        <span aria-hidden="true" className="absolute top-[9%] left-[10%] h-px w-1/4 bg-white/65" />
                                        <span className="line-clamp-4 text-xs leading-snug font-semibold break-words sm:text-sm">{name}</span>
                                    </span>
                                </Link>
                            </li>
                        ))}
                    </ul>
                )}
            </div>
        </section>
    );
}

export default ProfileFocusPlaylists;
