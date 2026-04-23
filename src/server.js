/* ----- IMPORTS ----- */
const { env } = require("process");
const { addonBuilder, serveHTTP } = require("stremio-addon-sdk");
const { REGEX_FILENAME, ID, createId, RELEVANT_ARCS, RELEVANT_ARC_DO_NOT_DETECT } = require("./shared")

const SUBS = require("../data/subs.json");
const META = require("../data/meta.json");

/* ----- CONSTANTS ----- */
const IMAGE_BASE_URL = "https://raw.githubusercontent.com/Denperidge/stremio-muhn-pace-addon/main/images/";

const DESCRIPTION = "Supplement the existing One Pace addons with the Muhn Pace fan project!";
const LOGO = IMAGE_BASE_URL + "logo.png";
const POSTER = IMAGE_BASE_URL + "poster.jpg";
const BACKGROUND = IMAGE_BASE_URL + "background.jpg";
const CATALOGS = [{
    type: "series",
    name: "Muhn Pace",
    id: ID,
    idPrefixes: [ ID ],
    logo: LOGO,
    poster: POSTER,
    background: BACKGROUND
}];

/* ----- STARTUP DATA FUNCTIONS & VARS ----- */
const META_VIDEOS = [];
const STREAMS = {};

function loadMuhnPaceData() {
    console.log("Loading Muhn Pace links...");
    const LINKS = require("../data/links.json");

    let seasonIndex = 1;
    let lastSeason = LINKS[0].name.match(REGEX_FILENAME).groups["season"];
    for (const link of LINKS) {
        const {name, url} = link;
        const {season, episode} = name.match(REGEX_FILENAME).groups;

        if (lastSeason != season) {
            lastSeason = season;
            seasonIndex++;
        }

        const id = createId(seasonIndex, episode)
        const title = (seasonIndex == 14 && parseInt(episode) >= 46) ? `Wano ${episode}`: META[id].title;

        META_VIDEOS.push({
            id: id,
            title: title,
            released: "2010-12-06T05:00:00.000Z",
            season: seasonIndex,
            episode: parseInt(episode),
        });
        STREAMS[id] = { streams: [{
            name: "Pixeldrain",
            title: title,
            type: "series",
            url: url
        }]};
    }
    console.log("Loaded Muhn Pace links!");
}

function loadOnePaceData() {
    console.log("Loading needed One Pace links...");
    const GO_TO_ONEPACE = require("../data/onepace.json").go_to;
    
    for (const goTo of GO_TO_ONEPACE) {
        const seasonIndex = goTo.season;
        
        for (let i=goTo.start; i<= goTo.end; i++) {
            const onepaceId = goTo.onepace_id || goTo.onepace_id_prefix + i;
            const muhnpaceId = createId(seasonIndex, i.toString());

            let title;
            if (Object.keys(META).includes(muhnpaceId)) {
                title = META[muhnpaceId].title
            } else {
                title = `${RELEVANT_ARCS[seasonIndex-1].replace(RELEVANT_ARC_DO_NOT_DETECT, "")} ${i}`;
            }
            title = "[One Pace Addon] " + title
            META_VIDEOS.push({
                id: muhnpaceId,
                title: title,
                released: "2010-12-06T05:00:00.000Z",
                season: seasonIndex,
                episode: i
            });
            STREAMS[muhnpaceId] = { streams: [{
                name: "fedew04 One Pace Addon",
                title: title,
                type: "series",
                externalUrl: `stremio:///detail/series/pp_onepace/${onepaceId}?autoplay=true`
            }]};
        }
    }
    console.log("Loaded needed One Pace links!");
}

/* ----- STREMIO API/SDK ----- */
// See https://github.com/Stremio/stremio-addon-sdk/tree/master/docs/
const builder = new addonBuilder({
    id: ID,
    description: DESCRIPTION,
    version: "0.0.1",
    name: "Muhn Pace",
    logo: LOGO,
    background: BACKGROUND,
    catalogs: CATALOGS,
    resources: ["catalog", "stream", "meta", "subtitles"],
    types: ["series"],
    extra: [
        {
            name: "search",
            isRequired: false
        }
    ]
});

builder.defineCatalogHandler(args => {
    if (args.type == "series" && args.id == ID) {
        return Promise.resolve({ metas: CATALOGS});
    }
    return Promise.resolve([]);
});

builder.defineMetaHandler(args => {
    if (args.type == "series", args.id == ID) {
        return Promise.resolve({meta: {
            id: ID,
            type: "series",
            name: "Muhn Pace",
            description: DESCRIPTION,
            videos: META_VIDEOS,
            logo: LOGO,
            poster: POSTER,
            background: BACKGROUND
        }})
    }
    return Promise.resolve({})
});

builder.defineStreamHandler(args => {
    if (args.type == "series" && args.id.startsWith(ID)) {
        return Promise.resolve(STREAMS[args.id])
    }
    return Promise.resolve([])
});

builder.defineSubtitlesHandler(args => {
    if (args.type == "series" && args.id.startsWith(ID)) {
        return Promise.resolve({subtitles: SUBS[args.id]});
    }
    return Promise.resolve([])
});

/* ----- LOAD DATA & START SERVER ----- */
loadMuhnPaceData();
loadOnePaceData();

serveHTTP(builder.getInterface(), {port: env.PORT || 3636});
