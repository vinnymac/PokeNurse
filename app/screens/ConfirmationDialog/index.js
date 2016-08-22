import React, {
  PropTypes
} from 'react'
import ReactDOM from 'react-dom'
import SelectedPokemon from './components/SelectedPokemon'

const ConfirmationDialog = React.createClass({
  displayName: 'ConfirmationDialog',

  propTypes: {
    onClickSecondary: PropTypes.func.isRequired,
    onClickPrimary: PropTypes.func.isRequired,
    dialog: PropTypes.object.isRequired,
    primaryText: PropTypes.string.isRequired,
    secondaryText: PropTypes.string,
    title: PropTypes.string.isRequired,
    message: PropTypes.string.isRequired,
    pokemon: PropTypes.array
  },

  componentDidMount() {
    this.props.dialog.modal('show')
  },

  render() {
    const {
      secondaryText,
      primaryText,
      title,
      message,
      pokemon
    } = this.props

    let secondaryButton

    if (secondaryText) {
      secondaryButton = (
        <button
          type="button"
          className="btn btn-warning"
          onClick={this.handleSecondary}
        >
          {secondaryText}
        </button>
      )
    }

    return (
      <div className="modal-dialog" role="document">
        <div className="modal-content">
          <div className="modal-header">
            <button
              type="button"
              className="close"
              data-dismiss="modal"
              aria-label="Close"
            >
              <span aria-hidden="true">&times;</span>
            </button>
            <h4 className="modal-title" id="confirmationDialogLabel">
              {title}
            </h4>
          </div>
          <div className="modal-body">
            <p>
              {message}
            </p>
            <SelectedPokemon pokemon={pokemon} />
          </div>
          <div className="modal-footer">
            {secondaryButton}
            <button
              type="button"
              className="btn btn-primary"
              onClick={this.handlePrimary}
            >
              {primaryText}
            </button>
            <button
              type="button"
              className="btn btn-default"
              data-dismiss="modal"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    )
  },

  handleSecondary() {
    this.props.dialog.modal('hide')
    this.props.onClickSecondary()
  },

  handlePrimary() {
    this.props.dialog.modal('hide')
    this.props.onClickPrimary()
  }
})

export default ($modal, props) => {
  props.dialog = $modal

  const modalDialog = (<ConfirmationDialog {...props} />)

  $modal.on('hidden.bs.modal', () => {
    ReactDOM.unmountComponentAtNode($modal.get(0))
  })

  ReactDOM.render(modalDialog, $modal.get(0))
}
