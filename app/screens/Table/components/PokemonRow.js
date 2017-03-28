import React, {
  PropTypes
} from 'react'
import { ipcRenderer } from 'electron'
import $ from 'jquery'

import renderModal from '../../Detail'
import Tooltip from '../../Tooltip'

const favoriteGlyph = 'fa fa-star favorite-yellow'
const emptyFavoriteGlyph = 'fa fa-star-o'

function hasMaxCP(pokemon) {
  return pokemon.cp.toFixed(0) === pokemon.max_cp.toFixed(0)
}

function getWavingDamagePS(pokemon, targetDefence, targetEffectivines) { 
  // Calculating the Waving damage
  let stabMultiplierMove1 = 1
  let stabMultiplierMove2 = 1
  if (pokemon.move_1.type === pokemon.type[0] || pokemon.move_1.type === pokemon.type[1]) { stabMultiplierMove1 = 1.25 }
  if (pokemon.move_2.type === pokemon.type[0] || pokemon.move_2.type === pokemon.type[1]) { stabMultiplierMove2 = 1.25 }
  const cpMultiplier = pokemon.cp_multiplier + pokemon.additional_cp_multiplier  // real cp multiplier
  // let cpMultiplier = 0.79030001  // false cp multiplier at lvl 40
  const realAttack = (pokemon.base_attack + pokemon.attack) * (cpMultiplier) // real attack
  // const realAttack = (pokemon.base_attack + 0 ) * (cpMultiplier) // false attack (pokemon.attack = 0)
  // const realAttack = (pokemon.base_attack + 15) * (cpMultiplier) // false attack (pokemon.attack = 15)
  // Quick attack = move 1
  const realPowerMove1 = (Math.floor(1 / 2 * pokemon.move_1.power * realAttack / targetDefence * stabMultiplierMove1 * targetEffectivines)) + 1
  const noWavingDamage = realPowerMove1 * Math.floor((100000 / pokemon.move_1.duration_ms)) // Damage done by spamming the quick attack
  // Charge Attack = move 2
  const chargeDealay = 500 // 500 ms
  const realPowerMove2 = (Math.floor(1 / 2 * pokemon.move_2.power * realAttack / targetDefence * stabMultiplierMove2 * targetEffectivines)) + 1
  // calculating the avg wave cycle lenght [ms] and damage
  // Cycle Lenght
  let avgWaveCycleLenght = 0 // initiating  variable
  if (pokemon.move_2.energy_cost === 100) {
    avgWaveCycleLenght = Math.ceil(pokemon.move_2.energy_cost / pokemon.move_1.energy_gain, 1)
  } else {
    avgWaveCycleLenght = pokemon.move_2.energy_cost / pokemon.move_1.energy_gain
  }
  avgWaveCycleLenght = avgWaveCycleLenght * pokemon.move_1.duration_ms + pokemon.move_2.duration_ms + chargeDealay
  // sycle Damage
  let avgWaveCycleDamage = 0 // initiating variable
  if (pokemon.move_2.energy_cost === 100) {
    avgWaveCycleDamage = Math.ceil(pokemon.move_2.energy_cost / pokemon.move_1.energy_gain, 1)
  } else {
    avgWaveCycleDamage = pokemon.move_2.energy_cost / pokemon.move_1.energy_gain
  }
  avgWaveCycleDamage = avgWaveCycleDamage * realPowerMove1 + realPowerMove2 * (1 + pokemon.move_2.critical_chance / 100)
  // Waving Damage
  const wavingDamage = avgWaveCycleDamage / avgWaveCycleLenght * (100 * 1000) // 100 s *1 / 1000
  // Waving Damage and rating Shown
  const tierWavingDPS = 24.19  // perfect Charizard # firespin + overheat 375/15500*1000 = 24.19
  const nwDPS = Math.floor(noWavingDamage) / 100 // No waving DPS
  const pwDPS = Math.floor(wavingDamage) / 100 // Pure Waving DPS
  const pwdRating = Math.floor(pwDPS / tierWavingDPS * 1000) / 10 // Rating based on best tierWavingDamage
  const wavingDPS = [nwDPS, pwDPS, pwdRating]
  return wavingDPS
}

class PokemonRow extends React.PureComponent {
  static displayName = 'PokemonRow'

  static propTypes = {
    species: PropTypes.object.isRequired,
    pokemon: PropTypes.object.isRequired,
    getPokemonState: PropTypes.func.isRequired,
    onCheckedChange: PropTypes.func.isRequired,
    toggleFavoritePokemon: PropTypes.func.isRequired,
    powerUpPokemon: PropTypes.func.isRequired,
  }

  render() {
    const {
      pokemon,
      getPokemonState,
    } = this.props

    const favorite = pokemon.favorite ? favoriteGlyph : emptyFavoriteGlyph
    const pokeiv = `${pokemon.iv}% (${pokemon.attack}/${pokemon.defense}/${pokemon.stamina})`
    const powerUpTip = this.getPowerUpTip()
    const cpTip = `Max CP: ${pokemon.max_cp}`
    const ivTip = (
      <span>
        {`Attack: ${pokemon.attack}`}
        <br />
        {`Defense: ${pokemon.defense}`}
        <br />
        {`Stamina: ${pokemon.stamina}`}
      </span>
    )
    const pokemonState = getPokemonState(pokemon.pokemon_id)
    const isChecked = pokemonState[String(pokemon.id)].check
    const wavingDPS = getWavingDamagePS(pokemon, 100, 1) // setting 100 for targetDefence and 1 for targetEffectivines

    return (
      <tr key={pokemon.id}>
        <td>
          <input
            type="checkbox"
            value={String(pokemon.id)}
            key={pokemon.id}
            disabled={pokemon.deployed}
            checked={isChecked}
            onChange={this.checkRow}
          />
        </td>
        <td>
          <span
            className={`favorite ${favorite}`}
            id="favoriteBtn"
            data-pokemon-id={pokemon.id}
            onClick={this.handleClickFavorite}
          />
        </td>
        <td onClick={this.handleClickPowerup}>
          <Tooltip
            placement="right"
            id="power_up_tooltip"
            message={powerUpTip}
            delayShow={100}
            wrapperTag="a"
            show
          >
            P↑
          </Tooltip>
        </td>
        <td>
          {pokemon.name}
        </td>
        <td onClick={this.handleClickNickname}>
          <a
            className="nickname"
            data-pokemon-id={pokemon.id}
          >
            {pokemon.nickname}
          </a>
        </td>
        <td>
          <Tooltip
            placement="right"
            id="cp_tooltip"
            message={cpTip}
            delayShow={100}
            wrapperTag="span"
            show
          >
            {pokemon.cp}
          </Tooltip>
        </td>
        <td>
          {pokemon.level}
        </td>
        <td>
          <Tooltip
            placement="right"
            id="iv_tooltip"
            message={ivTip}
            delayShow={100}
            wrapperTag="span"
            show
          >
            {pokeiv}
          </Tooltip>
        </td>
        <td>
          {wavingDPS[0]}/{wavingDPS[1]}
        </td>
        <td>
          {wavingDPS[2]}
        </td>
      </tr>
    )
  }

  getPowerUpTip = () => {
    const {
      pokemon,
    } = this.props

    if (hasMaxCP(pokemon)) {
      return `Max CP ${pokemon.max_cp}`
    }

    return (<span>
      {`Stardust Cost = ${pokemon.stardust_cost}`}
      <br />
      {`Candy Cost = ${pokemon.candy_cost}`}
      <br />
      {`CP After ≅ ${Math.round(pokemon.next_cp) + pokemon.cp}`}
      <br />
      {`Max Stardust = ${pokemon.stardust_max_cost}`}
      <br />
      {`Max Candy = ${pokemon.candy_max_cost}`}
    </span>)
  }

  handleClickPowerup = () => {
    const {
      powerUpPokemon,
      pokemon,
      species,
    } = this.props

    if (hasMaxCP(pokemon)) {
      ipcRenderer.send('error-message', 'Sorry, you have reached the Max CP!')
      return
    }

    if (species.candy < 1) {
      ipcRenderer.send('error-message', `Sorry, you have ${species.candy} candy left!`)
      return
    }

    if (ipcRenderer.sendSync('confirmation-dialog', 'power up').success) {
      // TODO Calculate and update the pokemon immediately with estimates
      powerUpPokemon(pokemon)
    }
  }

  handleClickFavorite = () => {
    const {
      toggleFavoritePokemon,
      pokemon,
    } = this.props

    toggleFavoritePokemon(pokemon)
  }

  handleClickNickname = () => {
    const {
      pokemon,
      species,
    } = this.props

    renderModal($(document.getElementById('detailModal')), pokemon, species)
  }

  checkRow = () => {
    const {
      onCheckedChange,
      pokemon,
    } = this.props

    onCheckedChange(pokemon)
  }
}

export default PokemonRow
