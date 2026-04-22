// Generate subs.json, containing relevant subtitle links
import {writeFileSync, globSync} from "fs";
import { spawn } from "child_process";
import { REGEX_LANG, createId } from "../src/shared.js";

const SUBTITLE_CACHE = "data/cache/one-pace-public-subtitles";

async function runShell(command, args={}) {
    console.log("Running " + command)
    return new Promise((resolve, reject) => {
        // Thanks to https://stackoverflow.com/a/32872753
        const instance = spawn(command, Object.assign({shell: true}, args))
            .on("error", err => {throw err})
            .on("close", (code, signal) => {
                resolve()
            })
        instance.stdout.setEncoding("utf-8")
        instance.stdout.on("data", msg => {
            console.log(msg)
        })
    })
}

await runShell(`git clone https://github.com/one-pace/one-pace-public-subtitles.git ${SUBTITLE_CACHE}`, {shell: true})

await runShell(`git pull`, {cwd: SUBTITLE_CACHE})

const subFiles = globSync(SUBTITLE_CACHE + "/main/Release/Final Subs/*");

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
subFiles.filter(subtitlePath => {
    for (let arc of relevantArcs) {
        if (subtitlePath.toLowerCase().includes(arc.toLowerCase())) {
            return true;
        }
    }
    return false;
}).forEach(subtitlePath => {
    const {season, episode, lang} = subtitlePath.match(REGEX_LANG).groups;
    
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

    console.log(subtitlePath.replace("data/cache/one-pace-public-subtitles", ""))
    out[id].push({
        id: id + ":" + langCode,
        lang: langCode,
        url: encodeURI("https://raw.githubusercontent.com/one-pace/one-pace-public-subtitles/main" + subtitlePath.replace("data/cache/one-pace-public-subtitles", ""))
    })
});


writeFileSync("data/subs.json", JSON.stringify(out), {encoding: "utf-8"})