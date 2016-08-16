const { app, dialog, BrowserWindow, shell } = require('electron')

function showAboutDialog() {
  dialog.showMessageBox({
    type: 'info',
    buttons: [],
    title: 'About PokeNurse',
    message: 'About PokeNurse',
    detail: `PokeNurse v${app.getVersion()}\nCopyright PokeNurse 2016`
  })
}

const template = [
  {
    label: 'Edit',
    submenu: [
      {
        label: 'Undo',
        accelerator: 'CmdOrCtrl+Z',
        role: 'undo'
      },
      {
        label: 'Redo',
        accelerator: 'Shift+CmdOrCtrl+Z',
        role: 'redo'
      },
      {
        type: 'separator'
      },
      {
        label: 'Cut',
        accelerator: 'CmdOrCtrl+X',
        role: 'cut'
      },
      {
        label: 'Copy',
        accelerator: 'CmdOrCtrl+C',
        role: 'copy'
      },
      {
        label: 'Paste',
        accelerator: 'CmdOrCtrl+V',
        role: 'paste'
      },
      {
        label: 'Select All',
        accelerator: 'CmdOrCtrl+A',
        role: 'selectall'
      }
    ]
  },
  {
    label: 'View',
    submenu: [
      {
        label: 'Reload',
        accelerator: 'CmdOrCtrl+R',
        click(item, focusedWindow) {
          if (focusedWindow) {
            focusedWindow.webContents.send('message', 'reload')
          }
        }
      },
      {
        label: 'Toggle Full Screen',
        accelerator: (function () {
          if (process.platform === 'darwin') {
            return 'Ctrl+Command+F'
          } else {
            return 'F11'
          }
        })(),
        click(item, focusedWindow) {
          if (focusedWindow) focusedWindow.setFullScreen(!focusedWindow.isFullScreen())
        }
      }
    ]
  },
  {
    label: 'Window',
    role: 'window',
    submenu: [
      {
        label: 'Minimize',
        accelerator: 'CmdOrCtrl+M',
        role: 'minimize'
      },
      {
        label: 'Close',
        accelerator: 'CmdOrCtrl+W',
        role: 'close'
      }
    ]
  },
  {
    label: 'Help',
    role: 'help',
    submenu: [
      {
        label: 'Visit Homepage',
        click() { shell.openExternal('https://github.com/duhminick/PokeNurse') }
      },
      {
        type: 'separator'
      },
      {
        label: 'Toggle Console',
        accelerator: (function () {
          if (process.platform === 'darwin') {
            return 'Alt+Command+I'
          } else {
            return 'Ctrl+Shift+I'
          }
        })(),
        click(item, focusedWindow) {
          const allWindows = BrowserWindow.getAllWindows()
          const firstWindow = allWindows[0]
          if (firstWindow) {
            firstWindow.toggleDevTools()
          }
        }
      }
    ]
  }
]

const name = app.getName()

if (process.platform === 'darwin') {
  template.unshift({
    label: name,
    submenu: [
      {
        label: 'About ' + name,
        click: showAboutDialog
      },
      {
        type: 'separator'
      },
      {
        label: 'Services',
        role: 'services',
        submenu: []
      },
      {
        type: 'separator'
      },
      {
        label: 'Hide ' + name,
        accelerator: 'Command+H',
        role: 'hide'
      },
      {
        label: 'Hide Others',
        accelerator: 'Command+Shift+H',
        role: 'hideothers'
      },
      {
        label: 'Show All',
        role: 'unhide'
      },
      {
        type: 'separator'
      },
      {
        type: 'separator'
      },
      {
        label: 'Quit',
        accelerator: 'Command+Q',
        click() { app.quit() }
      }
    ]
  })
  // Window menu.
  template[3].submenu.push(
    {
      type: 'separator'
    },
    {
      label: 'Bring All to Front',
      role: 'front'
    }
  )
}

if (process.platform === 'win32') {
  template.unshift({
    label: 'File',
    submenu: [
      {
        label: 'About ' + name,
        click: showAboutDialog
      },
      {
        type: 'separator'
      },
      {
        type: 'separator'
      },
      {
        label: 'Quit',
        accelerator: 'Control+Q',
        click() { app.quit() }
      }
    ]
  })
}

module.exports = template
