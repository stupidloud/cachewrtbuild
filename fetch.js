import * as core from "@actions/core";
import { execSync } from "node:child_process";
import * as cache from "@actions/cache";
import { buildBaseConfig } from "./utils.js";

try {
    const cleanUpCache = core.getBooleanInput("clean");
    if (!cleanUpCache) {
        const { keyString: baseKey, paths, cacheToolchain, cacheCcache } = buildBaseConfig();
        const skipBuildingToolchain = core.getBooleanInput("skip");

        let keyString = baseKey;
        const restoreKeys = [];

        if (cacheCcache) {
            const timestamp = Math.floor(Date.now() / 1000).toString();
            restoreKeys.unshift(keyString);
            keyString += `-${timestamp}`;
            paths.push(".ccache");
        }

        if (paths.length > 0) {
            core.debug(`Cache key: ${keyString}`);
            core.debug(`Cache restore keys: ${restoreKeys.join(", ")}`);
            core.debug(`Cache paths: ${paths.join(", ")}`);

            const cacheFetchingResult = await cache.restoreCache(paths, keyString, restoreKeys);

            if (cacheFetchingResult) {
                core.info(`${cacheFetchingResult} cache fetched!`);
                core.setOutput("hit", "1");
                if (cacheFetchingResult === keyString) {
                    core.saveState("CACHE_STATE", "hit");
                }

                if (cacheToolchain && skipBuildingToolchain) {
                    execSync("sed -i 's/ $(tool.*\\/stamp-compile)//;' Makefile");
                    execSync("sed -i 's/ $(tool.*\\/stamp-install)//;' Makefile");
                    core.info("Toolchain building skipped");
                }
            }
        } else {
            core.debug("No paths configured for caching, skipping");
        }
    }
} catch (error) {
    core.setFailed(error instanceof Error ? error.message : String(error));
}