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

let lastSeason = relevantArcs[0];
let seasonIndex = 1;
const outSubs = {};
const outMeta = {};


const REGEX_FIRSTLINE = /Dialogue.*(,,|})(?<first>(?!.*?Your media player).+?)({|$)/m
const AUTOMATIC_OVERRIDES = [
    "[527-528] Impel Down 02 [720p].ass",
    "[529-531] Impel Down 03 [720p].ass",
    "[532-533] Impel Down 04 [720p].ass",
    "[534-536] Impel Down 05 [720p].ass",
    "[537-538] Impel Down 06 [720p].ass",
    "[539-540] Impel Down 07 [720p].ass",
    "[541-543] Impel Down 08 [720p].ass",
    "[544-546] Impel Down 09 [720p].ass",
    "[547-548] Impel Down 10 [720p].ass",
    "[593-594] Post War 07 [1080p].ass",
    "[595-597] Post War 08 [1080p].ass",
    "[865-866] Whole Cake Island 22 [720p].ass",
    "[867-868] Whole Cake Island 23 [720p].ass",
    "[898-900] Whole Cake Island 38 [720p].ass",
    "[901-902] Whole Cake Island 39 [720p].ass",
    "[943-944] Wano 23 [1080p].ass",
    "[951-952] Wano 28 [1080p].ass",
    "[957] Wano 32 [1080p].ass",
    "[801-803] Zou 01 [720p].ass",
    "[638-639] Fishman Island 18 [720p].ass",
    "[640-641] Fishman Island 19 [720p].ass",
    "[642-645] Fishman Island 20 [720p].ass",
    "[643-646] Fishman Island 21 [720p].ass",
    "[647-649] Fishman Island 22 [720p].ass",
    "[650-651] Fishman Island 23 [720p].ass",
    "[652-653] Fishman Island 24 [720p].ass",
    ""
].map(file => "data/cache/one-pace-public-subtitles/main/Release/Final Subs/[One Pace]" + file);
const MANUAL_OVERRIDES = {
    "data/cache/one-pace-public-subtitles/main/Release/Final Subs/[One Pace][879-880] Whole Cake Island 29 [720p].ass": "Zero Escape",
    /*"data/cache/one-pace-public-subtitles/main/Release/Final Subs/[One Pace][614-615] Fishman Island 07 [720p].ass": "The Shirahoshi Kidnapping Incident and The Curse of the Mato Mato!",
    "data/cache/one-pace-public-subtitles/main/Release/Final Subs/[One Pace][616-618] Fishman Island 08 [720p].ass": "The Beginning of the Vengeful Plan! Zoro vs. Hody!",
    "data/cache/one-pace-public-subtitles/main/Release/Final Subs/[One Pace][619-620] Fishman Island 09 [720p].ass": "At the Sea Forest! Arlong and Hody",
    "data/cache/one-pace-public-subtitles/main/Release/Final Subs/[One Pace][621-622] Fishman Island 10 [720p].ass": "Otohime, Fisher Tiger, and the Sun Pirates! The Fateful Encounter!",*/
};

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
        // Begin episode title fallbacks: episodes without 
        if (Object.keys(MANUAL_OVERRIDES).includes(subtitlePath)) {
            episodeTitle = MANUAL_OVERRIDES[subtitlePath]
        } else if (AUTOMATIC_OVERRIDES.includes(subtitlePath)) {
            episodeTitle = '*"' + readFileSync(subtitlePath, {encoding: "utf-8"}).match(REGEX_FIRSTLINE).groups.first + '"'
        }  else if (subtitlePath.includes("Dressrosa 1") || subtitlePath.includes("Punk Hazard") || subtitlePath.includes("Marineford")) {
            episodeTitle = "Im"
        } else {
            console.log(subtitlePath)
            const subContent = readFileSync(subtitlePath, {encoding: "utf-8"});
            const titles = (subContent.match(/Dialogue.*?Title(,|-).*/gm) || subContent.match(/Dialogue.*?title(,|-)[^ ]*?,.*/gm))
                .map(fullLine => {
                    // TODO: cleaner
                    const found = Array.from(fullLine.matchAll(/(?<=}|[0-9],,).*?(?={|$)/g))
                        .filter(value => value[0].trim() != "")
                    if (found.length != 1) {
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
            console.log(titles)
            // If there are 2 titles in a Fishman Island episode, take the first title
            if (subtitlePath.includes("Fishman Island") && titles.length == 1) {
                console.log("Remove from titles!")
                titles.shift();
            }

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