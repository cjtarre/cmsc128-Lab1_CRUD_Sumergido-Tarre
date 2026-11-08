import { useState } from "react";

import { getDisplayName } from "../../../../shared/utils/userUtils";
import { EDITABLE_PROJECT_ROLES } from "../../constants/projectOptions";

// Direct two-choice role control, shown only to project owners by ProjectMembers.
function MemberRoleToggle({ member, onChange }) {
    const [updating, setUpdating] = useState(false);

    const changeTo = async (role) => {
        if (updating || role === member.role) return;
        setUpdating(true);
        try {
            await onChange(member.user_id, role);
        } finally {
            setUpdating(false);
        }
    };

    return (
        <div
            role="group"
            aria-label={`Role for ${getDisplayName(member)}`}
            aria-busy={updating}
            className="inline-flex h-8 shrink-0 items-center gap-0.5 rounded-xl border border-white/80 bg-white/55 p-0.5 shadow-sm dark:border-white/10 dark:bg-white/[0.04]"
        >
            {EDITABLE_PROJECT_ROLES.map((role) => (
                <button
                    key={role}
                    type="button"
                    aria-pressed={member.role === role}
                    disabled={updating}
                    onClick={() => changeTo(role)}
                    className={`h-7 rounded-lg px-2 text-[10px] font-medium capitalize transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-300 disabled:cursor-wait disabled:opacity-60 dark:focus-visible:ring-green-800 ${
                        member.role === role
                            ? "bg-green-100/85 text-green-700 shadow-sm dark:bg-green-950/60 dark:text-green-300"
                            : "text-slate-500 hover:bg-white/75 hover:text-slate-700 dark:text-slate-400 dark:hover:bg-white/[0.07] dark:hover:text-slate-200"
                    }`}
                    style={{ appearance: "none", WebkitAppearance: "none", fontFamily: "inherit", fontSize: "10px", lineHeight: "1.15" }}
                >
                    {role}
                </button>
            ))}
        </div>
    );
}

export default MemberRoleToggle;
