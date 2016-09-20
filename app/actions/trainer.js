import {
  createAction
} from 'redux-actions'
import {
  times,
  keyBy,
} from 'lodash'
import pogobuf from 'pogobuf'
import POGOProtos from 'node-pogo-protos'
import {
  ipcRenderer
} from 'electron'
import moment from 'moment'

import client from '../client'

// TODO Must move these helpers to app folder
import utils from '../utils'
import baseStats from '../../baseStats'

import {
  updateStatus,
  resetStatus,
} from './status'

// Maybe put this info and the helper methods in utils?
const kantoDexCount = 151

function generateEmptySpecies(candies) {
  const candiesByFamilyId = keyBy(candies, (candy) => String(candy.family_id))

  return times(kantoDexCount, (i) => {
    const pokemonDexNumber = String(i + 1)
    const basePokemon = baseStats.pokemon[pokemonDexNumber]

    const candyByFamilyId = candiesByFamilyId[basePokemon.familyId]
    const candy = candyByFamilyId ? candyByFamilyId.candy : 0

    return {
      candy,
      pokemon_id: pokemonDexNumber,
      name: basePokemon.name,
      count: 0,
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

function sleep(time) {
  return new Promise(r => setTimeout(r, time))
}

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

function getTrainerInfo() {
  return async (dispatch) => {
    try {
      const response = await client.getPlayer()

      if (!response.success) {
        dispatch(getTrainerInfoFailed('Failed in retrieving player info.  Please restart.'))
        return
      }
      dispatch(getTrainerInfoSuccess({
        trainerData: response.player_data
      }))
    } catch (error) {
      dispatch(getTrainerInfoFailed(error))
    }
  }
}

function getTrainerPokemon() {
  return async (dispatch) => {
    try {
      const inventory = await client.getInventory(0)

      if (!inventory.success) {
        dispatch(getTrainerPokemonFailed('Failed to retrieve Trainers Pokemon'))
        return
      }

      const payload = parseInventory(inventory)

      dispatch(getTrainerPokemonSuccess(payload))
    } catch (error) {
      dispatch(getTrainerPokemonFailed(error))
    }
  }
}

function powerUpPokemon(pokemon) {
  return async (dispatch) => {
    try {
      await client.upgradePokemon(pokemon.id)

      // TODO parse the response instead of retrieving all the new pokemon
      // Requires replacing the main parsing with more functional code
      await dispatch(getTrainerPokemon())
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

      await client.setFavoritePokemon(pokemon.id, !!updatedPokemon.favorite)
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
      await client.nicknamePokemon(updatedPokemon.id, updatedPokemon.nickname)

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

function transferPokemon(pokemon, delay) {
  return async (dispatch) => {
    try {
      await sleep(delay)
      await client.releasePokemon(pokemon.id)
      dispatch(transferPokemonSuccess(pokemon))
    } catch (error) {
      dispatch(transferPokemonFailed(error))
      throw error
    }
  }
}

function evolvePokemon(pokemon, delay) {
  return async (dispatch) => {
    try {
      await sleep(delay)
      await client.evolvePokemon(pokemon.id)
      dispatch(evolvePokemonSuccess(pokemon))
    } catch (error) {
      dispatch(evolvePokemonFailed(error))
      throw error
    }
  }
}

function promiseChainFromArray(array, iterator) {
  let promise = Promise.resolve()

  array.forEach((value, index) => {
    promise = promise.then(() => iterator(value, index))
  })

  return promise
}

function randomDelay([min, max]) {
  return Math.round((min + Math.random() * (max - min)) * 1000)
}

function average(arr) {
  const sum = arr.reduce((result, currentValue) =>
    result + currentValue
  , 0)

  return sum / arr.length
}

const updateMonster = createAction('UPDATE_MONSTER')

function processSelectedPokemon(selectedPokemon, method, action, time, delayRange) {
  return async (dispatch) => {
    dispatch(updateStatus({
      selectedPokemon,
      method,
      time,
    }))

    let startTime = moment()
    const responseTimesInSeconds = []

    promiseChainFromArray(selectedPokemon, (pokemon, index) => {
      dispatch(updateStatus({ current: pokemon }))

      return dispatch(action(pokemon, randomDelay(delayRange)))
        .then(() => {
          // Calculate the Estimated Time in Seconds Left
          const requestLatencyInSeconds = moment().diff(startTime, 'seconds')
          startTime = moment()

          if (requestLatencyInSeconds > 0) {
            responseTimesInSeconds.push(requestLatencyInSeconds)
            const averageRequestLatencyInSeconds = average(responseTimesInSeconds)

            const numberOfJobsLeft = selectedPokemon.length - (index + 1)
            const estimatedSecondsLeft = numberOfJobsLeft * averageRequestLatencyInSeconds

            dispatch(updateStatus({ time: estimatedSecondsLeft }))
          }

          dispatch(updateMonster({
            pokemon,
            options: { remove: true }
          }))
        })
    }).then(() => {
      ipcRenderer.send('information-dialog', 'Complete!', `Finished ${method}`)
      dispatch(resetStatus())
      dispatch(getTrainerPokemon())
    }).catch(error => {
      ipcRenderer.send('error-message', `Error while running ${method.toLowerCase()}:\n\n${error}`)
      dispatch(resetStatus())
      dispatch(getTrainerPokemon())
    })
  }
}

function transferSelectedPokemon(selectedPokemon) {
  const method = 'Transfer'
  const time = selectedPokemon.length * 2.5
  const delayRange = [2, 3]
  const action = transferPokemon

  return processSelectedPokemon(selectedPokemon, method, action, time, delayRange)
}

function evolveSelectedPokemon(selectedPokemon) {
  const method = 'Evolve'
  const time = selectedPokemon.length * 27.5
  const delayRange = [25, 30]
  const action = evolvePokemon

  return processSelectedPokemon(selectedPokemon, method, action, time, delayRange)
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
  powerUpPokemon,
  toggleFavoritePokemon,
  renamePokemon,
  transferPokemon,
  evolvePokemon,
  evolveSelectedPokemon,
  transferSelectedPokemon,
}
