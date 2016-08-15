import React from 'react'

const CinematicMove = React.createClass({
  render () {
    let { 
      move,
      myMove
    } = this.props

    let chargedMoveBars = []

    for(var i = 0; i < Math.floor(100/move.energyCost); i++)
    {
      chargedMoveBars.push(<div key={i} className='pokemon-move-cost-item' style={{width:`${move.energyCost}px`}}/>)
    }

    let chargedMoveTip = `
      Duration: ${move.durationMs}ms <br>
      Dodge Window: ${move.dodgeWindowMs}ms <br>
      Crit Chance: ${move.crit * 100}%
    `

    return (
      <div className={'pokemon-move-item' + (move===myMove?' mine':' notmine')}>
        <div className='pokemon-move-item-text-area' ref='tooltip' data-toggle='tooltip' data-placement='right' data-html='true' title={chargedMoveTip}>
          <div className='pokemon-move-title'>{`${move.name}`}</div>
          <div className={'pokemon-move-type ' + move.type}>{`${move.type}`}</div>
        </div>
        <div className='pokemon-move-cost'>
          {chargedMoveBars}
        </div>
        <div className='pokemon-move-damage'>
          {`${move.power}`}
        </div>
      </div>
    )
  },
  componentDidMount () {
    $(this.refs.tooltip).tooltip()
  },
  componentDidUpdate () {
    $(this.refs.tooltip).tooltip()
  },
})

export default CinematicMove