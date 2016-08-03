const ipc = require('electron').ipcRenderer

const header = document.getElementById('profile-header')
const usernameH = document.getElementById('username-h')
const statusH = document.getElementById('status-h')
const refreshBtn = document.getElementById('refresh-btn')
const transferBtn = document.getElementById('transfer-btn')
const evolveBtn = document.getElementById('evolve-btn')
const pokemonList = document.getElementById('pokemon-list')
const sortLinks = document.querySelectorAll('td[data-sort]')
const detailModal = document.getElementById('detailModal')

// const $detailModal = $(detailModal)
//
// $detailModal.on('show.bs.modal', (event) => {
//   let $nickname = $(event.relatedTarget)
//
//   console.log(event, $nickname, $nickname.data('pokemon-id'));
//   $(this).find('.modal-body').html(detailModalBody({}))
// })

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
} else {
  ipc.send('error-message', 'Failed in retrieving player info.  Please restart.')
}

refreshBtn.addEventListener('click', refreshPokemonList)

transferBtn.addEventListener('click', () => {
  if (runningCheck()) return

  var selectedPokemon = document.querySelectorAll('input[type="checkbox"]:checked:not(#checkall)')

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

function refreshPokemonList () {
  $("#pokemon-data").DataTable().destroy();
  pokemons = ipc.sendSync('get-players-pokemons')
  if (pokemons.success) dataTables(pokemons.pokemon)
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
    html += '<td>' + '<div class="pokemon-avatar"><div class="pokemon-sprite ' + poke['name'].toLowerCase() + '"></div></div>' + '</td>'
    html += '<td>' + poke['name'] + '</td>'
    html += '<td><a class="nickname" data-pokemon-id="' + poke['id'] + '">' + poke['nickname'] + '</a></td>'
    html += '<td>' + poke['cp'] + '</td>'
    html += '<td>' + poke['iv'] + '% (' + poke['attack'] + '/' + poke['defense'] + '/' + poke['stamina'] + ')</td>'
    html += '</tr>'
    pokemonList.innerHTML += html
  })

  document.querySelectorAll('td a.nickname').forEach(el => {
    el.addEventListener('click', showModal.bind(this, $(el).data('pokemon-id')), false);
  })

  addFavoriteButtonEvent()
}

function format ( d ) {
    // `d` is the original data object for the row
     return '<table class="table table-condensed table-hover" id="'+d.pokemon_id+'" style="width:100%;">'
        + '<thead>'
          + '<tr>'
            + '<th width="5%"><input type="checkbox" id="checkall"></th>'
            + '<th>'
              + '<span class="glyphicon glyphicon-star favorite-yellow"></span>'
            + '</th>'
            + '<th>Name</th>'
            + '<th>Nickname</th>'
            + '<th>CP</th>'
            + '<th>IV (A/D/S)</th>'
          + '</tr>'
        + '</thead>'
        + '</table>';
}

function dataTables(pokemon) {
    var table = $('#pokemon-data').DataTable( {
      data: pokemon,
      className: 'details-control',
      bPaginate: false,
      bInfo: false,
      columns: [
      {
        className:      'details-control',
        orderable:      false,
        data:           null,
        defaultContent: ''

      },
      { data: "pokemon_id" },
      { data: "name" },
      { data: "count" },
      { data: "candy" },
      { data: "evolves" }
      ],
      order: [[1, 'asc']]
    } );

        // Add event listener for opening and closing details
        $('#pokemon-data tbody').on('click', 'td.details-control', function () {
          var tr = $(this).closest('tr');
          var row = table.row( tr );

          if ( row.child.isShown() ) {
            // This row is already open - close it
            row.child.hide();
            tr.removeClass('shown');
          }
          else {
            // Open this row
            row.child( format(row.data()), 'child').show();
            tr.addClass('shown');
            var prepped = prep_display(row.data())
            sub_datatable(row.data(), prepped)
          }
        } );

}

function prep_display(d) {

  for (var i = 0; i < d.pokemon.length; i++) {
    var poke = d.pokemon[i]
    var checkBox = '<input type="checkbox" value="' + poke.id.toString() + '"'
    var favorite = 'glyphicon glyphicon-star-empty'
    var pokeiv = poke['iv'] + '% (' + poke['attack'] + '/' + poke['defense'] + '/' + poke['stamina'] + ')'
    var favoriteBool = poke['favorite'] ? 'true' : 'false'

    if (poke.deployed) checkBox += ' disabled'
    if (poke.favorite) favorite = 'glyphicon glyphicon-star favorite-yellow'

      poke.checkbox = checkBox + '>'
      poke.favorite = '<span class="favorite ' + favorite + '" id="favoriteBtn" data-pokemon-id="' + poke.id + '" data-pokemon-favorited="' + favoriteBool + '" />'
      poke.nickname = '<a class="nickname" data-pokemon-id="' + poke.id + '">' + poke.nickname + '</a>'
      poke.pokeiv = pokeiv
    }

  return d.pokemon
  }

  function sub_datatable(d, p) {

    var table = $('#' + d.pokemon_id).DataTable( {
      data: p,
      bPaginate: false,
      info: false,
      bFilter: false,
      columns: [
      { data: "checkbox", orderable: false },
      { data: "favorite" },
      { data: "name" },
      { data: "nickname" },
      { data: "cp" },
      { data: "pokeiv" },
      ],
      order: [[4, 'asc']],
    } );

    // Check all boxes
    $('#'+d.pokemon_id+' #checkall').click(function () {
      $(':checkbox', table.rows().nodes()).prop('checked', this.checked);
    } );

  document.querySelectorAll('td a.nickname').forEach(el => {
    el.addEventListener('click', showModal.bind(this, $(el).data('pokemon-id')), false);
  })

  addFavoriteButtonEvent()
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

function showModal (id, event) {

  let pokemonMap = null

  pokemons.pokemon.forEach(species => {
    let pokemon = species.pokemon.find(pokemonById => {
      return pokemonById['id'] === id
    })

    if (pokemon) pokemonMap = {species, pokemon}
  })

  if (!pokemonMap) {
    console.error("No Pokemon Found to Display Detail")
    return
  }

  let $detailModal = $(detailModal)

  $detailModal.find('.modal-title').text(pokemonMap.species.name)
  $detailModal.find('.modal-body').html(detailModalBody(pokemonMap.pokemon))
  $detailModal.modal('show')
}

function detailModalBody (pokemon) {
  // Calculate CP Progress dot position
  let minCP = 10
  let maxCP = 1000 - minCP // TODO need data to get true max
  let minDeg = 0
  let maxDeg = 180
  let degree = Math.max(Math.min((pokemon.cp / maxCP) * maxDeg, maxDeg), minDeg)

  let transform = `rotate(${degree}deg) translate(-192px);`

  let html = ''

  // TODO find and use some JSON data
  // Examples
  // https://gist.github.com/shri/9754992
  // https://gist.github.com/ihciah/71b0bf44322431bd34dea4ff193267e5

  // Sprite and CP Bar
  html += '<div id="pokemon_sprite_wrapper">'
  html += '<div id="pokemon_sprite_sphere_wrapper">'
  html += '<div id="pokemon_sprite_sphere"></div>'
  html += '<div id="pokemon_sprite_sphere_dot" style="transform:' + transform + '"></div>'
  html += '</div>'
  // TODO stop downloading these from pogo-dex
  html += '<img id="pokemon_profile_sprite" src="http://www.pogo-dex.com/images/sprites/' + pokemon.name.toLowerCase() + '.png">'
  html += '</div>'

  // TODO Base Attack and Defense
  // Contents - Name, HP, Type, Weight, Height, Attack, Defense, CP, Candies
  html += '<div id="pokemon_contents">'
  html += '<div id="pokemon_name">' + pokemon.nickname + '</div>'
  html += '<div id="pokemon_health_bar"></div>'
  html += '<div id="pokemon_health">HP 90 / 90</div>'
  html += '<div id="pokemon_info">'
  html += '<div class="pokemon-info-item">'
  html += '<div class="pokemon-info-item-text">grass / poison</div>'
  html += '<div class="pokemon-info-item-title">Type</div>'
  html += '</div>'
  html += '<div class="pokemon-info-item">'
  html += '<div class="pokemon-info-item-text">6.04 - 7.76 <span class="pokemon-stat-unit">kg</span></div>'
  html += '<div class="pokemon-info-item-title">Weight</div>'
  html += '</div>'
  html += '<div class="pokemon-info-item">'
  html += '<div class="pokemon-info-item-text">0.61 - 0.79 <span class="pokemon-stat-unit">m</span></div>'
  html += '<div class="pokemon-info-item-title">Height</div>'
  html += '</div>'
  html += '</div>'
  html += '<div id="pokemon_info">'
  html += '<div class="pokemon-combat-info-item">'
  html += '<div class="pokemon-combat-info-item-text">' + pokemon.attack + '</div>'
  html += '<div class="pokemon-info-item-title">Attack</div>'
  html += '</div>'
  html += '<div class="pokemon-combat-info-item">'
  html += '<div class="pokemon-combat-info-item-text">' + pokemon.defense + '</div>'
  html += '<div class="pokemon-info-item-title">Defense</div>'
  html += '</div>'
  html += '</div>'
  html += '<div id="pokemon_upgrade_info">'
  html += '<div class="pokemon-upgrade-info-item">'
  html += '<div class="pokemon-upgrade-info-item-text cp-upgrade">+13 CP (+/-)</div>'
  html += '<div class="pokemon-upgrade-info-item-title">CP Per Upgrade</div>'
  html += '</div>'
  html += '<div class="pokemon-upgrade-info-item">'
  html += '<div class="pokemon-upgrade-info-item-text">25</div>'
  html += '<div class="pokemon-upgrade-info-item-title">' + pokemon.name + ' CANDIES</div>'
  html += '</div>'
  html += '</div>'

  // TODO basic moves
  // Base Attacks
  // html += '<div id="pokemon_basic_move_info">'
  // html += '<div class="pokemon-moves-info-title">Basic Attacks</div>'
  // html += '<div class="pokemon-move-item">'
  // html += '<span class="pokemon-move-title">vine whip</span>'
  // html += '<span class="pokemon-move-type grass">grass</span>'
  // html += '<span class="pokemon-move-damage">10</span>'
  // html += '</div>'
  // html += '<div class="pokemon-move-item">'
  // html += '<span class="pokemon-move-title">tackle</span>'
  // html += '<span class="pokemon-move-type normal">normal</span>'
  // html += '<span class="pokemon-move-damage">12</span>'
  // html += '</div>'
  // html += '</div>'

  // TODO Potential special movesets for each pokemon
  // Special Attacks
  // html += '<div id="pokemon_special_move_info">'
  // html += '<div class="pokemon-moves-info-title">Special Attacks</div>'
  // html += '<div class="pokemon-move-item">'
  // html += '<div class="pokemon-move-title">sludge bomb</div>'
  // html += '<div class="pokemon-move-cost">'
  // html += '<div class="pokemon-move-cost-item" style="width:67px;"></div><div class="pokemon-move-cost-item" style="width:67px;"></div>'
  // html += '</div>'
  // html += '<span class="pokemon-move-type poison">poison</span>'
  // html += '<span class="pokemon-move-damage">50</span>'
  // html += '</div>'
  // html += '<div class="pokemon-move-item">'
  // html += '<div class="pokemon-move-title">seed bomb</div>'
  // html += '<div class="pokemon-move-cost">'
  // html += '<div class="pokemon-move-cost-item" style="width:41.5px;"></div><div class="pokemon-move-cost-item" style="width:41.5px;"></div><div class="pokemon-move-cost-item" style="width:41.5px;"></div>'
  // html += '</div>'
  // html += '<span class="pokemon-move-type grass">grass</span>'
  // html += '<span class="pokemon-move-damage">30</span>'
  // html += '</div>'
  // html += '<div class="pokemon-move-item">'
  // html += '<div class="pokemon-move-title">power whip</div>'
  // html += '<div class="pokemon-move-cost">'
  // html += '<div class="pokemon-move-cost-item" style="width:142px;"></div>'
  // html += '</div>'
  // html += '<span class="pokemon-move-type grass">grass</span>'
  // html += '<span class="pokemon-move-damage">60</span>'
  // html += '</div>'
  // html += '</div>'

  // TODO JSON list of evolutions
  // Evolutions
  // html += '<div id="pokemon_evolve_info">'
  // html += '<div class="pokemon-evolve-info-title">Evolutions</div>'
  // html += '<a href="/pokemon/ivysaur" class="pokemon-evolve-info-item">'
  // html += '<div class="pokemon-sprite ivysaur"></div>'
  // html += '<div class="pokemon-evolve-info-item-title">ivysaur</div>'
  // html += '</a>'
  // html += '</div>'
  // html += '</div>'

  return html
}
