const {app, BrowserWindow} = require('electron')

let win

function createWindow () {
  win = new BrowserWindow({width: 800, height: 350})
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
