import {writeFileSync} from "fs";
import { REGEX_LANG } from "./shared.js";

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

// Skip until Enies lobby
const subs = api.filter(result => {
        const name = result.name;
        for (let arc of relevantArcs) {
            if (name.toLowerCase().includes(arc.toLowerCase())) {
                return true;
            }
        }
        return false;
    }).map(result => {
    console.log(result.name)

    const {season, episode, lang} = result.name.match(REGEX_LANG).groups;
    
    return {
        season: season,
        episode: parseInt(episode),
        lang: lang == "" ? "English" : lang,
        url: result.download_url
    }
});


writeFileSync("subs.json", JSON.stringify(subs), {encoding: "utf-8"})