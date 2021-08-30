const core = require('@actions/core');
const github = require('@actions/github');
const execSync = require('child_process').execSync;

try {
  var paths = new Array();
  var keyString = 'cache-openwrt-';
  var keyString1= 'cache-openwrt-';

  const { exec } = require("child_process");
  //const exec = require('@actions/exec');

  const toolchain = core.getInput('toolchain');
  if ( toolchain=='true' ){
    stdout=execSync('git log --pretty=tformat:"%h" -n1 tools toolchain');
    keyString1=keyString+stdout;
    paths.push('staging_dir');
    console.log(stdout);
  }

  const ccache = core.getInput('ccache');
  if ( ccache=='true' ){
    exec('git log --pretty=tformat:"%h" -n1 tools toolchain', (error, stdout, stderr) => {
      keyString=keyString1+'-'+stdout
      paths.push('.ccache');
    });
  }

  const cache = require('@actions/cache');
  var restoreKeys = [
    keyString1
  ]
  const cacheKey = cache.restoreCache(paths, keyString, restoreKeys)
  if ( typeof cacheKey !== 'undefined' && cacheKey ){
    console.log(keyString)
    console.log(keyString1)
    exec('sed -i "\/\\(tools\\|toolchain\\)\\/Makefile/d" Makefile');
  }

} catch (error) {
  core.setFailed(error.message);
}
