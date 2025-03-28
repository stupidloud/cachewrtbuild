const core = require("@actions/core");
const { execSync } = require("child_process");
const path = require("path");
const cache = require("@actions/cache");

function parseBooleanInput(value, defaultValue = false) {
    const normalized = value.trim().toLowerCase();
    return { 'true': true, 'false': false }[normalized] ?? defaultValue;
}

async function saveCache() {
    try {
        const skipSaving = parseBooleanInput(core.getInput("skip_saving"));
        const cacheState = core.getState("CACHE_STATE");

        if (cacheState !== "hit" && !skipSaving) {
            const paths = [];
            const mixkey = core.getInput("mixkey");
            let keyString = mixkey ? `${mixkey}-cache-openwrt` : "cache-openwrt";

            const prefix = core.getInput("prefix");
            if (prefix) {
                process.chdir(prefix);
                core.debug(`Changed working directory to: ${prefix}`);
            }

            const cacheToolchain = parseBooleanInput(core.getInput("toolchain"), true);
            if (cacheToolchain) {
                const toolchainHash = execSync(
                    'git log --pretty=tformat:"%h" -n1 tools toolchain'
                ).toString().trim();

                keyString += `-${toolchainHash}`;
                paths.push(
                    path.join("staging_dir", "host*"),
                    path.join("staging_dir", "tool*")
                );
            }

            const cacheCcache = parseBooleanInput(core.getInput("ccache"));
            if (cacheCcache) {
                const timestamp = execSync("date +%s").toString().trim();
                keyString += `-${timestamp}`;
                paths.push(".ccache");
            }

            console.log(keyString);

            await cache.saveCache(paths, keyString)
                .then(res => {
                    if (res) console.log(res, " cache saved");
                })
                .catch(err => core.error(`Cache save failed: ${err.stack}`));
        }
    } catch (error) {
        core.warning(error.message);
    }
}

saveCache();
