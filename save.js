import * as core from "@actions/core";
import * as cache from "@actions/cache";
import { buildBaseConfig } from "./utils.js";

try {
    const cleanUpCache = core.getBooleanInput("clean");
    if (cleanUpCache) {
        core.debug("Cache clean requested, skipping save");
    } else if (core.getBooleanInput("skip_saving")) {
        core.debug("skip_saving is set, skipping save");
    } else if (core.getState("CACHE_STATE") === "hit") {
        core.debug("Cache was already restored, skipping save");
    } else {
        const { keyString: baseKey, paths, cacheCcache } = buildBaseConfig();

        let keyString = baseKey;
        if (cacheCcache) {
            const timestamp = Math.floor(Date.now() / 1000).toString();
            keyString += `-${timestamp}`;
            paths.push(".ccache");
        }

        if (paths.length > 0) {
            core.debug(`Saving cache with key: ${keyString}`);
            core.debug(`Cache paths: ${paths.join(", ")}`);

            const cacheId = await cache.saveCache(paths, keyString);
            if (cacheId > -1) {
                core.info(`Cache saved with key: ${keyString} (id: ${cacheId})`);
            }
        } else {
            core.debug("No paths configured for caching, skipping");
        }
    }
} catch (error) {
    core.warning(error instanceof Error ? error.message : String(error));
}
