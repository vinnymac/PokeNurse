import {
  createAction
} from 'redux-actions'
import times from 'lodash/times'
import keyBy from 'lodash/keyBy'
import pogobuf from 'pogobuf'
import POGOProtos from 'node-pogo-protos'

import { client } from './authenticate'

// TODO Must move these helpers to app folder
import utils from '../utils'
import baseStats from '../../baseStats'

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

const getTrainerInfoSuccess = createAction('GET_TRAINER_INFO_SUCCESS')
const getTrainerInfoFailed = createAction('GET_TRAINER_INFO_FAILED')

const getTrainerPokemonSuccess = createAction('GET_TRAINER_POKEMON_SUCCESS')
const getTrainerPokemonFailed = createAction('GET_TRAINER_POKEMON_FAILED')

export default {
  getTrainerInfo() {
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
  },

  getTrainerPokemon() {
    return async (dispatch) => {
      try {
        const inventory = await client.getInventory(0)

        if (!inventory.success) {
          // const payload = { success: false }
          // if (sync !== 'sync') {
          //   event.sender.send('receive-players-pokemons', payload)
          //   return
          // }
          // event.returnValue = payload
          dispatch(getTrainerPokemonFailed('Failed to retrieve Trainers Pokemon'))
          return
        }

        const payload = parseInventory(inventory)

        // if (sync === 'sync') {
        //   event.returnValue = payload
        // } else {
        //   event.sender.send('receive-players-pokemons', payload)
        // }
        dispatch(getTrainerPokemonSuccess(payload))
      } catch (error) {
        dispatch(getTrainerPokemonFailed(error))
      }
    }
  }
}
