/* eslint no-console: 0 */

import pogobuf from 'pogobuf'
import {
  app,
  BrowserWindow,
  ipcMain,
  dialog,
  Menu
} from 'electron'

import menuTemplate from './main/main_menu'

const isOSX = process.platform === 'darwin'
const isDevelopment = process.env.NODE_ENV === 'development'

let mainWindow = null
let client = null

if (isDevelopment) require('electron-debug')() // eslint-disable-line global-require

function sleep(time) {
  return new Promise(r => setTimeout(r, time))
}

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 800,
    height: 375,
    title: 'PokéNurse',
    icon: '../app/app.png',
    show: false
  })

  mainWindow.loadURL(`file://${__dirname}/app/app.html`)
  // mainWindow.once('ready-to-show', () => {
  //   win.show()
  // })

  mainWindow.webContents.on('did-finish-load', () => {
    mainWindow.show()
    mainWindow.focus()
  })

  // Prevent BrowserWindow from navigating when user drags/drops files
  mainWindow.webContents.on('will-navigate', (e) => {
    e.preventDefault()
  })

  // If for some reason the app crashes we can get some information about it
  mainWindow.webContents.on('crashed', (event) => {
    console.error('crashed', event)
  })

  // allow garbage collection to occur on win when closed
  mainWindow.on('closed', () => {
    mainWindow = null
  })

  mainWindow.on('unresponsive', (event) => {
    console.error('unresponsive', event)
  })

  mainWindow.on('uncaughtException', (error) => {
    console.error('uncaughtException', error)
  })


  //
  // OS X Specific Configuration
  //
  if (isOSX) {
    // Hide the window on close rather than quitting the app,
    // and make sure to really close the window when quitting.
    mainWindow.on('close', (event) => {
      if (mainWindow.forceClose) return
      event.preventDefault()
      mainWindow.hide()
    })
  }

  // Create/set the main menu
  const menu = Menu.buildFromTemplate(menuTemplate)
  Menu.setApplicationMenu(menu)

  if (isDevelopment) {
    mainWindow.openDevTools()
    mainWindow.webContents.on('context-menu', (e, props) => {
      const { x, y } = props

      Menu.buildFromTemplate([{
        label: 'Inspect element',
        click() {
          mainWindow.inspectElement(x, y)
        }
      }]).popup(mainWindow)
    })
  }

  client = new pogobuf.Client()
}

//
// OS X Specific Configuration
//
if (isOSX) {
  // Hide the window on close rather than quitting the app,
  // and make sure to really close the window when quitting.
  app.on('before-quit', () => {
    mainWindow.forceClose = true
  })

  app.on('activate', () => {
    mainWindow.show()
  })
}

app.on('window-all-closed', () => {
  if (!isOSX) {
    app.quit()
  }
})

const installExtensions = async () => {
  if (isDevelopment) {
    const installer = require('electron-devtools-installer') // eslint-disable-line global-require

    const extensions = [
      'REACT_DEVELOPER_TOOLS',
      'REDUX_DEVTOOLS'
    ]
    const forceDownload = !!process.env.UPGRADE_EXTENSIONS

    // http://stackoverflow.com/questions/37576685/using-async-await-with-a-foreach-loop
    for (const name of extensions) { // eslint-disable-line
      try {
        await installer.default(installer[name], forceDownload)
      } catch (e) {} // eslint-disable-line
    }
  }
}

app.on('ready', async () => {
  await installExtensions()

  createWindow()
})

function showErrorMessage(message) {
  dialog.showMessageBox(mainWindow, {
    type: 'error',
    buttons: ['Ok'],
    title: 'Error',
    message
  })
}

function showInformationMessage(message, title) {
  dialog.showMessageBox(mainWindow, {
    type: 'info',
    buttons: ['OK'],
    title,
    message
  })
}

// GENERAL
ipcMain.on('error-message', (event, errorMessage) => {
  showErrorMessage(errorMessage)
})

ipcMain.on('information-dialog', (event, message, title) => {
  showInformationMessage(message, title)
})

ipcMain.on('confirmation-dialog', (event, method) => {
  dialog.showMessageBox(mainWindow, {
    type: 'question',
    buttons: ['Yes', 'Cancel'],
    title: 'Confirmation',
    message: `Are you sure you want to ${method} the selected Pokemon?`
  }, response => {
    if (response === 1) {
      console.log(`[!] ${method} cancelled`)
      event.returnValue = {
        success: false
      }
      return
    }

    event.returnValue = {
      success: true
    }
  })
})
// END OF GENERAL

ipcMain.on('table-did-mount', () => {
  mainWindow.setSize(900, 600, true)
})

// POKEMON
ipcMain.on('power-up-pokemon', async (event, id, nickname) => {
  try {
    await client.upgradePokemon(id)

    console.log(`[+] Upgraded Pokemon with id: ${id}`)
    const message = `Upgraded ${nickname} succesfully!`
    const title = `Power Up ${nickname}`
    // TODO parse the response instead of retrieving all the new pokemon
    // Requires replacing the main parsing with more functional code
    // TODO ACTIONS
    // getPlayersPokemons(event, 'async')
    showInformationMessage(message, title)
  } catch (error) {
    console.error(error)
  }
})

ipcMain.on('transfer-pokemon', async (event, pokemon, delay) => {
  try {
    await sleep(delay)
    await client.releasePokemon(pokemon.id)
    console.log(`[+] Released Pokemon with id: ${pokemon.id}`)

    event.sender.send('transfer-pokemon-complete', pokemon)
  } catch (error) {
    console.error(error)
  }
})

ipcMain.on('evolve-pokemon', async (event, pokemon, delay) => {
  try {
    await sleep(delay)
    await client.evolvePokemon(pokemon.id)
    console.log(`[+] Evolved Pokemon with id: ${pokemon.id}`)

    event.sender.send('evolve-pokemon-complete', pokemon)
  } catch (error) {
    console.error(error)
  }
})

ipcMain.on('favorite-pokemon', async (event, id, isFavorite) => {
  try {
    await client.setFavoritePokemon(id, isFavorite)

    console.log(`[+] Pokemon favorite status set to ${isFavorite}`)
    // getPlayersPokemons(event, 'async')
  } catch (error) {
    console.error(error)
  }
})

ipcMain.on('rename-pokemon', async (event, id, nickname) => {
  try {
    await client.nicknamePokemon(id, nickname)

    console.log(`[+] Pokemon ${id} nicknamed ${nickname}`)

    event.sender.send('rename-pokemon-complete', id, nickname)
  } catch (error) {
    console.error(error)
  }
})
// END OF POKEMON
