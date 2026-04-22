// Generate subs.json, containing relevant subtitle links
import {writeFileSync, globSync, readFileSync} from "fs";
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
    "Post War",  // Muhn pace: Post Marineford | One Pace: Post War new/Post-war old
    "Fishman Island",
    "Punk Hazard",
    "Dressrosa",
    "Zou",
    "Whole Cake Island",
    "Wano"
]

let lastSeason = relevantArcs[0];
let seasonIndex = 1;
const outSubs = {};
const outMeta = {};

// Skip until Enies lobby
subFiles.filter(subtitlePath => {
    for (let arc of relevantArcs) {
        // If relevant arc AND not a duplicate subtitle
        if (subtitlePath.toLowerCase().includes(arc.toLowerCase()) && 
            !subtitlePath.includes("[945]") &&
            !subtitlePath.includes("[962-963] Wano 34")) {
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

    // Only get episode titles from English subtitles (for now? does Stremio support lang title?)
    if (!subtitlePath.endsWith("Arabic.ass") &&
        !subtitlePath.endsWith("Deutsch.ass") &&
        !subtitlePath.endsWith("Italian.ass") &&
        !subtitlePath.endsWith("Polish.ass") &&
        !subtitlePath.endsWith("Portugues.ass") &&
        !subtitlePath.endsWith("Turkish.ass")) {

        let episodeTitle;
        if (subtitlePath.includes("[One Pace][527-528] Impel Down 02")) {
            episodeTitle = "Impel Down Episode 2"
        } else if (subtitlePath.includes("Whole Cake Island 29")) {
            episodeTitle = "Zero Escape"
        } else if (subtitlePath.includes("[One Pace][529-531] Impel Down 03")) {
            episodeTitle = "Impel Down Episode 3"
        } else if (subtitlePath.includes("Impel Down") || subtitlePath.includes("Post War 07") || subtitlePath.includes("Post War 08") || subtitlePath.includes("Arabic") || subtitlePath.includes("Whole Cake Island 38") || subtitlePath.includes("Wano 23") || subtitlePath.includes("Wano 26 [1080p] Arabic") || subtitlePath.includes("Wano 28") || subtitlePath.includes("Wano 32") ||  subtitlePath.includes("Whole Cake Island 39") ||subtitlePath.includes("Fishman Island") || subtitlePath.includes("Dressrosa 1") || subtitlePath.includes("Punk Hazard") || subtitlePath.includes("Marineford") || subtitlePath.includes("Zou 01") || subtitlePath.includes("Whole Cake Island 23")) {
            episodeTitle = "Im"
        } else {
            console.log(subtitlePath)
            const titles = readFileSync(subtitlePath, {encoding: "utf-8"}).match(
                /Dialogue.*?Title(,|-).*/gm)
                .map(fullLine => {
                    // TODO: cleaner
                    const found = Array.from(fullLine.matchAll(/(?<=}|[0-9],,).*?(?={|$)/g))
                        .filter(value => value[0].trim() != "")
                    console.log(found)
                    console.log(fullLine)
                    console.log(subtitlePath)
                    if (found.length != 1) {
                        console.log(found[0][0])
                        if (found.length >= 2 && found[0][0].startsWith("Title card")) {
                            return found[0][0]
                        }
                        throw Error(`Incorrect amount of results for title parsing: ${found.length}`)
                    }
                    return found[0][0]
                }).filter(value => {
                    value = value.toLowerCase()
                    if (value.startsWith("title card") || value.startsWith("editing:") || value == "impel down") {
                        return false;
                    }
                    return true;
                })

            episodeTitle = titles.shift()
            for (let extraTitle of titles) {
                if (episodeTitle != extraTitle) {
                    // [One Pace][527-528] Impel Down 02
                    console.error(`'${episodeTitle}' != '${extraTitle}'`)
                    throw Error("Error when parsing " + subtitlePath)
                }
            }
        }
        if (Object.keys(outMeta).includes(id)) {
            throw new Error("Duplicate episode title adding from " + id)
        }
        outMeta[id] = {
            title: episodeTitle
        }
    }

    if (!Object.keys(outSubs).includes(id)) {
        outSubs[id] = []
    }
    
    //exit()

    console.log(subtitlePath.replace("data/cache/one-pace-public-subtitles", ""))
    outSubs[id].push({
        id: id + ":" + langCode,
        lang: langCode,
        url: encodeURI("https://raw.githubusercontent.com/one-pace/one-pace-public-subtitles/main" + subtitlePath.replace("data/cache/one-pace-public-subtitles", ""))
    })
});


writeFileSync("data/subs.json", JSON.stringify(outSubs), {encoding: "utf-8"})
writeFileSync("data/meta.json", JSON.stringify(outMeta), {encoding: "utf-8"})