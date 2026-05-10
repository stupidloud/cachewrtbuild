import * as core from "@actions/core";
import { execSync } from "node:child_process";
import path from "node:path";

export function buildBaseConfig() {
    const prefix = core.getInput("prefix");
    if (prefix) {
        process.chdir(prefix);
        core.debug(`Changed working directory to: ${prefix}`);
    }

    const mixkey = core.getInput("mixkey");
    let keyString = mixkey ? `${mixkey}-cache-openwrt` : "cache-openwrt";
    const paths = [];

    const cacheToolchain = core.getBooleanInput("toolchain");
    if (cacheToolchain) {
        const toolchainHash = execSync('git log --pretty=tformat:"%h" -n1 tools toolchain')
            .toString()
            .trim();
        keyString += `-${toolchainHash}`;
        paths.push(
            path.join("staging_dir", "host*"),
            path.join("staging_dir", "tool*")
        );
    }

    const cacheCcache = core.getBooleanInput("ccache");

    return { keyString, paths, cacheToolchain, cacheCcache };
}
