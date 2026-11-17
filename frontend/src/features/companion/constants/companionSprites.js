import { COMPANION_STATE } from "../companionStates";

import idle1 from "../assets/pet/idle_1.png";
import idle2 from "../assets/pet/idle_2.png";

import walk1 from "../assets/pet/walk_1.png";
import walk2 from "../assets/pet/walk_2.png";
import walk3 from "../assets/pet/walk_3.png";
import walk4 from "../assets/pet/walk_4.png";
import walk5 from "../assets/pet/walk_5.png";

import sleeping from "../assets/pet/sleeping.png";

import celebrate1 from "../assets/pet/celebrate_1.png";
import celebrate2 from "../assets/pet/celebrate_2.png";

import concerned from "../assets/pet/concerned.png";
import reacting from "../assets/pet/reacting.png";

import held1 from "../assets/pet/held_1.png";
import held2 from "../assets/pet/held_2.png";

import landing1 from "../assets/pet/landing_1.png";
import landing2 from "../assets/pet/landing_2.png";

export const COMPANION_FRAMES = {
    [COMPANION_STATE.IDLE]: [idle1, idle2],
    [COMPANION_STATE.WALKING]: [walk1, walk2, walk3, walk4, walk5],
    [COMPANION_STATE.SLEEPING]: [sleeping],
    [COMPANION_STATE.CELEBRATING]: [celebrate1, celebrate2],
    [COMPANION_STATE.CONCERNED]: [concerned],
    [COMPANION_STATE.REACTING]: [reacting],
    [COMPANION_STATE.HELD]: [held1, held2],
    [COMPANION_STATE.LANDING]: [landing1, landing2],
};

export const COMPANION_FRAME_INTERVALS = {
    [COMPANION_STATE.IDLE]: 1200,
    [COMPANION_STATE.WALKING]: 280,
    [COMPANION_STATE.CELEBRATING]: 300,
    [COMPANION_STATE.HELD]: 350,
    [COMPANION_STATE.LANDING]: 250,
};
