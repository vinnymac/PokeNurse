import https from 'https'
import {
  dialog,
  shell,
} from 'electron'

import updateAvailable from './updateAvailable'

import packageJSON from '../package.json'

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
