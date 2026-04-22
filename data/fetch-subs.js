import {writeFileSync} from "fs";
import { REGEX_LANG, createId } from "../src/shared.js";

const api = await (await fetch("https://api.github.com/repos/one-pace/one-pace-public-subtitles/contents/main/Release/Final%20Subs")).json();

const relevantArcs = [
    "Enies Lobby",
    "Post-Enies Lobby",
    "Thriller Bark",
    "Sabaody Archipelago",
    "Amazon Lily",
    "Impel Down",
    "Marineford",
    "Post Marineford",
    "Fishman Island",
    "Punk Hazard",
    "Dressrosa",
    "Zou",
    "Whole Cake Island",
    "Wano"
]

let lastSeason = relevantArcs[0];
let seasonIndex = 1;
const out = {};

// Skip until Enies lobby
const subs = api.filter(result => {
        const name = result.name;
        for (let arc of relevantArcs) {
            if (name.toLowerCase().includes(arc.toLowerCase())) {
                return true;
            }
        }
        return false;
    }).forEach(result => {
    console.log(result.name)

    const {season, episode, lang} = result.name.match(REGEX_LANG).groups;
    
    if (season != lastSeason) {
        seasonIndex++;
        lastSeason = season
    }
    const id = createId(seasonIndex, episode)

    let langCode;  // https://en.wikipedia.org/wiki/List_of_ISO_639-2_codes
    switch (lang) {
        case "":
            langCode = "eng"
            break;
        case "Arabic":
            langCode = "ara";
            break;
        case "Deutsch":
            langCode = "deu"
            break;
        default:
            throw new Error("No langcode set for " + lang)    
    }

    if (!Object.keys(out).includes(id)) {
        out[id] = []
    }

    out[id].push({
        id: id + ":" + langCode,
        lang: langCode,
        url: result.download_url
    })
});


writeFileSync("data/subs.json", JSON.stringify(out), {encoding: "utf-8"})