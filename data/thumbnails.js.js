const LINKS = require("./links.json");

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
console.log("Step 2: move the contents into stremio-muhn-pace-data/data/cache/")
console.log("Step 3: re-run this script!")

import {globSync} from "fs";
