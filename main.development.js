import fs from 'fs'
import path from 'path'
import pogobuf from 'pogobuf'
import POGOProtos from 'node-pogo-protos'
import {
  app,
  BrowserWindow,
  ipcMain,
  dialog,
  Menu
} from 'electron'

import menuTemplate from './main/main_menu'
import utils from './main/utils'
import baseStats from './baseStats'

const accountPath = path.join(app.getPath('appData'), '/pokenurse/account.json')

let mainWindow = null
let client = null

if (process.env.NODE_ENV === 'development') {
  require('electron-debug')() // eslint-disable-line global-require
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

  // allow garbage collection to occur on win when closed
  mainWindow.on('closed', () => {
    mainWindow = null
  })

  // Create/set the main menu
  const menu = Menu.buildFromTemplate(menuTemplate)
  Menu.setApplicationMenu(menu)

  if (process.env.NODE_ENV === 'development') {
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

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

// app.on('activate', () => {
//   if (mainWindow === null) {
//     createWindow()
//   }
// })

const installExtensions = async () => {
  if (process.env.NODE_ENV === 'development') {
    const installer = require('electron-devtools-installer') // eslint-disable-line global-require

    const extensions = [
      'REACT_DEVELOPER_TOOLS',
      // 'REDUX_DEVTOOLS'
    ]
    const forceDownload = !!process.env.UPGRADE_EXTENSIONS
    for (const name of extensions) {
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
      console.log('[!] ' + method + ' cancelled')
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

// LOGIN
ipcMain.on('get-account-credentials', (event) => {
  console.log('[+] Attempting to retrieve saved account credentials from ' + accountPath)

  let credentials = {}

  if (!fs.existsSync(accountPath)) {
    console.log("[!] account.json doesn't exist")
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

  const credentials = JSON.stringify({
    method,
    username,
    password
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
  let login
  if (method === 'google') {
    login = new pogobuf.GoogleLogin()
  } else {
    login = new pogobuf.PTCLogin()
  }

  login.login(username, password).then(token => {
    client.setAuthInfo(method, token)
    client.init()

    event.sender.send('pokemon-logged-in')
  }).catch(error => {
    console.error(error)
    showErrorMessage(error.message)
  })
})
// END OF LOGIN

ipcMain.on('table-did-mount', () => {
  mainWindow.setSize(900, 600, true)
})

// POKEMON
ipcMain.on('get-player-info', (event) => {
  console.log('[+] Retrieving player info')
  client.getPlayer().then(response => {
    if (!response.success) {
      event.returnValue = {
        success: false
      }
      return
    }

    event.returnValue = {
      success: 'true',
      player_data: response.player_data
    }
  })
})

function getPlayersPokemons(event, sync = 'sync') {
  client.getInventory(0).then(inventory => {
    if (!inventory.success) {
      const payload = { success: false }
      if (sync !== 'sync') {
        event.sender.send('receive-players-pokemons', payload)
        return
      }
      event.returnValue = payload
      return
    }

    const player = pogobuf.Utils.splitInventory(inventory)['player']

    const candies = pogobuf.Utils.splitInventory(inventory)['candies']
    const formattedCandies = {}

    for (let i = 0; i < candies.length; i++) {
      const candy = candies[i]
      formattedCandies[candy.family_id.toString()] = candy.candy
    }

    const pokemons = pogobuf.Utils.splitInventory(inventory)['pokemon']
    const reducedPokemonList = []
    const combinedPokemonList = []

    for (let i = 0; i < pokemons.length; i++) {
      const pokemon = pokemons[i]
      if (pokemon.cp === 0) continue

      let pokemonName = pogobuf.Utils.getEnumKeyByValue(POGOProtos.Enums.PokemonId, pokemon.pokemon_id)
      pokemonName = pokemonName.replace('Female', '♀').replace('Male', '♂')

      const stats = baseStats.pokemon[pokemon.pokemon_id]

      const totalCpMultiplier = pokemon.cp_multiplier + pokemon.additional_cp_multiplier

      const attack = stats.BaseAttack + pokemon.individual_attack
      const defense = stats.BaseDefense + pokemon.individual_defense
      const stamina = stats.BaseStamina + pokemon.individual_stamina

      const maxCP = utils.getMaxCpForTrainerLevel(attack, defense, stamina, player.level)
      const candyCost = utils.getCandyCostsForPowerup(totalCpMultiplier, pokemon.num_upgrades)
      const stardustCost = utils.getStardustCostsForPowerup(totalCpMultiplier, pokemon.num_upgrades)
      const candyMaxCost = utils.getMaxCandyCostsForPowerup(player.level, pokemon.num_upgrades, totalCpMultiplier)
      const stardustMaxCost = utils.getMaxStardustCostsForPowerup(player.level, pokemon.num_upgrades, totalCpMultiplier)
      const nextCP = utils.getCpAfterPowerup(pokemon.cp, totalCpMultiplier)
      const ADS = pokemon.individual_attack + pokemon.individual_defense + pokemon.individual_stamina
      const iv = Math.round(ADS / 45 * 10000) / 100

      reducedPokemonList.push({
        cp: pokemon.cp,
        next_cp: nextCP,
        max_cp: maxCP,
        candy_cost: candyCost,
        candy_max_cost: candyMaxCost,
        stardust_cost: stardustCost,
        stardust_max_cost: stardustMaxCost,
        creation_time_ms: pokemon.creation_time_ms.toString(),
        deployed: pokemon.deployed_fort_id !== '',
        id: pokemon.id.toString(),
        attack: pokemon.individual_attack,
        defense: pokemon.individual_defense,
        stamina: pokemon.individual_stamina,
        current_stamina: pokemon.stamina,
        stamina_max: pokemon.stamina_max,
        iv,
        pokemon_id: pokemon.pokemon_id,
        name: pokemonName,
        height: pokemon.height_m,
        weight: pokemon.weight_kg,
        nickname: pokemon.nickname || pokemonName,
        // Multiply by -1 for sorting
        favorite: pokemon.favorite * -1,
        move_1: pokemon.move_1,
        move_2: pokemon.move_2
      })

      if (combinedPokemonList[pokemonName]) {
        combinedPokemonList[pokemonName].count = combinedPokemonList[pokemonName].count + 1
      } else {
        combinedPokemonList[pokemonName] = {
          pokemon_id: pokemon.pokemon_id,
          name: pokemonName,
          count: +1,
          pokes: []
        }
      }
    }

    // console.log(reducedPokemonList)

    for (let i = 0; i < reducedPokemonList.length; i++) {
      const pokemon = reducedPokemonList[i]

      if (combinedPokemonList[pokemon.name].pokemon_id === pokemon.pokemon_id) {
        combinedPokemonList[pokemon.name].pokes.push(pokemon)
      }
    }

    // console.log(combinedPokemonList)

    const finalList = []

    for (const key in combinedPokemonList) {
      const pokemon = combinedPokemonList[key]
      const candy = formattedCandies[baseStats.pokemon[pokemon.pokemon_id].familyId]
      const count = pokemon.count
      let evolves = Math.floor(candy / baseStats.pokemon[pokemon.pokemon_id].evolveCost)

      if ((evolves === Infinity || isNaN(evolves))) {
        evolves = 0
      }

      finalList.push({
        pokemon_id: pokemon.pokemon_id.toString(),
        name: pokemon.name,
        count,
        candy,
        evolves: (evolves > count ? count : evolves),
        pokemon: pokemon.pokes
      })
    }

    const payload = {
      success: true,
      species: finalList
    }

    if (sync === 'sync') {
      event.returnValue = payload
    } else {
      event.sender.send('receive-players-pokemons', payload)
    }
  })
}

ipcMain.on('get-players-pokemons', (event, sync) => {
  console.log("[+] Retrieving player's Pokemons and Calculating Evolves")
  getPlayersPokemons(event, sync)
})

ipcMain.on('power-up-pokemon', (event, id, nickname) => {
  client.upgradePokemon(id)
    .then(() => {
      console.log(`[+] Upgraded Pokemon with id: ${id}`)
      const message = `Upgraded ${nickname} succesfully!`
      const title = `Power Up ${nickname}`
      // TODO parse the response instead of retrieving all the new pokemon
      // Requires replacing the main parsing with more functional code
      getPlayersPokemons(event, 'async')
      showInformationMessage(message, title)
    })
    .catch(console.error)
})

ipcMain.on('transfer-pokemon', (event, id, delay) => {
  setTimeout(() => {
    client.releasePokemon(id)
    console.log('[+] Released Pokemon with id: ' + id)
  }, delay)
})

ipcMain.on('evolve-pokemon', (event, id, delay) => {
  setTimeout(() => {
    client.evolvePokemon(id)
    console.log('[+] Evolved Pokemon with id: ' + id)
  }, delay)
})

ipcMain.on('favorite-pokemon', (event, id, isFavorite) => {
  client.setFavoritePokemon(id, isFavorite)
    .then(() => {
      getPlayersPokemons(event, 'async')
    }).catch(console.error)
  console.log('[+] Pokemon favorite status set to ' + isFavorite)
})
// END OF POKEMON
