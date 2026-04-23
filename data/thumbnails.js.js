const LINKS = require("./links.json");
const CACHE_DIR = "data/cache/"

let out = `
document.body.innerHTML = '<video id="video" src=""></video><a id="download"></a>';
const canvas = document.createElement("canvas");
let link;

const LINKS = JSON.parse(\`${JSON.stringify(LINKS).replace(/\?download/g, "")}\`);
const video = document.getElementById("video");
const download = document.getElementById("download");

function nextEpisode() {
    link = LINKS.shift();
    video.src = link.url;
    video.currentTime = 180;

    if (LINKS.length == 0) {
        console.log("Done!")
    } else {
        //grabThumbnail()
    }
}

video.addEventListener("seeked", (e) => {
    console.log("Seeked!")

    console.log(link.name)
    grabThumbnail();
});

function grabThumbnail() {
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    console.log(canvas.width)
    console.log(canvas.height)
    const context = canvas.getContext("2d");
    context.drawImage(video, 0, 0, canvas.width, canvas.height);

    download.href = canvas.toDataURL("image/jpeg");
    download.download = link.name.replace(".mp4", ".jpeg");
    download.click();
    nextEpisode();
}

nextEpisode();
`

console.log(out)

console.log("-----")
console.log("Step 1: Run this script in the Firefox console on https://pixeldrain.com")
console.log("Step 2: move the contents into stremio-muhn-pace-data/" + CACHE_DIR)
console.log("Step 3: re-run this script!")

const { globSync } = require("fs");

const files = globSync(`${CACHE_DIR}/*.jpeg`);
let seasonIndex = 1;
if (files.length > 0) {
    const {renameSync, rename, existsSync} = require("fs");
    const {copyFile} = require("fs/promises");
    const {RELEVANT_ARCS, REGEX_FILENAME, RELEVANT_ARC_DO_NOT_DETECT, createId} = require("../src/shared.js");

    const ARCS = RELEVANT_ARCS.map(value => {
        switch (value) {
            case "Post-Enies Lobby":
                return "Post Enies Lobby"
            case "Thriller Bark":
                return "Thrillerbark"
            default:
                return value
        }
    })
    const toRename = CACHE_DIR + "[V2][DUB][632-633] Fishman Island 15 (FIXED GROUP SHOT) [1080p].jpeg";
    if (existsSync(toRename)) {
        renameSync(toRename, CACHE_DIR + "[Muhnpace] Fishman Island 15 [1080p].jpeg")
    }

    for (let i=0; i < RELEVANT_ARCS.length; i++) {
        const arc = ARCS[i];
        if (arc.startsWith(RELEVANT_ARC_DO_NOT_DETECT)) {
            continue;
        }
        const arcThumbnails = globSync(`${CACHE_DIR}*${arc}*.jpeg`);
        if (arcThumbnails.length == 0) {
            throw Error(arc)
        }
        for (const thumbnail of arcThumbnails) {
            const { episode } = thumbnail.match(REGEX_FILENAME).groups;
            copyFile(thumbnail, `images/thumbnails/${createId(i, episode)}.jpeg`)
        }
    }
}
