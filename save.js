const core = require('@actions/core');
const github = require('@actions/github');

try {
  var paths = new Array()
  var keyString = 'cache-openwrt-'
  var keyString1= 'cache-openwrt-'

  const exec = require('@actions/exec');

  const toolchain = core.getInput('toolchain');
  if ( toolchain=='true' ){
    keyString1=keyString+exec.exec('git log --pretty=tformat:"%h" -n1 tools toolchain')
    paths.push('staging_dir');
  }

  const ccache = core.getInput('ccache');
  if ( ccache=='true' ){
    keyString=keyString1+'-'+exec.exec('date +%s"')
    paths.push('.ccache');
  }

  const cache = require('@actions/cache');
  const cacheId = cache.saveCache(paths, keyString)

} catch (error) {
  core.setFailed(error.message);
}
