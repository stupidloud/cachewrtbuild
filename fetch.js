const core = require("@actions/core");
const { execSync } = require("child_process");
const path = require("path");
const cache = require("@actions/cache");

function parseBooleanInput(value, defaultValue = false) {
    const normalized = value.trim().toLowerCase();
    return { 'true': true, 'false': false }[normalized] ?? defaultValue;
}

async function fetchCache() {
    try {
        const paths = [];
        const restoreKeys = [];

        const mixkey = core.getInput("mixkey");
        const prefix = core.getInput("prefix");
        const cleanUpCache = parseBooleanInput(core.getInput("clean"));

        if (cleanUpCache) return;

        if (prefix) {
            process.chdir(prefix);
            core.debug(`Changed working directory to: ${prefix}`);
        }

        let keyString = mixkey ? `${mixkey}-cache-openwrt` : "cache-openwrt";

        const cacheToolchain = parseBooleanInput(core.getInput("toolchain"), true);
        const skipBuildingToolchain = parseBooleanInput(core.getInput("skip"), true);

        if (cacheToolchain) {
            const toolchainHash = execSync('git log --pretty=tformat:"%h" -n1 tools toolchain')
                .toString()
                .trim();

            keyString += `-${toolchainHash}`;
            paths.push(
                path.join("staging_dir", "host*"),
                path.join("staging_dir", "tool*")
            );
        } else {
            core.debug("Skipping toolchain processing");
        }

        const cacheCcache = parseBooleanInput(core.getInput("ccache"));
        if (cacheCcache) {
            const timestamp = execSync("date +%s").toString().trim();
            restoreKeys.unshift(keyString);
            keyString += `-${timestamp}`;
            paths.push(".ccache");
        }

        core.debug(`Cache paths: ${paths.join(", ")}`);
        console.log(keyString, restoreKeys);

        const cacheFetchingResult = await cache.restoreCache(paths, keyString, restoreKeys);

        if (cacheFetchingResult) {
            core.info(`${cacheFetchingResult} cache fetched!`);
            core.setOutput("hit", "1");
            core.saveState("CACHE_STATE", "hit");

            if (cacheToolchain && skipBuildingToolchain) {
                execSync("sed -i 's/ $(tool.*\\/stamp-compile)//;' Makefile");
                execSync("sed -i 's/ $(tool.*\\/stamp-install)//;' Makefile");
                core.info("Toolchain building skipped");
            }
        }
    } catch (error) {
        core.setFailed(error.message);
        process.exit(1);
    }
}

fetchCache();