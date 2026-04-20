const {addonBuilder, serveHTTP} = require("stremio-addon-sdk");
const { env } = require("process");

const ID = "muhnpace"
const REGEX_FILENAME = /] (?<season>[^0-9]*?)( -|) (?<episode>[0-9]+)/

const LINKS = require("./links.json")//.map(link => {return {url: link.url}});

const META_VIDEOS = [];
const STREAMS = {};
let seasonIndex = 1;
let lastSeason = LINKS[0].name.match(REGEX_FILENAME).groups["season"];
for (const link of LINKS) {
    const {name, url} = link;
    console.log(`Parsing ${name}`)
    const {season, episode} = name.match(REGEX_FILENAME).groups;

    if (lastSeason != season) {
        lastSeason = season;
        seasonIndex++;
    }


    const id = `${ID}+:${seasonIndex}:${episode}`
    const title = `${season} - ${episode}`;

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
    resources: ["catalog", "stream", "meta"],
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
        console.log("ee")
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


serveHTTP(builder.getInterface(), {port: env.PORT || 3636})