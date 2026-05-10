# Cache Wrt Build action

[![Licensed Workflow Status](https://github.com/klever1988/cachewrtbuild/actions/workflows/licensed.yml/badge.svg)](https://github.com/klever1988/cachewrtbuild/actions/workflows/licensed.yml)

This action caches builds to speed up openwrt compilation.

## Inputs

### `ccache`

Check if to cache ccache. Default `false`.

### `toolchain`

Check if to cache toolchain. Default `true`.

### `skip`

Check if to skip the compilation of toolchain. Default `true`.

### `clean`

Set to clean cache. Default `false`.

### `prefix`

Path prefix to openwrt build directory. Default `''`.

### `mixkey`

Mix a key to identify a cache when you build openwrt for different architecture. Default `''`.

### `skip_saving`

Skip saving. Default `false`.

## Output

### `hit`

Indicate cache found.

## Example usage

```yaml
uses: klever1988/cachewrtbuild@main
with:
  ccache: true
  mixkey: 'ramips'
  prefix: 'openwrt'
