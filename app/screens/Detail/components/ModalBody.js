import React, {
  PropTypes
} from 'react'
import QuickMove from './QuickMove'
import CinematicMove from './CinematicMove'
import Nickname from './Nickname'
import Evolutions from './Evolutions'
import utils from '../../../utils'

class ModalBody extends React.Component {
  static propTypes = {
    transform: PropTypes.string.isRequired,
    name: PropTypes.string.isRequired,
    hp: PropTypes.string.isRequired,
    cp: PropTypes.number.isRequired,
    pokemon: PropTypes.object.isRequired,
    maxCP: PropTypes.number.isRequired,
    type: PropTypes.array.isRequired,
    weight: PropTypes.string.isRequired,
    height: PropTypes.string.isRequired,
    attack: PropTypes.string.isRequired,
    defense: PropTypes.string.isRequired,
    cpPerUpgrade: PropTypes.string.isRequired,
    candies: PropTypes.number.isRequired,
    fastMove: PropTypes.object.isRequired,
    chargedMove: PropTypes.object.isRequired,
    evolutionIds: PropTypes.node,
    possibleQuickMoves: PropTypes.array,
    possibleCinematicMoves: PropTypes.array,
  }

  render() {
    const {
      transform,
      // name,
      hp,
      cp,
      pokemon,
      maxCP,
      type,
      weight,
      height,
      attack,
      defense,
      cpPerUpgrade,
      candies,
      fastMove,
      chargedMove,
      evolutionIds,
      possibleQuickMoves,
      possibleCinematicMoves,
    } = this.props

    const quickMoves = possibleQuickMoves.map((possibleQuickMove, i) =>
      <QuickMove key={i} move={possibleQuickMove} myMove={fastMove} />
    )

    const cinematicMoves = possibleCinematicMoves.map((possibleCinematicMove, i) =>
      <CinematicMove key={i} move={possibleCinematicMove} myMove={chargedMove} />
    )

    return (<div className="modal-body">
      <div id="pokemon_sprite_wrapper">
        <div style={{ textAlign: 'center', fontSize: '11px' }}>
          <span>CP</span>
          <span style={{ fontSize: '20px' }}>{cp}</span>
          <span>{` (Max ${maxCP})`}</span>
        </div>
        <div id="pokemon_sprite_sphere_wrapper">
          <div id="pokemon_sprite_sphere" />
          <div id="pokemon_sprite_sphere_dot" style={{ WebkitTransform: transform }} />
        </div>

        <img
          onClick={this.handleCry}
          title="Listen to Cry"
          alt="Profile Sprite"
          id="pokemon_profile_sprite"
          src={this.handleSprite(pokemon)}
          onError={() => { document.getElementById('pokemon_profile_sprite').src = `./imgs/3d/${pokemon.pokemon_id}.webp` }}
        />
        <audio
          id="pokemonCry"
          ref={(c) => { this.cry = c }}
        >
          <source
            src={`./cries/${pokemon.pokemon_id}.ogg`}
            type="audio/ogg"
          />
        </audio>
      </div>

      <div id="pokemon_contents">
        <Nickname pokemon={pokemon} />
        <div id="pokemon_health_bar" />
        <div id="pokemon_health">{`HP ${hp}`}</div>
        <div className="pokemon_info">
          <div className="pokemon-info-item split-4-way">
            <div className="pokemon-info-item-text">
              {`${weight}`}
              <span className="pokemon-stat-unit">&thinsp;kg</span>
            </div>
            <div className="pokemon-info-item-title">Weight</div>
          </div>
          <div className="pokemon-info-item split-2-way">
            <div className="pokemon-info-item-text">{`${type.join(' / ')}`}</div>
            <div className="pokemon-info-item-title">Type</div>
          </div>
          <div className="pokemon-info-item split-4-way">
            <div className="pokemon-info-item-text">
              {`${height}`}
              <span className="pokemon-stat-unit">&thinsp;m</span>
            </div>
            <div className="pokemon-info-item-title">Height</div>
          </div>
        </div>
        <div className="pokemon_info">
          <div className="pokemon-info-item split-2-way">
            <div className="pokemon-info-item-text cp-upgrade">{cpPerUpgrade}</div>
            <div className="pokemon-info-item-title">CP Per Upgrade</div>
          </div>
          <div className="pokemon-info-item split-2-way">
            <div className="pokemon-info-item-text candy-count">
              <div
                title="Pokémon Candy Icon"
                alt="Candy Icon"
                id="pokemon_candy_icon"
              >
                {this.handleCandyIcon(pokemon)}
              </div>
              {candies}
            </div>
            <div className="pokemon-info-item-title">{`${utils.getName(pokemon.family_id)} Candy`}</div>
          </div>
        </div>
        <div className="pokemon_info">
          <div className="pokemon-info-item split-3-way">
            <div className="pokemon-info-item-text combat-stat">{`${attack}`}</div>
            <div className="pokemon-info-item-title">Attack</div>
          </div>
          <div className="pokemon-info-item split-3-way">
            <div className="pokemon-info-item-text combat-stat">{`${defense}`}</div>
            <div className="pokemon-info-item-title">Defense</div>
          </div>
          <div className="pokemon-info-item split-3-way">
            <div className="pokemon-info-item-text combat-stat">{`${pokemon.iv}%`}</div>
            <div className="pokemon-info-item-title">IV</div>
          </div>
        </div>
        <div className="pokemon_move_info">
          <div className="pokemon-move-item-title">Quick Moves</div>
          {quickMoves}
          <div className="pokemon-move-item-title">Charged Moves</div>
          {cinematicMoves}
        </div>
        <Evolutions evolutionIds={evolutionIds} />
      </div>
    </div>)
  }

  handleCry = () => {
    this.cry.play()
  }

  handleSprite = (pokemon) => {
    let imgPath
    if (pokemon.gender === 'Female') {
      if (pokemon.shiny) {
        // Is FEMALE and SHINY
        imgPath = `./imgs/3d/${pokemon.pokemon_id}-fs.webp`
      } else {
        // Is FEMALE
        imgPath = `./imgs/3d/${pokemon.pokemon_id}-f.webp`
      }
    } else if (pokemon.shiny) {
      // Is MALE or GENDERLESS and SHINY
      imgPath = `./imgs/3d/${pokemon.pokemon_id}-s.webp`
    } else {
      // Is MALE or GENDERLESS
      imgPath = `./imgs/3d/${pokemon.pokemon_id}.webp`
    }
    return imgPath
  }

  handleCandyIcon = (pokemon) => {
    // http://rmkane.com/experiment/pokemon/candy/index.html
    let imagesLoaded = 0

    const WIDTH = 256
    const HEIGHT = 256
    const IMAGES = {
      primaryColor: {
        src: './imgs/candy/candy_base_color.png',
        obj: null
      },
      secondaryColor: {
        src: './imgs/candy/candy_secondary_color.png',
        obj: null
      },
      highlight: {
        src: './imgs/candy/candy_highlight.png',
        obj: null
      }
    }
    const COLORS = [utils.getCandyColor(pokemon.family_id)]

    function render(record, targetSelector) {
      const layer = [
        createLayer(WIDTH, HEIGHT),
        createLayer(WIDTH, HEIGHT),
        createLayer(WIDTH, HEIGHT),
      ]

      layer[0].drawImage(IMAGES.primaryColor.obj, 0, 0)
      applyColorMask(layer[0], COLORS[0].primaryColor)

      layer[1].drawImage(IMAGES.secondaryColor.obj, 0, 0)
      applyColorMask(layer[1], COLORS[0].secondaryColor)

      layer[0].drawImage(layer[1].canvas, 0, 0)
      layer[0].drawImage(IMAGES.highlight.obj, 0, 0)

      const canvas = layer[0].canvas
      document.getElementById(targetSelector).appendChild(canvas)
    }

    function loadImages(images, callback) {
      const keys = Object.keys(images)
      for (let index = 0; index < keys.length; index++) {
        loadImage(images[keys[index]], callback)
      }
    }

    function loadImage(image, callback) {
      image.obj = new Image()
      image.obj.onload = () => {
        if (imagesLoaded++ >= Object.keys(IMAGES).length - 1) {
          callback()
        }
      }
      image.obj.src = image.src
    }

    function createLayer(width, height) {
      const layer = document.createElement('canvas')
      layer.className = 'layer'
      layer.width = width
      layer.height = height || width
      return layer.getContext('2d')
    }

    function applyColorMask(ctx, color) {
      if (color.indexOf('#') !== 0) color = `# ${color}`
      const rgba = hexToRgbA(color)
      const imgData = ctx.getImageData(0, 0, WIDTH, HEIGHT)
      for (let byte = 0; byte < imgData.data.length; byte += 4) {
        for (let p = 0; p < 4; p++) {
          imgData.data[byte + p] = rgba[p] * (imgData.data[byte + p] / 255)
        }
      }
      ctx.putImageData(imgData, 0, 0)
    }

    function hexToRgbA(hex) {
      if (/^#([A-F0-9]{3}){1,2}$/i.test(hex)) {
        let c = hex.substring(1).split('')
        if (c.length === 3) {
          c = [c[0], c[0], c[1], c[1], c[2], c[2]]
        }
        c = parseInt(c.join(''), 16)
        return [(c >> 16) & 0xFF, (c >> 8) & 0xFF, c & 0xFF, 0xFF]
      }
    }

    function onLoad(records) {
      records.forEach(record => {
        render(record, 'pokemon_candy_icon')
      })
    }

    loadImages(IMAGES, () => {
      onLoad(COLORS)
    })
  }
}

export default ModalBody
