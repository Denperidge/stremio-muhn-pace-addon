const BASE_REGEX = "] (?<season>[^0-9]*?)( -|) (?<episode>[0-9]+)";
export const REGEX_FILENAME = new RegExp(BASE_REGEX)
export const REGEX_LANG = new RegExp(BASE_REGEX + ".*?(?<lang>[^ \\[\\]]*)\\.ass");
export const ID = "muhnpace"


export function createId(seasonIndex, episode){
    return `${ID}:${seasonIndex}:${episode.padStart(2, "0")}`;
}