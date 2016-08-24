/* eslint no-console: 0 */

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
import times from 'lodash/times'
import keyBy from 'lodash/keyBy'

import menuTemplate from './main/main_menu'
import utils from './main/utils'
import baseStats from './baseStats'

const accountPath = path.join(app.getPath('appData'), '/pokenurse/account.json')

const kantoDexCount = 151

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
      'REACT_DEVELOPER_TOOLS'
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

// LOGIN
ipcMain.on('get-account-credentials', (event) => {
  console.log(`[+] Attempting to retrieve saved account credentials from ${accountPath}`)

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
    console.log(`[+] Saved account credentials to ${accountPath}`)
  })
})

ipcMain.on('check-and-delete-credentials', () => {
  if (fs.existsSync(accountPath)) {
    fs.unlink(accountPath, (err) => {
      if (err) console.log(err)
      console.log(`[+] Deleted account credentials, located at ${accountPath}`)
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

function generateEmptySpecies(candies) {
  const formattedCandies = keyBy(candies, (candy) => String(candy.family_id))

  return times(kantoDexCount, (i) => {
    const pokemonDexNumber = String(i + 1)
    const basePokemon = baseStats.pokemon[pokemonDexNumber]

    return {
      pokemon_id: pokemonDexNumber,
      name: basePokemon.name,
      count: 0,
      candy: formattedCandies[basePokemon.familyId].candy,
      evolves: 0,
      pokemon: []
    }
  })
}

function parseInventory(inventory) {
  const { player, candies, pokemon } = pogobuf.Utils.splitInventory(inventory)

  const speciesList = generateEmptySpecies(candies)
  const eggList = []

  // populates the speciesList with pokemon and counts
  // populates the eggList with pokemon
  pokemon.forEach(p => {
    if (p.is_egg) {
      eggList.push(p)
      return
    }

    let pokemonName = pogobuf.Utils.getEnumKeyByValue(
      POGOProtos.Enums.PokemonId,
      p.pokemon_id
    )

    pokemonName = pokemonName.replace('Female', '♀').replace('Male', '♂')

    const stats = baseStats.pokemon[p.pokemon_id]

    const totalCpMultiplier = p.cp_multiplier + p.additional_cp_multiplier

    const attack = stats.BaseAttack + p.individual_attack
    const defense = stats.BaseDefense + p.individual_defense
    const stamina = stats.BaseStamina + p.individual_stamina

    const maxCP = utils.getMaxCpForTrainerLevel(attack, defense, stamina, player.level)
    const candyCost = utils.getCandyCostsForPowerup(totalCpMultiplier, p.num_upgrades)
    const stardustCost = utils.getStardustCostsForPowerup(totalCpMultiplier, p.num_upgrades)
    const candyMaxCost = utils.getMaxCandyCostsForPowerup(
      player.level,
      p.num_upgrades,
      totalCpMultiplier
    )

    const stardustMaxCost = utils.getMaxStardustCostsForPowerup(
      player.level,
      p.num_upgrades,
      totalCpMultiplier
    )

    const nextCP = utils.getCpAfterPowerup(p.cp, totalCpMultiplier)

    const iv = utils.getIVs(p)

    // TODO Use CamelCase instead of under_score for all keys except responses
    const pokemonWithStats = {
      iv,
      cp: p.cp,
      next_cp: nextCP,
      max_cp: maxCP,
      candy_cost: candyCost,
      candy_max_cost: candyMaxCost,
      stardust_cost: stardustCost,
      stardust_max_cost: stardustMaxCost,
      creation_time_ms: p.creation_time_ms.toString(),
      deployed: p.deployed_fort_id !== '',
      id: p.id.toString(),
      attack: p.individual_attack,
      defense: p.individual_defense,
      stamina: p.individual_stamina,
      current_stamina: p.stamina,
      stamina_max: p.stamina_max,
      pokemon_id: p.pokemon_id,
      name: pokemonName,
      height: p.height_m,
      weight: p.weight_kg,
      nickname: p.nickname || pokemonName,
      // Multiply by -1 for sorting
      favorite: p.favorite * -1,
      move_1: p.move_1,
      move_2: p.move_2
    }

    const speciesIndex = p.pokemon_id - 1

    speciesList[speciesIndex].count += 1
    speciesList[speciesIndex].pokemon.push(pokemonWithStats)
  })

  // TODO use map
  speciesList.forEach((s) => {
    s.evolves = utils.getEvolvesCount(s)
  })

  return {
    success: true,
    species: speciesList,
    eggs: eggList
  }
}

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

    const payload = parseInventory(inventory)

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

ipcMain.on('transfer-pokemon', (event, pokemon, delay) => {
  setTimeout(() => {
    // The line below is useful right now for testing
    // it'd be even more useful with mock data responses!
    // (new Promise((resolve, reject) => { resolve() }))
    client.releasePokemon(pokemon.id)
      .then(() => {
        console.log(`[+] Released Pokemon with id: ${pokemon.id}`)

        event.sender.send('transfer-pokemon-complete', pokemon)
      }).catch(console.error)
  }, delay)
})

ipcMain.on('evolve-pokemon', (event, pokemon, delay) => {
  setTimeout(() => {
    // The line below is useful right now for testing
    // it'd be even more useful with mock data responses!
    // (new Promise((resolve, reject) => { resolve() }))
    client.evolvePokemon(pokemon.id)
      .then(() => {
        console.log(`[+] Evolved Pokemon with id: ${pokemon.id}`)

        event.sender.send('evolve-pokemon-complete', pokemon)
      }).catch(console.error)
  }, delay)
})

ipcMain.on('favorite-pokemon', (event, id, isFavorite) => {
  client.setFavoritePokemon(id, isFavorite)
    .then(() => {
      getPlayersPokemons(event, 'async')
    }).catch(console.error)
  console.log(`[+] Pokemon favorite status set to ${isFavorite}`)
})

ipcMain.on('rename-pokemon', (event, id, nickname) => {
  client.nicknamePokemon(id, nickname)
    .then(() => {
      console.log(`[+] Pokemon ${id} nicknamed ${nickname}`)

      event.sender.send('rename-pokemon-complete', id, nickname)
    }).catch(console.error)
})
// END OF POKEMON
