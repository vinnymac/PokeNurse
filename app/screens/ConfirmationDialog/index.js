import React, {
  PropTypes
} from 'react'
import ReactDOM from 'react-dom'

// TODO Abstract the dialog into something flexible
const ConfirmationDialog = React.createClass({
  displayName: 'ConfirmationDialog',

  propTypes: {
    transferAll: PropTypes.func.isRequired,
    transferWithoutFavorites: PropTypes.func.isRequired,
    dialog: PropTypes.object.isRequired
  },

  componentDidMount() {
    this.props.dialog.modal('show')
  },

  render() {
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
            <h4 className="modal-title" id="detailModalLabel">
              Confirm Transfer
            </h4>
          </div>
          <div className="modal-body">
            <p>
              Transferring normally doesn't allow favorites.
              Please choose how you would like to transfer your selected pokemon.
            </p>
          </div>
          <div className="modal-footer">
            <button
              type="button"
              className="btn btn-warning"
              onClick={this.handleTransferAll}
            >
              Transfer All
            </button>
            <button
              type="button"
              className="btn btn-primary"
              onClick={this.handleTransferWithoutFavorites}
            >
              Transfer without Favorites
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

  handleTransferAll() {
    this.props.dialog.modal('hide')
    this.props.transferAll()
  },

  handleTransferWithoutFavorites() {
    this.props.dialog.modal('hide')
    this.props.transferWithoutFavorites()
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
