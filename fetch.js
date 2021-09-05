const core = require("@actions/core");
const execSync = require("child_process").execSync;

try {
    var paths = new Array();
    var mixkey = core.getInput("mixkey");
    var keyString = mixkey ? mixkey + "-cache-openwrt" : "cache-openwrt";
    var restoreKeys = new Array();
    const prefix = core.getInput("prefix");
    if (prefix != "") {
        process.chdir(prefix);
    }

    const toolchain = core.getInput("toolchain");
    var skiptoolchain = core.getInput("skip");
    if (toolchain == "true") {
        stdout = execSync('git log --pretty=tformat:"%h" -n1 tools toolchain')
            .toString()
            .trim();
        //restoreKeys.unshift(keyString);
        keyString = keyString + "-" + stdout;
        paths.push("staging_dir/host*");
        paths.push("staging_dir/tool*");
    } else {
        skiptoolchain = false;
    }

    const ccache = core.getInput("ccache");
    if (ccache == "true") {
        stdout = execSync("date +%s").toString().trim();
        restoreKeys.unshift(keyString);
        keyString = keyString + "-" + stdout;
        paths.push(".ccache");
    }

    const cache = require("@actions/cache");
    const clean = core.getInput("clean");
    if (clean == "true") return;
    console.log(keyString, restoreKeys);
    const cacheKey = cache
        .restoreCache(paths, keyString, restoreKeys)
        .then((res) => {
            if (typeof res !== "undefined" && res) {
                console.log(res, " cache fetched!");
                core.setOutput("hit", "1");
                core.saveState("CACHE_STATE", "hit");
                if (skiptoolchain == "true") {
                    console.log("skiped");
                    execSync(
                        "sed -i 's/ $(tool.*\\/stamp-compile)//;' Makefile"
                    );
                    execSync(
                        "sed -i 's/ $(tool.*\\/stamp-install)//;' Makefile"
                    );
                    //execSync('bash -c \'find build_dir\/{host*,toolchain-*} -name .built\\* -exec touch {} \\;; touch staging_dir\/{host*,toolchain-*}\/stamp\/.*\'');
                }
            }
        });
} catch (error) {
    core.setFailed(error.message);
}
