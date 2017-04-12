import {
  createAction
} from 'redux-actions'
import {
  times,
  keyBy,
} from 'lodash'
import pogobuf from 'pogobuf'
import {
  ipcRenderer,
} from 'electron'

import { getClient } from '../client'

// TODO Must move these helpers to app folder
import utils from '../utils'

import {
  updateStatus,
  resetStatus,
} from './status'

function generateEmptySpecie(pokemonDexNumber, candiesByFamilyId, familyId) {
  const name = utils.getName(pokemonDexNumber)
  const candy = candiesByFamilyId && candiesByFamilyId[familyId] ? candiesByFamilyId[familyId].candy : 0

  return {
    candy,
    name,
    pokemon_id: pokemonDexNumber,
    count: 0,
    evolves: 0,
    pokemon: []
  }
}

// Maybe put this info and the helper methods in utils?
// We can't really know how many pokemon there are with POGO
// They are randomly adding pokemon, like the babies, so the counts will be off
// I was going to use the johto count but instead I will use the alola count
// It should future proof us a little better
// const kantoDexCount = 151
// const johotoDexCount = 251
const alolaDexCount = 802

function generateEmptySpecies(candies, pokemonSettings) {
  const candiesByFamilyId = keyBy(candies, (candy) => String(candy.family_id))

  return times(alolaDexCount, (i) => {
    const familyId = pokemonSettings[i] ? pokemonSettings[i].family_id : null
    const pokemonDexNumber = i + 1
    return generateEmptySpecie(pokemonDexNumber, candiesByFamilyId, familyId)
  })
}

// TODO Can we find these constants in POGOProtos or item templates?
const MILLISECONDS_FACTOR = 1000
const MOVE2_CHARGE_DELAY_MS = 500
const STAB_MULTIPLIER = 1.25 // 25% damage boost

function dpsForMove(hasStab, move, primary) {
  const moveDelay = primary ? 0 : MOVE2_CHARGE_DELAY_MS
  let dps = move.power / (move.duration_ms + moveDelay) * MILLISECONDS_FACTOR

  // TODO optional STAB
  if (hasStab) {
    dps *= STAB_MULTIPLIER
  }

  return dps
}

function egpsForMove(move, primary) {
  const moveDelay = primary ? 0 : MOVE2_CHARGE_DELAY_MS
  const egps = move.energy_delta / (move.duration_ms + moveDelay) * MILLISECONDS_FACTOR

  return egps
}

// List of all POGOProtos.Enums.PokemonMove
// types - array of up to two pokemon types ['fire', 'water']
// moveSettings - object holding move meta
// move - id for move
// primary - first or second move
function getMove(types, moveSettings, move, primary) {
  const moveSetting = Object.assign({}, moveSettings[move])

  moveSetting.energy_gain = moveSetting.energy_delta
  moveSetting.dodge_window_ms = moveSetting.damage_window_end_ms - moveSetting.damage_window_start_ms

  moveSetting.energy_cost = moveSetting.energy_delta * -1

  moveSetting.name = moveSetting.vfx_name.split('_').map(utils.capitalize).join(' ')

  moveSetting.type = utils.getType(moveSetting.pokemon_type)

  const hasStab = types.includes(moveSetting.type)
  moveSetting.dps = dpsForMove(hasStab, moveSetting, primary)

  moveSetting.egps = egpsForMove(moveSetting, primary)

  return moveSetting
}

function parseInventory(inventory) {
  const pokemonSettings = splitItemTemplates.pokemon_settings
  const moveSettings = keyBy(splitItemTemplates.move_settings, (moveSetting) => String(moveSetting.movement_id))
  const splitInventory = pogobuf.Utils.splitInventory(inventory)
  const { player, candies, pokemon } = splitInventory

  const speciesList = generateEmptySpecies(candies, pokemonSettings)
  const eggList = []

  // populates the speciesList with pokemon and counts
  // populates the eggList with pokemon
  pokemon.forEach(p => {
    if (p.is_egg) {
      eggList.push(p)
      return
    }

    const pokemonName = utils.getName(p.pokemon_id)
    const pokemonSetting = pokemonSettings[p.pokemon_id - 1]

    const baseAttack = pokemonSetting ? pokemonSetting.stats.base_attack : 0
    const baseDefense = pokemonSetting ? pokemonSetting.stats.base_defense : 0
    const baseStamina = pokemonSetting ? pokemonSetting.stats.base_stamina : 0

    const attack = baseAttack + p.individual_attack
    const defense = baseDefense + p.individual_defense
    const stamina = baseStamina + p.individual_stamina

    const totalCpMultiplier = p.cp_multiplier + p.additional_cp_multiplier

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

    const type1 = utils.getType(pokemonSetting.type)
    const type2 = utils.getType(pokemonSetting.type_2)
    const type = type1 && type2 ? [type1, type2] : [type1 || type2]

    const evolvesTo = pokemonSetting.evolution_ids
      .map(utils.getName)
      .join('/')

    const pokemonCostume = utils.getCostume(p.pokemon_display.costume)
    const pokemonGender = utils.getGender(p.pokemon_display.gender)
    const pokemonForm = utils.getForm(p.pokemon_display.form)

    const quickMoves = pokemonSetting.quick_moves.map(m => getMove(type, moveSettings, m, true))

    const cinematicMoves = pokemonSetting.cinematic_moves.map(m => getMove(type, moveSettings, m, false))

    const move1 = getMove(type, moveSettings, p.move_1, true)

    const move2 = getMove(type, moveSettings, p.move_2, false)

    const level = utils.getLevelFromCpMultiplier(totalCpMultiplier)

    // TODO Use CamelCase instead of under_score for all keys except responses
    const pokemonWithStats = {
      iv,
      type,
      level,
      evolvesTo,
      additional_cp_multiplier: p.additional_cp_multiplier,
      cp_multiplier: p.cp_multiplier,
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
      base_attack: baseAttack,
      base_defense: baseDefense,
      base_stamina: baseStamina,
      pokemon_id: p.pokemon_id,
      name: pokemonName,
      height: p.height_m,
      weight: p.weight_kg,
      nickname: p.nickname || pokemonName,
      evolution_ids: pokemonSetting.evolution_ids,
      cinematic_moves: cinematicMoves,
      quick_moves: quickMoves,
      family_id: pokemonSetting.family_id,
      // Multiply by -1 for sorting
      favorite: p.favorite * -1,
      move_1: move1,
      move_2: move2,
      costume: pokemonCostume,
      gender: pokemonGender,
      shiny: p.pokemon_display.shiny,
      form: pokemonForm
    }

    const speciesIndex = p.pokemon_id - 1

    // Even if we can guess about Gen2+ support we can't know what random pokemon will come next
    // So if we come across an index we are missing, lets just try and patch it in
    if (!speciesList[speciesIndex]) speciesList[speciesIndex] = generateEmptySpecie(p.pokemon_id)

    speciesList[speciesIndex].count += 1
    speciesList[speciesIndex].pokemon.push(pokemonWithStats)
  })

  // TODO use map
  speciesList.forEach((s) => {
    const pokemonSetting = pokemonSettings[s.pokemon_id - 1]
    s.candyToEvolve = pokemonSetting ? pokemonSetting.candy_to_evolve : 0
    s.evolves = utils.getEvolvesCount(s.candyToEvolve, s.candy, s.count)
  })

  return {
    success: true,
    species: speciesList,
    eggs: eggList
  }
}

const sleep = time => new Promise(r => setTimeout(r, time))

const getTrainerInfoSuccess = createAction('GET_TRAINER_INFO_SUCCESS')
const getTrainerInfoFailed = createAction('GET_TRAINER_INFO_FAILED')

const getTrainerPokemonSuccess = createAction('GET_TRAINER_POKEMON_SUCCESS')
const getTrainerPokemonFailed = createAction('GET_TRAINER_POKEMON_FAILED')

const toggleFavoritePokemonSuccess = createAction('TOGGLE_FAVORITE_POKEMON_SUCCESS')
const toggleFavoritePokemonFailed = createAction('TOGGLE_FAVORITE_POKEMON_FAILED')

const powerUpPokemonSuccess = createAction('POWER_UP_POKEMON_SUCCESS')
const powerUpPokemonFailed = createAction('POWER_UP_POKEMON_FAILED')

const renamePokemonSuccess = createAction('RENAME_POKEMON_SUCCESS')
const renamePokemonFailed = createAction('RENAME_POKEMON_FAILED')

const transferPokemonSuccess = createAction('TRANSFER_POKEMON_SUCCESS')
const transferPokemonFailed = createAction('TRANSFER_POKEMON_FAILED')

const evolvePokemonSuccess = createAction('EVOLVE_POKEMON_SUCCESS')
const evolvePokemonFailed = createAction('EVOLVE_POKEMON_FAILED')

function handleGetPlayerResponse(dispatch, response) {
  if (!response.success) {
    throw new Error('Failed in retrieving player info.  Please restart.')
  }

  dispatch(getTrainerInfoSuccess({
    trainerData: response.player_data
  }))
}

function getTrainerInfo() {
  return async (dispatch) => {
    try {
      const response = await getClient().getPlayer()

      handleGetPlayerResponse(dispatch, response)
    } catch (error) {
      dispatch(getTrainerInfoFailed(error))
    }
  }
}

function parseItemTemplates(templates) {
  if (!templates || templates.result !== 1 || !templates.item_templates) return {}

  const ret = {
    pokemon_settings: [],
    item_settings: [],
    move_settings: [],
    move_sequence: [],
    type_effective: [],
    badge_settings: [],
    camera: null,
    player_level: null,
    gym_level: null,
    battle_settings: null,
    encounter_settings: null,
    iap_item_display: [],
    iap_settings: null,
    pokemon_upgrades: null,
    equipped_badges: null
  }

  const keys = Object.keys(ret)

  templates.item_templates.forEach(template => {
    keys.forEach(key => {
      if (template[key]) {
        // if (template.template_id) template[key].template_id = template.template_id
        if (ret[key] && ret[key].push) { // isArray
          ret[key].push(template[key])
        } else {
          ret[key] = template[key]
        }
      }
    })
  })

  return ret
}

let splitItemTemplates = null

function handleGetItemTemplatesResponse(dispatch, itemTemplates) {
  if (!itemTemplates) return

  // TODO do not do this everytime we fetch the trainer pokemon, separate first fetch + refresh
  itemTemplates.success = itemTemplates.result === 1

  if (!itemTemplates.success) {
    throw new Error('Failed to retrieve item templates')
  }

  splitItemTemplates = parseItemTemplates(itemTemplates)
}

function handleGetInventoryResponse(dispatch, inventory) {
  if (!inventory.success) {
    throw new Error('Failed to retrieve Trainers Pokemon')
  }

  const payload = parseInventory(inventory)

  dispatch(getTrainerPokemonSuccess(payload))
}

async function getInventoryAndItemTemplates(dispatch, inventoryOnly) {
  try {
    const batch = getClient().batchStart()
    batch.getInventory(0)
    if (!inventoryOnly) batch.downloadItemTemplates()

    const response = await batch.batchCall()

    let inventory
    let itemTemplates

    if (inventoryOnly) {
      inventory = response
    } else {
      [inventory, itemTemplates] = response
    }

    handleGetItemTemplatesResponse(dispatch, itemTemplates)
    handleGetInventoryResponse(dispatch, inventory)
  } catch (error) {
    dispatch(getTrainerPokemonFailed(error))
  }
}

function getTrainerInfoAndPokemon() {
  return async (dispatch) => {
    const response = await getClient()
      .batchStart()
      .getInventory(0)
      .downloadItemTemplates()
      .getPlayer()
      .batchCall()

    const [inventory, itemTemplates, player] = response

    handleGetItemTemplatesResponse(dispatch, itemTemplates)
    handleGetInventoryResponse(dispatch, inventory)
    handleGetPlayerResponse(dispatch, player)
  }
}

function refreshPokemon() {
  return async (dispatch) => getInventoryAndItemTemplates(dispatch, true)
}

// TODO might be unnecessary now
function getTrainerPokemon() {
  return async (dispatch) => getInventoryAndItemTemplates(dispatch)
}

function powerUpPokemon(pokemon) {
  return async (dispatch) => {
    try {
      await getClient().upgradePokemon(pokemon.id)

      // TODO parse the response instead of retrieving all the new pokemon
      // Requires replacing the main parsing with more functional code
      await dispatch(refreshPokemon())
      dispatch(powerUpPokemonSuccess(pokemon))
    } catch (error) {
      dispatch(powerUpPokemonFailed(error))
    }
  }
}

function toggleFavoritePokemon(pokemon) {
  return async (dispatch) => {
    try {
      // TODO Stop this -1 0 shit
      const updatedPokemon = Object.assign({}, pokemon, {
        favorite: !pokemon.favorite ? -1 : -0
      })

      await getClient().setFavoritePokemon(pokemon.id, !!updatedPokemon.favorite)
      dispatch(toggleFavoritePokemonSuccess(updatedPokemon))
    } catch (error) {
      dispatch(toggleFavoritePokemonFailed(error))
    }
  }
}

function renamePokemon(pokemon, nickname, callback) {
  const updatedPokemon = Object.assign({}, pokemon, { nickname })

  return async (dispatch) => {
    try {
      await getClient().nicknamePokemon(updatedPokemon.id, updatedPokemon.nickname)

      dispatch(renamePokemonSuccess(updatedPokemon))

      // modals are outside of the lifecycle of the table
      // so we must inform it manually
      // this would be fixed if we were using react modals
      callback(updatedPokemon)
    } catch (error) {
      dispatch(renamePokemonFailed(error))
    }
  }
}

function handlePogobufError(error) {
  // Hacky Patch for #160
  // Stop Pogobuf/Bluebird-Retry errors from killing transfer/evolve
  if (error.message && error.message.startsWith('[INTERNAL]')) {
    console.error(error) // eslint-disable-line
  } else {
    throw error
  }
}

// Wait for a random number of seconds between min and max
const randomDelay = ([min, max]) => Math.round((min + Math.random() * (max - min)) * 1000)

function transferPokemon(selectedPokemon) {
  return async (dispatch) => {
    const ids = selectedPokemon.map(p => p.id)
    dispatch(updateStatus({ method: 'transfer' }))
    try {
      await getClient().releasePokemon(ids)
      dispatch(transferPokemonSuccess(selectedPokemon))
      await dispatch(resetStatusAndGetPokemon(null, () => {
        ipcRenderer.send('information-dialog', 'Complete!', 'Finished Transfer')
      }))
    } catch (error) {
      dispatch(transferPokemonFailed(error))
      handlePogobufError(error)
      dispatch(resetStatusAndGetPokemon('Failed to transfer all pokemon.'))
    }
  }
}

const promiseChainFromArray = (array, iterator) => {
  let promise = Promise.resolve()

  array.forEach((value, index) => {
    promise = promise.then(() => iterator(value, index))
  })

  return promise
}

function evolvePokemon(selectedPokemon) {
  return async (dispatch) => {
    const delayMin = 4 // 4 seconds
    const delayMax = 12 // 12 seconds

    try {
      // Wait for all selectedPokemon to be evolved
      dispatch(updateStatus({ method: 'evolve' }))
      await promiseChainFromArray(selectedPokemon, async (currentPokemon) => {
        try {
          await getClient().evolvePokemon(currentPokemon.id)
          const delay = randomDelay([delayMin, delayMax])
          console.log(`Simulating Human Behavior, ${delayMin} to ${delayMax} seconds`)
          console.log(`Delaying evolve for ${delay / 1000} seconds`)
          await sleep(delay)

          dispatch(evolvePokemonSuccess(currentPokemon))
        } catch (error) {
          dispatch(evolvePokemonFailed(error))
          handlePogobufError(error)
        }
      })

      await dispatch(resetStatusAndGetPokemon(null, () => {
        ipcRenderer.send('information-dialog', 'Complete!', 'Finished Evolve')
      }))
    } catch (error) {
      dispatch(resetStatusAndGetPokemon('Failed to evolve all pokemon.'))
    }
  }
}

const updateMonster = createAction('UPDATE_MONSTER')

function resetStatusAndGetPokemon(errorMessage, success) {
  return async (dispatch) => {
    try {
      dispatch(resetStatus())
      await sleep(100) // Pogobuf may need a tick after a large batch
      await dispatch(refreshPokemon())
      if (success) success()
      if (errorMessage) ipcRenderer.send('error-message', errorMessage)
    } catch (e) {
      errorMessage = errorMessage ? `${errorMessage}\n\n${e}` : `Failed to fetch pokemon:\n\n${e}`
      ipcRenderer.send('error-message', errorMessage)
    }
  }
}

export default {
  updateMonster,
  updateSpecies: createAction('UPDATE_SPECIES'),
  updateMonsterSort: createAction('UPDATE_MONSTER_SORT'),
  sortSpecies: createAction('SORT_SPECIES'),
  checkPokemon: createAction('CHECK_POKEMON'),
  checkAllBySpecies: createAction('CHECK_ALL_BY_SPECIES'),
  collapseBySpecies: createAction('COLLAPSE_BY_SPECIES'),
  sortAllSpecies: createAction('SORT_ALL_SPECIES'),
  sortWithDefaults: createAction('SORT_WITH_DEFAULTS'),
  getTrainerInfo,
  getTrainerPokemon,
  getTrainerInfoAndPokemon,
  powerUpPokemon,
  toggleFavoritePokemon,
  renamePokemon,
  transferPokemon,
  evolvePokemon,
  evolveSelectedPokemon: evolvePokemon,
  transferSelectedPokemon: transferPokemon,
  refreshPokemon,
}
