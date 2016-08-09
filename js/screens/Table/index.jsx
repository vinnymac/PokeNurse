import React from 'react'
import $ from 'jquery'
import renderModal from '../Detail'

window.$ = window.jQuery = $
require('bootstrap')
require('datatables.net')(window, $)
require('datatables.net-bs')(window, $)

const ipc = require('electron').ipcRenderer

let monsters = []
let running = false

// Helper Methods

function randomDelay (min, max) {
  return Math.round((min + Math.random() * (max - min)) * 1000)
}

function format (d) {
  // `d` is the original data object for the row
  let html = ''

  let notSearchableAndOrderable = 'data-orderable="' + false + '" data-searchable="' + false + '"'

  html += '<table class="table table-condensed table-hover" id="' + d.pokemon_id + '" style="width:100%;">'
  html += '<thead>'
  html += '<tr>'
  html += '<th width="5%" ' + notSearchableAndOrderable + '>'
  html += '<input type="checkbox" id="checkall"></th>'
  html += '<th><span class="glyphicon glyphicon-star favorite-yellow"></span></th>'
  html += '<th ' + notSearchableAndOrderable + '>P↑</th>'
  html += '<th>Name</th>'
  html += '<th>Nickname</th>'
  html += '<th>CP</th>'
  html += '<th>IV (A/D/S)</th>'
  html += '</tr>'
  html += '</thead>'
  html += '<tbody>'
  for (var i = 0; i < d.pokemon.length; i++) {
    var poke = d.pokemon[i]
    html += '<tr>'
    html += '<td>' + poke.td_checkbox + '</td>'
    html += '<td data-order="' + poke.favorite + '">' + poke.td_favorite + '</td>'
    html += '<td>' + poke.td_powerup + '</td>'
    html += '<td data-order="' + poke.name + i + '">' + poke.td_name + '</td>'
    html += '<td data-order="' + poke.nickname + i + '">' + poke.td_nickname + '</td>'
    html += '<td>' + poke.td_cp + '</td>'
    html += '<td>' + poke.td_pokeiv + '</td>'
    html += '</tr>'
  }
  html += '</tbody>'
  html += '</table>'

  return html
}

function prepDisplay (d) {
  for (var i = 0; i < d.pokemon.length; i++) {
    var poke = d.pokemon[i]
    var checkBox = '<input type="checkbox" value="' + poke.id.toString() + '"'
    var favorite = 'glyphicon glyphicon-star-empty'
    var pokeiv = poke['iv'] + '% (' + poke['attack'] + '/' + poke['defense'] + '/' + poke['stamina'] + ')'
    var favoriteBool = poke['favorite'] ? 'true' : 'false'

    if (poke.deployed) checkBox += ' disabled'
    if (poke.favorite) favorite = 'glyphicon glyphicon-star favorite-yellow'

    poke.td_checkbox = checkBox + '>'
    let tip = `Cost: Stardust ${1000} | Candy ${1}`
    let tooltip = 'data-toggle="tooltip" data-placement="right" title="' + tip + '"'
    poke.td_powerup = '<a id="powerUp" data-pokemon-id="' + poke.id + '" data-nickname="' + poke.nickname + '" ' + tooltip + '>P↑</a>'
    poke.td_favorite = '<span class="favorite ' + favorite + '" id="favoriteBtn" data-pokemon-id="' + poke.id + '" data-pokemon-favorited="' + favoriteBool + '" />'
    poke.td_name = poke.name
    poke.td_nickname = '<a class="nickname" data-pokemon-id="' + poke.id + '">' + poke.nickname + '</a>'
    poke.td_cp = poke.cp
    poke.td_pokeiv = pokeiv
  }

  return d.pokemon
}

function addPowerUpButtonEvent () {
  let buttons = document.querySelectorAll('#powerUp')

  buttons.forEach((button) => {
    button.addEventListener('click', (event) => {
      ipc.send('power-up-pokemon', button.dataset.pokemonId, button.dataset.nickname)
    })
  })

  // Enable Tooltips
  $('[data-toggle="tooltip"]').tooltip()
}

function addFavoriteButtonEvent () {
  var buttons = document.querySelectorAll('#favoriteBtn')
  buttons.forEach((button) => {
    button.addEventListener('click', (event) => {
      var setToFavorite = button.dataset.pokemonFavorited === 'false'
      ipc.send('favorite-pokemon', button.dataset.pokemonId, setToFavorite)
      updatePokemonById(button.dataset.pokemonId, 'favorite', setToFavorite)
      var newClass = setToFavorite ? 'favorite glyphicon glyphicon-star favorite-yellow' : 'favorite glyphicon glyphicon-star-empty'
      button.className = newClass
      button.dataset.pokemonFavorited = setToFavorite.toString()
    })
  })
}

function updatePokemonById (id, key, value) {
  let updated = false

  monsters.species.forEach(species => {
    species.pokemon.forEach(pokemonById => {
      if (pokemonById['id'] === id) {
        pokemonById[key] = value
        updated = true
      }
    })
  })

  return updated
}

function findPokemonMapById (id) {
  let pokemonMap = null

  monsters.species.forEach(species => {
    let pokemon = species.pokemon.find(pokemonById => {
      return pokemonById['id'] === id
    })

    if (pokemon) pokemonMap = {species, pokemon}
  })

  return pokemonMap
}

const Table = React.createClass({

  componentDidMount () {
    document.title = 'PokéNurse • Home'

    const header = document.getElementById('profile-header')
    const usernameH = document.getElementById('username-h')

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

      this._refreshPokemonList()
    } else {
      ipc.send('error-message', 'Failed in retrieving player info.  Please restart.')
    }

    ipc.send('table-did-mount')
  },

  render () {
    // <!--<h5 id="pokestorage-h"></h5>
    // <h5 id="bagstorage-h"></h5>-->
    return (
      <div>
        <header className='header' id='profile-header'>
          <p id='username-h'></p>
          <p>Status: <span id='status-h' ref='statusH'>Idle</span></p>
        </header>

        <div className='container'>
          <h1>
            <span>Pokémon</span>
            <span
              className='glyphicon glyphicon-refresh'
              id='refresh-btn'
              onClick={this._handleRefresh}
            />

            <span className='pull-right'>
              <input
                type='button'
                className='btn btn-warning'
                id='transfer-btn'
                value='Transfer selected'
                onClick={this._handleTransfer}
              />
              {" "}
              <input
                type='button'
                className='btn btn-danger'
                id='evolve-btn'
                value='Evolve selected'
                onClick={this._handleEvolve}
              />
            </span>
          </h1>

          <table className='table table-condensed table-hover display' id='pokemon-data'>
            <thead>
              <tr>
                <th></th>
                <th width='18%'>Pokédex #</th>
                <th>Name</th>
                <th>Count</th>
                <th>Candy</th>
                <th>Evolves</th>
              </tr>
            </thead>
          </table>
        </div>

        <div
          className='modal fade'
          id='detailModal'
          tabIndex='-1'
          role='dialog'
          aria-labelledby='detailModalLabel'
          ref='detailModal'
        ></div>
      </div>
    )
  },

  _handleRefresh () {
    this._refreshPokemonList()
  },

  _handleTransfer () {
    if (this._runningCheck()) return

    var selectedPokemon = document.querySelectorAll('input[type="checkbox"]:checked:not(#checkall)')

    if (ipc.sendSync('confirmation-dialog', 'transfer').success) {
      running = true
      selectedPokemon.forEach((pokemon, index) => {
        ipc.send('transfer-pokemon', pokemon.value, index * randomDelay(2, 3))
      })
      this._countDown('Transfer', selectedPokemon.length * 2.5)
    }
  },

  _handleEvolve () {
    if (this._runningCheck()) return

    var selectedPokemon = document.querySelectorAll('input[type="checkbox"]:checked:not(#checkall)')

    if (ipc.sendSync('confirmation-dialog', 'evolve').success) {
      running = true
      selectedPokemon.forEach((pokemon, index) => {
        ipc.send('evolve-pokemon', pokemon.value, index * randomDelay(25, 30))
      })
      this._countDown('Evolve', selectedPokemon.length * 27.5)
    }
  },

  _runningCheck () {
    if (running) {
      ipc.send('error-message', 'An action is already running')
      return true
    }
    return false
  },

  _countDown (method, index) {
    let {statusH} = this.refs

    var interval = setInterval(() => {
      statusH.innerHTML = method + ' / ' + index + ' second(s) left'
      index--
      if (index <= 0) {
        clearInterval(interval)
        running = false
        statusH.innerHTML = 'Idle'
        ipc.send('error-message', 'Complete!')
        this._refreshPokemonList()
      }
    }, 1000)
  },

  _refreshPokemonList () {
    $('#pokemon-data').DataTable().destroy()
    monsters = ipc.sendSync('get-players-pokemons')
    if (monsters.success) this._dataTables(monsters.species)
  },

  _dataTables (pokemon) {
    var table = $('#pokemon-data').DataTable({
      data: pokemon,
      className: 'details-control',
      bPaginate: false,
      bInfo: false,
      columns: [
        {
          className: 'details-control',
          orderable: false,
          data: null,
          defaultContent: ''
        },
        { data: 'pokemon_id' },
        { data: 'name' },
        { data: 'count' },
        { data: 'candy' },
        { data: 'evolves' }
      ],
      order: [[1, 'asc']]
    })

    let _this = this

    // Add event listener for opening and closing details
    $('#pokemon-data tbody').on('click', 'td.details-control', function () {
      var tr = $(this).closest('tr')
      var row = table.row(tr)

      if (row.child.isShown()) {
        // This row is already open - close it
        row.child.hide()
        tr.removeClass('shown')
      } else {
        // Open this row
        prepDisplay(row.data())
        row.child(format(row.data()), 'child').show()
        tr.addClass('shown')
        _this._subDataTable(row.data())
      }
    })
  },

  _subDataTable (d) {
    var table = $('#' + d.pokemon_id).DataTable({
      bPaginate: false,
      info: false,
      bFilter: false,
      order: [[4, 'desc']]
    })

    // Check all boxes
    $('#' + d.pokemon_id + ' #checkall').click(function () {
      $(':checkbox', table.rows().nodes()).prop('checked', this.checked)
    })

    document.querySelectorAll('td a.nickname').forEach(el => {
      el.addEventListener('click', this._showModal.bind(this, $(el).data('pokemon-id')), false)
    })

    addFavoriteButtonEvent()
    addPowerUpButtonEvent()
  },

  _showModal (id, event) {
    let pokemonMap = findPokemonMapById(id)

    if (!pokemonMap) {
      console.error('No Pokemon Found to Display Detail')
      return
    }

    renderModal($(this.refs.detailModal), pokemonMap)
  }
})

export default Table
