import semver, {
  Range
} from 'semver'

// Some of the below logic is borrowed from
// https://www.npmjs.com/package/npm-check-updates

function isWildCard(version) {
  return WILDCARD_PURE_REGEX.test(version)
}

const WILDCARDS_PURE = ['^', '~', '^*', '*', 'x', 'x.x', 'x.x.x']
let WILDCARDS_PARTS = `^(${WILDCARDS_PURE.join('|')}`.replace(/\^/g, '\\^').replace(/\*/g, '\\*')
WILDCARDS_PARTS += ')$'
const WILDCARD_PURE_REGEX = new RegExp(WILDCARDS_PARTS)

function updateAvailable(current, latest) {
  // do not upgrade non-npm version declarations (such as git tags)
  // do not upgrade versionUtil.wildcards
  if (!semver.validRange(current) || isWildCard(current)) {
    return false
  }

  const version = new Range(current)

  // make sure it is a valid range
  // not upgradeable if the latest version satisfies the current range
  // not upgradeable if the specified version is newer than the latest (indicating a prerelease version)
  return Boolean(semver.validRange(version)) && !semver.satisfies(latest, version) && !semver.ltr(latest, version)
}

export default updateAvailable
