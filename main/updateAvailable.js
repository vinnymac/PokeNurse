import {
  includes,
} from 'lodash'
import semver from 'semver'
import semverutils from 'semver-utils'

// Some of the below logic is borrowed from
// npm-check-updates

function isWildCard(version) {
  return WILDCARD_PURE_REGEX.test(version)
}

const VERSION_BASE_PARTS = ['major', 'minor', 'patch']
const VERSION_ADDED_PARTS = ['release', 'build']
const VERSION_PARTS = [].concat(VERSION_BASE_PARTS, VERSION_ADDED_PARTS)
const VERSION_PART_DELIM = {
  major: '',
  minor: '.',
  patch: '.',
  release: '-',
  build: '+',
}
const WILDCARDS_PURE = ['^', '~', '^*', '*', 'x', 'x.x', 'x.x.x']
let WILDCARDS_PARTS = `^(${WILDCARDS_PURE.join('|')}`.replace(/\^/g, '\\^').replace(/\*/g, '\\*')
WILDCARDS_PARTS += ')$'
const WILDCARD_PURE_REGEX = new RegExp(WILDCARDS_PARTS)

/** Joins the major, minor, patch, release, and build parts (controlled by an optional precision arg) of a semver object
 * into a dot-delimited string. */
function stringify(ver, precision) {
  // get a list of the parts up until (and including) the given precision
  // or all of them, if no precision is specified
  const parts = precision ? VERSION_PARTS.slice(0, VERSION_PARTS.indexOf(precision) + 1) : VERSION_PARTS

  // pair each part with its delimiter and join together
  return parts
    .filter(part => includes(VERSION_BASE_PARTS, precision) || ver[part])
    .map((part) => VERSION_PART_DELIM[part] + (ver[part] || '0'))
    .join('')
}

function updateAvailable(current, latest) {
  // do not upgrade non-npm version declarations (such as git tags)
  // do not upgrade versionUtil.wildcards
  if (!semver.validRange(current) || isWildCard(current)) {
    return false
  }

  // remove the constraint (e.g. ^1.0.1 -> 1.0.1) to allow upgrades that satisfy the range, but are out of date
  const range = semverutils.parseRange(current)[0]
  if (!range) {
    throw new Error(`'${current}' could not be parsed by semver-utils. This is probably a bug.`)
  }
  const version = stringify(range)

  // make sure it is a valid range
  // not upgradeable if the latest version satisfies the current range
  // not upgradeable if the specified version is newer than the latest (indicating a prerelease version)
  return Boolean(semver.validRange(version)) && !semver.satisfies(latest, version) && !semver.ltr(latest, version)
}

export default updateAvailable
