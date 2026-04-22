const BASE_REGEX = "] (?<season>[^0-9]*?)( -|) (?<episode>[0-9]+)";
export const REGEX_FILENAME = new RegExp(BASE_REGEX)
export const REGEX_LANG = new RegExp(BASE_REGEX + ".*?(?<lang>[^ \\[\\]]*)\\.ass");
export const ID = "muhnpace"

export const RELEVANT_ARCS = [
    "Enies Lobby",  // 1 for Stremio, 17 for One Pace, 0 for the list
    "Post-Enies Lobby",  // 2
    "Thriller Bark",  // 3
    "Sabaody Archipelago",  // 4
    "Amazon Lily",  // 5
    "Impel Down",  // 6
    "Marineford",  // 7
    "Post War",  // 8 Muhn pace: Post Marineford | One Pace: Post War new/Post-war old
    "Fishman Island",  // 9
    "Punk Hazard",  // 10
    "Dressrosa",  // 11
    "Zou",  // 12
    "Whole Cake Island",  // 13
    "Wano"  // 14
]


export function createId(seasonIndex, episode){
    return `${ID}:${seasonIndex}:${episode.padStart(2, "0")}`;
}