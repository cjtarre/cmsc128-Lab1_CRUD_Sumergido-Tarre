import { Check, Circle } from "lucide-react";

import { getPasswordRequirements } from "../../../shared/utils/validation";

function PasswordRequirements({ password, embedded = false }) {
    if (!password) return null;

    const requirements = getPasswordRequirements(password);

    const requirementClass = (met) => {
        if (met) {
            return embedded
                ? "text-green-300 dark:text-green-600"
                : "text-green-600 dark:text-green-400";
        }

        return embedded
            ? "text-white/45 dark:text-slate-500"
            : "text-slate-400 dark:text-slate-500";
    };

    return (
        <div className="mt-3 grid gap-x-4 gap-y-1.5 text-xs sm:grid-cols-2">
            {requirements.map(({ key, label, met }) => (
                <div
                    key={key}
                    className={`flex items-center gap-1.5 transition-colors ${requirementClass(met)}`}
                >
                    {met
                        ? <Check size={13} strokeWidth={2.5} />
                        : <Circle size={10} />
                    }
                    <span>{label}</span>
                </div>
            ))}
        </div>
    );
}

export default PasswordRequirements;