var fs = require('fs')

// var gameMaster = require('./GAME_MASTER_v0_1.json')
var gameMaster2 = require('./GAME_MASTER_v0_2.json')
var cpStats = require('./cpStats.json')
var evolveCost = require('./evolveCost.json')
var familiesById = require('./familiesById.json')
var basicAttacks = require('./basicAttacks.json')
var chargedAttacks = require('./chargedAttacks.json')

function writeBaseStats () {
  var baseStats = {}

  gameMaster2.forEach(item => {
    let pokemonIndex = item.PkMn - 1
    let pokemonId = String(item.PkMn)
    let types = [item.Type1.toLowerCase()]
    if (item.Type2 !== 'NONE') types.push(item.Type2.toLowerCase())

    baseStats[pokemonId] = {
      types: types,
      cpPerUpgrade: cpStats.cpPerUpgrade[pokemonIndex],
      evolveCost: evolveCost.data[pokemonIndex].cost,
      familyId: familiesById.data[pokemonIndex].family,
      // TODO camel case these
      BaseStamina: item.BaseStamina,
      BaseAttack: item.BaseAttack,
      BaseDefense: item.BaseDefense,
      evolvesTo: item.EvolvesTo,
      evolvesFrom: item.EvolvesFrom,
      quickMoves: item.QuickMoves.split(', '),
      cinematicMoves: item.CinematicMoves.split(', ')
    }
  })

  fs.writeFileSync('./baseStats.json', JSON.stringify(baseStats, null, 2))
}

function writeAttackData(){
  var attackData = {}
  console.log('im called2 ')
  basicAttacks.forEach(item=>{
    attackData[item.id] = {
	  name : item.name,
	  type : item.type,
	  power : item.pw,
	  staminaLoss : item.staminalossscalarUnsureIfMatters,
	  durationMs : item.durationMs,
	  damageWindowMs : item.damageWindowMs,
	  energyGain : item.nrg,
	  energyGainPerSecond : item.nrgps,
	  dps : item.dps
	}
  })
  
  chargedAttacks.forEach(item=>{
    attackData[item.id] = {
	  name : item.name,
	  type : item.type,
	  power : item.pw,
	  staminaLoss : item.staminalossscalar,
	  durationMs : item.durationMs,
	  dodgeWindowMs : item.dodgeWindowMs,
	  crit : item.crit,
	  energyCost : item.nrgCost
	}
  })
  
  fs.writeFileSync('./attackData.json', JSON.stringify(attackData, null, 2))
}

writeBaseStats()
writeAttackData()
console.log('im called')