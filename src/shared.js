const BASE_REGEX = "] (?<season>[^0-9]*?)( -|) (?<episode>[0-9]+)";
export const REGEX_FILENAME = new RegExp(BASE_REGEX)
export const REGEX_LANG = new RegExp(BASE_REGEX + ".*?(?<lang>[^ \\[\\]]*)\\.ass");
export const ID = "muhnpace";

export const RELEVANT_ARC_DO_NOT_DETECT = "DO_NOT_DETECT_";

export const RELEVANT_ARCS = [
    "Enies Lobby",  // 1 for Stremio, 17 for One Pace, 0 for the list
    "Post-Enies Lobby",  // 2, 18
    "Thriller Bark",  // 3, 19
    "Sabaody Archipelago",  // 4, 20
    "Amazon Lily",  // 5, 21
    "Impel Down",  // 6, 22
    "Marineford",  // 7, 23
    "Post War",  // 8, 24 | Muhn pace: Post Marineford, sometimes post war? | One Pace: Post War new/Post-war old
    RELEVANT_ARC_DO_NOT_DETECT + "Return to sabaody",  // 9, 25 Return to sabaody, fully on one pace. Don't detect, but add for season index
    "Fishman Island",  // 10, 26
    "Punk Hazard",  // 11, 27
    "Dressrosa",  // 12, 28
    "Zou",  // 13, 29
    "Whole Cake Island",  // 14, 30
    RELEVANT_ARC_DO_NOT_DETECT + "Reverie",  // 15, 31 Reverie, fully on one pace. Don't detect, but add for season index
    "Wano"  // 16, 32
]

export function createId(seasonIndex, episode, seperator=":"){
    return `${ID}${seperator}${seasonIndex}${seperator}${episode.padStart(2, "0")}`;
}

//let spawn;
import {spawn} from "child_process"
export async function runShell(command, args={}) {
    // Conditionally load spawn
    if (spawn == undefined) { spawn = ((await import("child_process")).spawn) }
    console.log("Running " + command)
    return new Promise((resolve, reject) => {
        // Thanks to https://stackoverflow.com/a/32872753
        const instance = spawn(command, Object.assign({shell: true}, args))
            .on("close", (code, signal) => {
                resolve()
            })
        instance.stdout.setEncoding("utf-8")
        instance.stdout.on("data", msg => {
            console.log(msg)
        })
        instance.stderr.setEncoding("utf-8");
        instance.stderr.on("data", msg => {
            console.error(msg)
        });
    })
}
