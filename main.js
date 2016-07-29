const {app, BrowserWindow, ipcMain, dialog} = require('electron')
const fs = require('fs')
// var pokemon = require('pokemon-go-node-api')

const accountPath = app.getPath('appData') + '/pokenurse/account.json'

let win

function createWindow () {
  win = new BrowserWindow({width: 800, height: 370})
  win.loadURL(`file://${__dirname}/login.html`)

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

  console.log('[+] Saved account retrieved')

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
    console.log('[+] Account credentials saved to ' + accountPath)
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
})
// END OF LOGIN
