import { ArrowUpDown } from "lucide-react";

function SortButtonToggle({ label, activeLabel, onClick }) {
    return (
        <button
            type="button"
            onClick={onClick}
            className="flex items-center gap-1 text-[10px] font-semibold uppercase tracking-wider text-slate-400 transition hover:text-slate-600"
        >
            <span className="text-[10px] font-semibold uppercase tracking-wider">
                {label}
            </span>
            
            <ArrowUpDown size={10} />
            {activeLabel && (
                <span className="text-[10px] font-semibold normal-case tracking-wider text-green-600">({activeLabel})</span>
            )}
        </button>
    );
}

export default SortButtonToggle;