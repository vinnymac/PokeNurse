const {app, BrowserWindow, ipcMain, dialog} = require('electron')
const fs = require('fs')
const path = require('path')
const pogobuf = require('pogobuf')

const accountPath = path.join(app.getPath('appData'), '/pokenurse/account.json')

let win
let client

function createWindow() {
  win = new BrowserWindow({ width: 800, height: 375, title: 'PokéNurse', icon: 'imgs/emojioneicon.png' })
  win.setMenu(null)
  win.loadURL(`file://${__dirname}/login.html`)

  client = new pogobuf.Client()

  win.on('closed', () => {
    win = null
  })
}

app.on('ready', createWindow)

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', () => {
  if (win === null) {
    createWindow()
  }
})

// GENERAL
ipcMain.on('error-message', (event, errorMessage) => {
  dialog.showMessageBox(win, {
    type: 'error',
    buttons: ['Ok'],
    title: 'Error',
    message: errorMessage
  })
})
// END OF GENERAL

// LOGIN
ipcMain.on('get-account-credentials', (event) => {
  console.log('[+] Attempting to retrieve saved account credentials from ' + accountPath)

  var credentials = {}

  if (!fs.existsSync(accountPath)) {
    console.log('[!] account.json doesn\'t exist')
    event.returnValue = {
      success: false
    }
    return
  }

  // Maybe use readFile instead
  credentials = JSON.parse(fs.readFileSync(accountPath))

  console.log('[+] Retrieved saved account')

  event.returnValue = {
    success: true,
    method: credentials.method,
    username: credentials.username,
    password: credentials.password
  }
})

ipcMain.on('save-account-credentials', (event, method, username, password) => {
  console.log('[+] Saving account credentials')

  var credentials = JSON.stringify({
    method: method,
    username: username,
    password: password
  })

  fs.writeFile(accountPath, credentials, (err) => {
    if (err) console.log(err)
    console.log('[+] Saved account credentials to ' + accountPath)
  })
})

ipcMain.on('check-and-delete-credentials', (event) => {
  if (fs.existsSync(accountPath)) {
    fs.unlink(accountPath, (err) => {
      if (err) console.log(err)
      console.log('[+] Deleted account credentials, located at ' + accountPath)
    })
  }
})

ipcMain.on('pokemon-login', (event, method, username, password) => {
  console.log('[+] Attempting to login')

  var login
  if (method === 'google') {
    login = new pogobuf.GoogleLogin()
  } else {
    login = new pogobuf.PTCLogin()
  }

  login.login(username, password).then(token => {
    client.setAuthInfo(method, token)
    client.init()

    win.loadURL(`file://${__dirname}/home.html`)
    win.setSize(900, 600, true)
  })
})
// END OF LOGIN

// POKEMON
ipcMain.on('get-player-info', (event) => {
  console.log('[+] Retrieving player info')
  client.getPlayer().then(response => {
    if (!response['success']) {
      event.returnValue = {
        success: false
      }
      return
    }

    event.returnValue = {
      success: 'true',
      player_data: response['player_data']
    }
  })
})

ipcMain.on('get-players-pokemons', (event) => {
  console.log('[+] Retrieving player\'s Pokemons')
  client.getInventory(0).then(inventory => {
    if (!inventory['success']) {
      event.returnValue = {
        success: false
      }
      return
    }

    var pokemons = pogobuf.Utils.splitInventory(inventory)['pokemon']

    event.returnValue = {
      success: true,
      pokemon: pokemons
    }
  })
})
// END OF POKEMON
