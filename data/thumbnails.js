import { stat } from "fs/promises";
import { runShell, RELEVANT_ARCS } from "../src/shared.js";

const THUMBNAIL_CACHE = "data/cache/thumbnails"
const LINKS = [
    "https://pixeldrain.com/api/list/6VyLVkB2/zip",
    "https://pixeldrain.com/api/list/jVhFqouN/zip",
    "https://pixeldrain.com/api/list/NwJKTg21/zip",
    "https://pixeldrain.com/api/list/KztkSCuY/zip",
    "https://pixeldrain.com/api/list/TuZJgwRL/zip",
    "https://pixeldrain.com/api/list/4AN9Xxht/zip",
    "https://pixeldrain.com/api/list/oa8oZvZx/zip",
    "https://pixeldrain.com/api/list/MH7AQkgr/zip",
    "https://pixeldrain.com/api/list/ZQhstabS/zip",
    "https://pixeldrain.com/api/list/A1jFtPvQ/zip",
    "https://pixeldrain.com/api/list/f8HTXmAk/zip",
    "https://pixeldrain.com/api/list/totP9Xmm/zip",
    "https://pixeldrain.com/api/list/AyvkmFFZ/zip",
    "https://pixeldrain.com/api/list/QZw3Ejpy/zip",
];

for (let i=0; i < LINKS.length; i++) {
    const link = LINKS[i];
    await runShell(`curl -o ${} "${link}"`, {cwd: });
}

// Thanks to https://shotstack.io/learn/use-ffmpeg-to-trim-video/ & https://superuser.com/a/484860
//ffmpeg -i episode.mp4  -an -ss 00:03:00 -t 00:00:00.040 '%01d.png'