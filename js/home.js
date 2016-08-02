const ipc = require('electron').ipcRenderer
const pogoUtils = require('pogobuf').Utils
const POGOProtos = require('node-pogo-protos')

const header = document.getElementById('profile-header')
const usernameH = document.getElementById('username-h')
const statusH = document.getElementById('status-h')
const refreshBtn = document.getElementById('refresh-btn')
const refreshBtnCandy = document.getElementById('refresh-btn-candy')
const transferBtn = document.getElementById('transfer-btn')
const evolveBtn = document.getElementById('evolve-btn')
const pokemonList = document.getElementById('pokemon-list')
const sortLinks = document.querySelectorAll('td[data-sort]')
const candyList = document.getElementById('candy-list')

// Default sort, sort first by pokemon_id then by cp
var currSortings = ['pokemon_id', 'cp']
var pokemons = []
var running = false

var playerInfo = ipc.sendSync('get-player-info')
if (playerInfo.success) {
  switch (playerInfo.player_data['team']) {
    case 1:
      header.style.backgroundImage = 'url("./imgs/mystic.jpg")'
      break
    case 2:
      header.style.backgroundImage = 'url("./imgs/valor.jpg")'
      break
    case 3:
      header.style.backgroundImage = 'url("./imgs/instinct.jpg")'
      break
  }

  usernameH.innerHTML = playerInfo.player_data['username']

  refreshPokemonList()
  refreshCandyList()
} else {
  ipc.send('error-message', 'Failed in retrieving player info.  Please restart.')
}

refreshBtn.addEventListener('click', refreshPokemonList)

refreshBtnCandy.addEventListener('click' , refreshCandyList)

transferBtn.addEventListener('click', () => {
  if (runningCheck()) return

  var selectedPokemon = document.querySelectorAll('input[type="checkbox"]:checked')

  if (ipc.sendSync('confirmation-dialog', 'transfer').success) {
    running = true
    selectedPokemon.forEach((pokemon, index) => {
      ipc.send('transfer-pokemon', pokemon.value, index * randomDelay(2, 3))
    })
    countDown('Transfer', selectedPokemon.length * 2.5)
  }
})

evolveBtn.addEventListener('click', () => {
  if (runningCheck()) return

  var selectedPokemon = document.querySelectorAll('input[type="checkbox"]:checked')

  if (ipc.sendSync('confirmation-dialog', 'evolve').success) {
    running = true
    selectedPokemon.forEach((pokemon, index) => {
      ipc.send('evolve-pokemon', pokemon.value, index * randomDelay(25, 30))
    })
    countDown('Evolve', selectedPokemon.length * 27.5)
  }
})

for (var i = 0; i < sortLinks.length; i++) {
  sortLinks[i].addEventListener('click', function (e) {
    sortPokemonList(this.dataset.sort)
  })
}

function refreshPokemonList () {
  pokemons = ipc.sendSync('get-players-pokemons')
  if (pokemons.success) sortPokemonList(currSortings[0], true)
}

function sortPokemonList (sorting, refresh) {
  var lastSort = currSortings[0]
  var isSameSort = sorting === lastSort || '-' + sorting === lastSort
  var newSort = (!refresh && sorting === lastSort ? '-' : '') + sorting

  if (isSameSort) {
    currSortings[0] = newSort
  } else {
    currSortings.pop()
    currSortings.unshift(newSort)
  }

  pokemons.pokemon.sort(sortBy(currSortings))

  pokemonList.innerHTML = ''

  pokemons.pokemon.forEach(poke => {
    var checkBox = '<input type="checkbox" value="' + poke['id'].toString() + '"'
    var favorite = 'glyphicon glyphicon-star-empty'

    if (poke['deployed']) checkBox += ' disabled'
    if (poke['favorite']) favorite = 'glyphicon glyphicon-star favorite-yellow'
    var favoriteBool = poke['favorite'] ? 'true' : 'false'

    let spriteClassName = poke['name'].toLowerCase()

    if (spriteClassName.indexOf('nidoran') > -1) {
      let spriteParts = spriteClassName.split(' ')
      spriteClassName = `${spriteParts[0]}-${spriteParts[1][0]}`
    }

    var html = '<tr>'
    html += '<td>' + checkBox + '></td>'
    html += '<td><span class="favorite ' + favorite + '" id="favoriteBtn" data-pokemon-id="' + poke['id'] + '" data-pokemon-favorited="' + favoriteBool + '" /></td>'
    html += '<td>' + poke['pokemon_id'] + '</td>'
    html += '<td>' + '<div class="pokemon-avatar"><div class="pokemon-sprite ' + spriteClassName + '"></div></div>' + '</td>'
    html += '<td>' + poke['name'] + '</td>'
    html += '<td class="nickname" data-toggle="modal" data-target="#bulbasaurModal">' + poke['nickname'] + '</td>'
    html += '<td>' + poke['cp'] + '</td>'
    html += '<td>' + poke['iv'] + '% (' + poke['attack'] + '/' + poke['defense'] + '/' + poke['stamina'] + ')</td>'
    html += '</tr>'
    pokemonList.innerHTML += html
  })

  addFavoriteButtonEvent()
}

function refreshCandyList(){
  var candyInfo = ipc.sendSync('get-candy-info')
  if (candyInfo.success) {
    candyInfo.candy.sort((a, b) => {
      if (a['family_id'] < b['family_id']) return -1
      if (a['family_id'] > b['family_id']) return 1
      return 0
  })


    candyList.innerHTML = ''

    candyInfo.candy.forEach(fam => {
    var familyId = fam['family_id']
    var numOfPkm = fam['quantity']
    var candies = fam['candies']
    var costPerEv = calcEvolveCost(familyId)
    var numOfEvoPos = (candies / costPerEv).toFixed(0).toString()
    var toNextEvo = costPerEv - (candies % costPerEv)

    var familyName = pogoUtils.getEnumKeyByValue(POGOProtos.Enums.PokemonFamilyId, familyId)

    candyList.innerHTML += '<tr><td>' + familyId + '</td><td>' + familyName + '</td><td>' + numOfPkm + '</td>' +
    '<td>' + candies +'</td><td>' +costPerEv +'</td><td>' + numOfEvoPos + '</td><td>' +toNextEvo+'</td></tr>'
    })
  }
}

function calcEvolveCost(famid){
  switch(famid){
    case 10:
    case 13:
    case 16:
      return 12
      break;

    case 147:
    case 133:
    case 92:
    case 74:
    case 69:
    case 63:
    case 60:
    case 43:
    case 32:
    case 29:
    case 19:
    case 7:
    case 4:
    case 1:
      return 25
      break;

    case 129:
      return 400
      break;

    default:
      return 50
      break;
  }
}

function runningCheck () {
  if (running) {
    ipc.send('error-message', 'An action is already running')
    return true
  }
  return false
}

function countDown (method, index) {
  var interval = setInterval(() => {
    statusH.innerHTML = method + ' / ' + index + ' second(s) left'
    index--
    if (index <= 0) {
      clearInterval(interval)
      running = false
      statusH.innerHTML = 'Idle'
      ipc.send('error-message', 'Complete!')
    }
  }, 1000)
}

function randomDelay (min, max) {
  return Math.round((min + Math.random() * (max - min)) * 1000)
}

function sortBy (props) {
  var orders = props.map((prop) => {
    return prop.substr(0, 1) === '-' ? -1 : 1
  })

  props = props.map((prop) => {
    if (prop.substr(0, 1) === '-') prop = prop.substr(1)
    return prop
  })

  function doSort (a, b, i) {
    if (i === props.length) return 0
    return (a[props[i]] < b[props[i]]) ? -1 * orders[i]
           : (a[props[i]] > b[props[i]]) ? 1 * orders[i]
           : doSort(a, b, ++i)
  }

  return function (a, b) {
    return doSort(a, b, 0)
  }
}

function addFavoriteButtonEvent () {
  var buttons = document.querySelectorAll('#favoriteBtn')
  buttons.forEach((button) => {
    button.addEventListener('click', (event) => {
      var setToFavorite = button.dataset.pokemonFavorited === 'false'
      ipc.send('favorite-pokemon', button.dataset.pokemonId, setToFavorite)
      var newClass = setToFavorite ? 'favorite glyphicon glyphicon-star favorite-yellow' : 'favorite glyphicon glyphicon-star-empty'
      button.className = newClass
      button.dataset.pokemonFavorited = setToFavorite.toString()
    })
  })
}
