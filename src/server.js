const {addonBuilder, serveHTTP} = require("stremio-addon-sdk");
const { env } = require("process");
const { REGEX_FILENAME, ID, createId, RELEVANT_ARCS } = require("./shared")


const LINKS = require("../data/links.json");
const SUBS = require("../data/subs.json");
const META = require("../data/meta.json");
const GO_TO_ONEPACE = require("../data/onepace.json").go_to;

const META_VIDEOS = [];
const STREAMS = {};

for (const goTo of GO_TO_ONEPACE) {
    const seasonIndex = goTo.season;
    
    for (let i=goTo.start; i<= goTo.end; i++) {
        const onepaceId = goTo.onepace_id_prefix + i;
        const muhnpaceId = ID + onepaceId;

        const title = `[One Pace Addon] ${RELEVANT_ARCS[seasonIndex-1]} ${i}`;
        META_VIDEOS.push({
            id: muhnpaceId,
            title: title,
            released: "2010-12-06T05:00:00.000Z",
            season: seasonIndex,
            episode: i,
        });
        STREAMS[muhnpaceId] = { streams: [{
            name: "fedew04 One Pace Addon",
            title: title,
            type: "series",
            externalUrl: `stremio:///detail/series/pp_onepace/${onepaceId}?autoplay=true`
        }]};
    }
}

let seasonIndex = 1;
let lastSeason = LINKS[0].name.match(REGEX_FILENAME).groups["season"];
for (const link of LINKS) {
    const {name, url} = link;
    const {season, episode} = name.match(REGEX_FILENAME).groups;

    console.log("---")
    console.log(link)
    console.log(lastSeason)
    console.log(season)

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


const builder = new addonBuilder({
    id: ID,
    description: "supplement the existing One Pace addons with the Muhn Pace fan project!",
    version: "0.0.1",
    name: "Muhn Pace",
    catalogs: [{
        type: "series",
        id: ID,
        name: "Muhn Pace",
        idPrefixes: [ ID ]
    }],
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
    console.log("catalog")
    console.log(args)
    if (args.type == "series" && args.id == ID) {
        return Promise.resolve({ metas: [{
            id: ID,
            type: "series",
            name: "muhn pace",
            poster: "https://m.media-amazon.com/images/M/MV5BMTNjNGU4NTUtYmVjMy00YjRiLTkxMWUtNzZkMDNiYjZhNmViXkEyXkFqcGc@._V1_FMjpg_UX1024_.jpg"
        }]});
    }    
});

builder.defineMetaHandler(args => {
    console.log("meta")
    console.log(args)
    if (args.type == "series", args.id == ID) {
        return Promise.resolve({meta: {
            id: ID,
            type: "series",
            name: "Muhn Pace",
            videos: META_VIDEOS
        }})
    }
    return Promise.resolve({})
    
})
builder.defineStreamHandler(args => {
    console.log("stream")
    console.log(args)
    if (args.type == "series" && args.id.startsWith(ID)) {
        console.log("that one")
        return Promise.resolve(STREAMS[args.id])
    }
    return Promise.resolve([])

});

builder.defineSubtitlesHandler(args => {
    console.log("subs")
    if (args.type == "series" && args.id.startsWith(ID)) {
        console.log(args)
        console.log(SUBS[args.id])
        return Promise.resolve({subtitles: SUBS[args.id]});
    }
    return Promise.resolve([])
})


serveHTTP(builder.getInterface(), {port: env.PORT || 3636})