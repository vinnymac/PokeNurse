import {
  app,
  BrowserWindow,
  ipcMain,
  dialog,
  Menu
} from 'electron'
import electronLocalshortcut from 'electron-localshortcut'

import menuTemplate from './main/mainMenu'
import checkForUpdates from './main/checkForUpdates'

const isMacOS = process.platform === 'darwin'
const isDevelopment = process.env.NODE_ENV === 'development'

let mainWindow = null

if (isDevelopment) require('electron-debug')() // eslint-disable-line global-require

process.on('uncaughtException', (error) => {
  console.error('uncaughtException', error) // eslint-disable-line
})

function preventUnusedElectronDebug() {
  // prevent localshortcuts registered by electron-debug that we configure ourselves
  electronLocalshortcut.unregister(isMacOS ? 'Cmd+Alt+I' : 'Ctrl+Shift+I')
}

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 800,
    height: 375,
    title: 'PokéNurse',
    icon: '../app/app.png',
    show: false
  })

  if (isDevelopment) preventUnusedElectronDebug()

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
    console.error('crashed', event) // eslint-disable-line
  })

  // allow garbage collection to occur on win when closed
  mainWindow.on('closed', () => {
    mainWindow = null
  })

  mainWindow.on('unresponsive', (event) => {
    console.error('unresponsive', event) // eslint-disable-line
  })


  //
  // macOS Specific Configuration
  //
  if (isMacOS) {
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

  checkForUpdates({ displayNoUpdateAvailable: false })
}

//
// macOS Specific Configuration
//
if (isMacOS) {
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
  if (!isMacOS) {
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
      console.log(`[!] ${method} cancelled`) // eslint-disable-line
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
