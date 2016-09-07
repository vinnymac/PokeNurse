import https from 'https'
import semver from 'semver'
import semverutils from 'semver-utils'
import {
  dialog,
  app,
  shell,
} from 'electron'
import {
  includes,
} from 'lodash'
import packageJSON from '../package.json'

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

function checkForUpdates(displayNoUpdateAvailable, latestPackageUrl, latestReleasesUrl) {
  let data = ''
  const name = packageJSON.name
  const currentVersion = packageJSON.version

  https.get(latestPackageUrl, (res) => {
    res.setEncoding('utf8')
    res.on('data', (chunk) => { data += chunk })
    res.on('end', () => {
      let latestVersion = '0.0.0'

      try {
        latestVersion = JSON.parse(data).version
      } catch (e) {
        console.error(e) // eslint-disable-line

        dialog.showMessageBox({
          type: 'info',
          buttons: [],
          title: 'Check for Updates',
          message: 'Error Checking for Updates',
          detail: `${name} ran into an error checking for updates. Please try again later.`,
        })
        return
      }

      if (updateAvailable(currentVersion, latestVersion)) {
        dialog.showMessageBox({
          type: 'info',
          buttons: ['OK', 'Open Downloads Page'],
          title: 'Check for Updates',
          message: 'Update Available',
          detail: `You have v${currentVersion} and v${latestVersion} is available for download.`,
        }, (buttonIndex) => {
          if (buttonIndex === 1) {
            shell.openExternal(latestReleasesUrl)
          }
        })
      } else if (displayNoUpdateAvailable) {
        dialog.showMessageBox({
          type: 'info',
          buttons: [],
          title: 'Check for Updates',
          message: 'No Update Available',
          detail: `You have the latest version of ${name}:\nv${currentVersion}`,
        })
      }
    })
  }).on('error', (e) => {
    dialog.showMessageBox({
      type: 'info',
      buttons: [],
      title: 'Error',
      message: 'Error',
      detail: String(e),
    })
  })
}

export default ({ displayNoUpdateAvailable }) => {
  checkForUpdates(displayNoUpdateAvailable,
    'https://raw.githubusercontent.com/vinnymac/PokeNurse/master/package.json',
    'https://github.com/vinnymac/PokeNurse/releases/latest',
  )
}
