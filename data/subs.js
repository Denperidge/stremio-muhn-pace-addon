import { spawn } from "child_process";

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

