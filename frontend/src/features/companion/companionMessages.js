export const COMPANION_MESSAGES = {
    idle: [
        "What are we doing next?",
        "I'm here if you need me!",
        "One task at a time.",
    ],
    walking: [
        "Just exploring...",
        "Where should I sit?",
    ],
    sleeping: [
        "Zzz...",
        "Five more minutes...",
    ],
    celebrating: [
        "Task complete! ?",
        "We did it!",
        "Nice work!",
        "Another one done!",
    ],
    concerned: [
        "We have something overdue...",
        "Should we tackle that overdue task?",
        "We can still catch up!",
    ],
    reacting: [
        "Hi!",
        "Hehe!",
        "You found me!",
        "Let's get things done!",
    ],
};

export function getRandomMessage(state) {
    const messages = COMPANION_MESSAGES[state] || [];
    if (messages.length === 0) return "";

    return messages[Math.floor(Math.random() * messages.length)];
}
