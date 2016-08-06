const {app, BrowserWindow, ipcMain, dialog, Menu} = require('electron')
const menuTemplate = require('./main_menu')
const fs = require('fs')
const path = require('path')
const pogobuf = require('pogobuf')
const POGOProtos = require('node-pogo-protos')
const evolveCost = require('./evolveCost')
const familiesById = require('./familiesById')
const baseStats = require('./baseStats')

const accountPath = path.join(app.getPath('appData'), '/pokenurse/account.json')

let win
let client

function createWindow () {
  win = new BrowserWindow({ width: 800, height: 375, title: 'PokéNurse', icon: 'imgs/emojioneicon.png' })
  // win.setMenu(null)
  win.loadURL(`file://${__dirname}/login.html`)
  win.show()

  // Prevent BrowserWindow from navigating when user drags/drops files
  win.webContents.on('will-navigate', (e) => {
    e.preventDefault()
  })

  // allow garbage collection to occur on win when closed
  win.on('closed', () => {
    win = null
  })

  // Create/set the main menu
  let menu = Menu.buildFromTemplate(menuTemplate)
  Menu.setApplicationMenu(menu)

  client = new pogobuf.Client()
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

ipcMain.on('confirmation-dialog', (event, method) => {
  dialog.showMessageBox(win, {
    type: 'question',
    buttons: ['Yes', 'Cancel'],
    title: 'Confirmation',
    message: 'Are you sure you want to ' + method + ' the selected Pokemon?'
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

  var credentials = {}

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
  }).catch(error => {
    console.error(error)
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
  console.log("[+] Retrieving player's Pokemons and Calculating Evolves")
  client.getInventory(0).then(inventory => {
    if (!inventory['success']) {
      event.returnValue = {
        success: false
      }
      return
    }

    var formattedEvolves = {}

    for (let i = 0; i < evolveCost.data.length; i++) {
      var evolve = evolveCost.data[i]

      formattedEvolves[ evolve.id.toString() ] = evolve.cost
    }

    var formattedFamilies = {}

    for (let i = 0; i < familiesById.data.length; i++) {
      var family = familiesById.data[i]

      formattedFamilies[ family.id.toString() ] = family.family
    }

    var candies = pogobuf.Utils.splitInventory(inventory)['candies']
    var formattedCandies = {}

    for (let i = 0; i < candies.length; i++) {
      var candy = candies[i]
      formattedCandies[ candy.family_id.toString() ] = candy.candy
    }

    var pokemons = pogobuf.Utils.splitInventory(inventory)['pokemon']
    var reducedPokemonList = []
    var combinedPokemonList = []

    for (let i = 0; i < pokemons.length; i++) {
      var pokemon = pokemons[i]

      if (pokemon['cp'] === 0) continue

      var pokemonName = pogobuf.Utils.getEnumKeyByValue(POGOProtos.Enums.PokemonId, pokemon['pokemon_id'])

      let stats = baseStats[pokemon['pokemon_id']]

      // let totalCpMultiplier = pokemon['cp_multiplier'] + pokemon['additional_cp_multiplier']

      let attack = stats.BaseAttack + pokemon['individual_attack']
      let defense = Math.pow((stats.BaseDefense + pokemon['individual_defense']), 0.5)
      let stamina = Math.pow((stats.BaseStamina + pokemon['individual_stamina']), 0.5)

      var maxCP = Math.floor(attack * defense * stamina * Math.pow(0.790300, 2) / 10)

      // (BaseAtk + IndAtk) * (BaseDef + IndDef)^0.5 * (BaseSta + IndSta)^0.5 * (0.790300)^2 / 10

      reducedPokemonList.push({
        cp: pokemon['cp'],
        // TODO Rest of formula
        // https://www.reddit.com/r/TheSilphRoad/comments/4t7r4d/exact_pokemon_cp_formula/
        max_cp: maxCP,
        creation_time_ms: pokemon['creation_time_ms'].toString(),
        deployed: pokemon['deployed_fort_id'] !== '',
        id: pokemon['id'].toString(),
        attack: pokemon['individual_attack'],
        defense: pokemon['individual_defense'],
        stamina: pokemon['individual_stamina'],
        current_stamina: pokemon['stamina'],
        stamina_max: pokemon['stamina_max'],
        iv: parseInt(pogobuf.Utils.getIVsFromPokemon(pokemon).percent),
        pokemon_id: pokemon['pokemon_id'],
        name: pokemonName,
        height: pokemon['height_m'],
        weight: pokemon['weight_kg'],
        nickname: pokemon['nickname'] || pokemonName,
        // Multiply by -1 for sorting
        favorite: pokemon['favorite'] * -1
      })

      if (combinedPokemonList[pokemonName]) {
        combinedPokemonList[pokemonName].count = combinedPokemonList[pokemonName].count + 1
      } else {
        combinedPokemonList[pokemonName] = {
          pokemon_id: pokemon['pokemon_id'],
          name: pokemonName,
          count: +1,
          pokes: []
        }
      }
    }

    // console.log(reducedPokemonList)

    for (let i = 0; i < reducedPokemonList.length; i++) {
      let pokemon = reducedPokemonList[i]

      if (combinedPokemonList[pokemon.name].pokemon_id === pokemon.pokemon_id) {
        combinedPokemonList[pokemon.name].pokes.push(pokemon)
      }
    }

    // console.log(combinedPokemonList)

    var finalList = []

    for (let key in combinedPokemonList) {
      let pokemon = combinedPokemonList[key]
      let candy = formattedCandies[formattedFamilies[pokemon.pokemon_id]]
      var count = pokemon.count
      let evolves = Math.floor(candy / formattedEvolves[pokemon.pokemon_id])

      if ((evolves === Infinity || isNaN(evolves))) {
        evolves = 0
      }

      // console.log(formattedFamilies[pokemon.pokemon_id])

      finalList.push({
        pokemon_id: pokemon.pokemon_id.toString(),
        name: pokemon.name,
        count: count,
        candy: candy,
        evolves: (evolves > count ? count : evolves),
        pokemon: pokemon.pokes
      })
    }

    // console.log(finalList)

    event.returnValue = {
      success: true,
      species: finalList
    }
  })
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
  console.log('[+] Pokemon favorite status set to ' + isFavorite)
})
// END OF POKEMON
