export const COMPANION_STATE = {
    IDLE: "idle",
    WALKING: "walking",
    SLEEPING: "sleeping",
    CELEBRATING: "celebrating",
    CONCERNED: "concerned",
    REACTING: "reacting",

    // Manual interaction states
    HELD: "held",
    LANDING: "landing",
};

export const COMPANION_TIMING = {
    // The pet should spend most of its time quietly hanging out.
    MIN_IDLE: 5000,
    MAX_IDLE: 10000,

    // Movement should be brief compared with resting time.
    WALK_DURATION: 2200,

    // Sleeping should feel like an actual rest period.
    SLEEP_DURATION: 5000,

    // Short reactions to clicks, completed tasks, etc.
    REACTION_DURATION: 2200,

    // Brief landing animation after being released.
    LANDING_DURATION: 800,
};