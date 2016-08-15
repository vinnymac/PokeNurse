import React from 'react'
import $ from 'jquery'

// import renderModal from '../Detail'
import SpeciesTable from './components/Species'

import { Immutable, Organize } from '../../utils'

let COLUMN_SORT_AS_NUM = {
  nickname: false,
  iv: true,
  cp: true,
  favorite: true,
  pokemon_id: true,
  name: false,
  count: true,
  candy: true,
  evolves: true
}

window.$ = window.jQuery = $
require('bootstrap')
require('datatables.net')(window, $)
require('datatables.net-bs')(window, $)

const ipc = require('electron').ipcRenderer

let monsters = []
let running = false

// Helper Methods

function runningCheck () {
  if (running) {
    ipc.send('error-message', 'An action is already running')
    return true
  }
  return false
}

function countDown (method, index, statusH, callback) {
  var interval = setInterval(() => {
    statusH.innerHTML = method + ' / ' + index + ' second(s) left'
    index--
    if (index <= 0) {
      clearInterval(interval)
      running = false
      statusH.innerHTML = 'Idle'
      callback()
    }
  }, 1000)
}

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
    var poke = d.pokemon[ i ]
    html += '<tr>'
    html += '<td>' + poke.td_checkbox + '</td>'
    html += '<td data-order="' + poke.favorite + '">' + poke.td_favorite + '</td>'
    html += '<td>' + poke.td_powerup + '</td>'
    html += '<td data-order="' + poke.name + i + '">' + poke.td_name + '</td>'
    html += '<td data-order="' + poke.nickname + i + '">' + poke.td_nickname + '</td>'
    html += '<td>' + poke.td_cp + '</td>'
    html += '<td data-order="' + poke.iv + '">' + poke.td_pokeiv + '</td>'
    html += '</tr>'
  }
  html += '</tbody>'
  html += '</table>'

  return html
}

function getTooltipAttributes (tip) {
  return `data-toggle="tooltip" data-placement="right" data-html=true title="${tip}"`
}

function prepDisplay (d) {
  for (var i = 0; i < d.pokemon.length; i++) {
    var poke = d.pokemon[ i ]
    var checkBox = '<input type="checkbox" value="' + poke.id.toString() + '"'
    var favorite = 'glyphicon glyphicon-star-empty'
    var pokeiv = poke[ 'iv' ] + '% (' + poke[ 'attack' ] + '/' + poke[ 'defense' ] + '/' + poke[ 'stamina' ] + ')'
    var favoriteBool = poke[ 'favorite' ] ? 'true' : 'false'

    if (poke.deployed || poke.favorite) checkBox += ' disabled'
    if (poke.favorite) favorite = 'glyphicon glyphicon-star favorite-yellow'

    poke.td_checkbox = checkBox + '>'

    if (poke.cp === poke.max_cp) {
      let tip = `Max CP ${poke.max_cp}`
      poke.td_powerup = '<span ' + getTooltipAttributes(tip) + '>P↑</span>'
    } else {
      let tip = `
      Stardust Cost = ${poke.stardust_cost} <br>
      Candy Cost = ${poke.candy_cost} <br>
      CP After ≅ ${Math.round(poke.next_cp) + poke.cp} <br>
      Max Stardust = ${poke.stardust_max_cost} <br>
      Max Candy = ${poke.candy_max_cost}
      `
      poke.td_powerup = '<a id="powerUp" data-pokemon-id="' + poke.id + '" data-nickname="' + poke.nickname + '" ' + getTooltipAttributes(tip) + '>P↑</a>'
    }

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
      if (ipc.sendSync('confirmation-dialog', 'power up').success) {
        ipc.send('power-up-pokemon', button.dataset.pokemonId, button.dataset.nickname)
        setTimeout(() => { document.getElementById('refresh-btn').click() }, 1500)
      }
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
      if (pokemonById[ 'id' ] === id) {
        pokemonById[ key ] = value
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
      return pokemonById[ 'id' ] === id
    })

    if (pokemon) pokemonMap = { species, pokemon }
  })

  return pokemonMap
}

const Table = React.createClass({

  childContextTypes: {
    monsterUpdater: React.PropTypes.func.isRequired
  },

  getChildContext () {
    return {
      monsterUpdater: this.updateMonster
    }
  },

  getInitialState () {
    let monsters = ipc.sendSync('get-players-pokemons')
    let sortBy = 'pokemon_id'
    let sortDir = 'ASC'

    return {
      monsters: this.getNewMonsters(monsters, sortBy, sortDir),
      filterBy: '',
      sortBy: sortBy,
      sortDir: sortDir
    }
  },

  componentDidMount () {
    document.title = 'PokéNurse • Home'

    ipc.on('receive-players-pokemons', (event, data) => {
      this.setState({ monsters: this.getNewMonsters(data, this.state.sortBy, this.state.sortDir) })
    })

    const header = document.getElementById('profile-header')
    const usernameH = document.getElementById('username-h')

    var playerInfo = ipc.sendSync('get-player-info')
    if (playerInfo.success) {
      switch (playerInfo.player_data[ 'team' ]) {
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

      usernameH.innerHTML = playerInfo.player_data[ 'username' ]

      this._refreshPokemonList()
    } else {
      ipc.send('error-message', 'Failed in retrieving player info.  Please restart.')
    }

    ipc.send('table-did-mount')
  },

  render () {
    // <!--<h5 id="pokestorage-h"></h5>
    // <h5 id="bagstorage-h"></h5>-->
    let {
      monsters,
      filterBy,
      sortBy,
      sortDir
    } = this.state

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

          <div className="row col-md-12">
            <div className='form-group input-group'>
              <span className='input-group-addon'><span className='glyphicon glyphicon-search' aria-hidden='true'></span></span>
              <input
                type='text'
                className='form-control'
                placeholder='Search'
                ref='search'
                onChange={this._onFilterChange}
              />
            </div>
          </div>

          <SpeciesTable
            monsters={monsters}
            filterBy={filterBy}
            sortBy={sortBy}
            sortDir={sortDir}
            sortSpeciesBy={this.sortSpeciesBy}
            updateSpecies={this.updateSpecies}
            getSortedPokemon={this.getSortedPokemon}
          />
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

  updateMonster (pokemon, index, speciesIndex) {
    this.updateSpecies(speciesIndex, (speciesAtIndex) => {
      return {
        pokemon: Immutable.array.set(speciesAtIndex.pokemon, index, pokemon)
      }
    })
    console.log("UPDATING monsters with", pokemon)
  },

  updateSpecies (index, updater) {
    let speciesAtIndex = this.state.monsters.species[index]
    let updatedSpecies = Object.assign({}, speciesAtIndex, updater(speciesAtIndex))

    let updatedMonsters = Object.assign({}, this.state.monsters, {
      species: Immutable.array.set(this.state.monsters.species, index, updatedSpecies)
    })

    this.setState({
      monsters: updatedMonsters
    })
  },

  _onFilterChange (event) {
    this.setState({
      filterBy: String(event.target.value).toLowerCase()
    })
  },

  _handleRefresh () {
    this._refreshPokemonList()
  },

  _handleTransfer () {
    if (runningCheck()) return

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
    if (runningCheck()) return

    var selectedPokemon = document.querySelectorAll('input[type="checkbox"]:checked:not(#checkall)')

    if (ipc.sendSync('confirmation-dialog', 'evolve').success) {
      running = true
      selectedPokemon.forEach((pokemon, index) => {
        ipc.send('evolve-pokemon', pokemon.value, index * randomDelay(25, 30))
      })
      this._countDown('Evolve', selectedPokemon.length * 27.5)
    }
  },

  _countDown (method, index) {
    let { statusH } = this.refs

    countDown(method, index, statusH, () => {
      ipc.send('information-dialog', 'Complete!', `Finished ${method}`)
      this._refreshPokemonList()
    })
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
        {
          className: 'sprites',
          orderable: false,
          data: ((p) => {
            return `<td><img class="pokemon-avatar-sprite" src="./imgs/pokemonSprites/${p.pokemon_id}.png"/></td>`
          }),
          defaultContent: '<td><img src="./imgs/pokemonSprites/0.png"/></td>'
        },
        { data: 'name' },
        { data: 'count' },
        { data: 'candy' },
        { data: 'evolves' }
      ],
      order: [ [ 1, 'asc' ] ]
    })

    let _this = this

    // Add event listener for opening and closing details
    $('#pokemon-data tbody').on('click', 'td.details-control', function () {
      var tr = $(this).closest('tr')
      var row = table.row(tr)

      if (row.child.isShown()) {
        // This row is already open - close it
        $('#' + row.data().pokemon_id).DataTable().destroy()
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
      order: [ [ 4, 'desc' ] ]
    })

    // Check all boxes
    $('#' + d.pokemon_id + ' #checkall').click(function () {
      $(':checkbox', table.rows().nodes()).prop('checked', this.checked)
      $(':checkbox', table.rows().nodes()).filter(':disabled').attr('disabled', true)
    })

    $('#' + d.pokemon_id + ' td span.favorite').click(function () {
      if ($(this).hasClass('favorite-yellow')) {
        $(this).closest('tr').find(':checkbox').attr('disabled', false)
      } else {
        $(this).closest('tr').find(':checkbox').attr('disabled', true)
      }
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
  },

  getSortedSpecies (monsters, sortBy, sortDir) {
    let species = monsters.species.slice()

    if (COLUMN_SORT_AS_NUM[sortBy]) {
      Organize.sortAsNumber(species, sortBy, sortDir)
    } else {
      Organize.sortAsString(species, sortBy, sortDir)
    }

    return species
  },

  getSortedPokemon (specie, sortBy, sortDir) {
    let pokemon = specie.pokemon.slice()

    if (COLUMN_SORT_AS_NUM[sortBy]) {
      Organize.sortAsNumber(pokemon, sortBy, sortDir)
    } else {
      Organize.sortAsString(pokemon, sortBy, sortDir)
    }

    return pokemon
  },

  sortSpeciesBy (newSortBy) {
    let {
      sortBy,
      sortDir
    } = this.state

    let newSortDir = null

    if (newSortBy === sortBy) {
      newSortDir = sortDir === 'ASC' ? 'DESC' : 'ASC'
    } else {
      newSortDir = 'DESC'
    }

    let monsters = Object.assign({}, this.state.monsters, {
      species: this.getSortedSpecies(this.state.monsters, newSortBy, newSortDir)
    })

    this.setState({
      sortDir: newSortDir,
      sortBy: newSortBy,
      monsters: monsters
    })
  },

  getNewMonsters (monsters, sortBy, sortDir) {
    return Object.assign({}, monsters, {
      species: this.getSortedSpecies(monsters, sortBy, sortDir)
    })
  }
})

export default Table
