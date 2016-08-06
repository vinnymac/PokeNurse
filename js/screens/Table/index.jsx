import React from 'react'
import ReactDOM from 'react-dom'

// <script>window.$ = window.jQuery = require('jquery')</script>
// <script src="./node_modules/bootstrap/dist/js/bootstrap.min.js" charset="utf-8"></script>
// <script src="./node_modules/datatables.net/js/jquery.dataTables.js" charset="utf-8"></script>
// <script src="./node_modules/datatables.net-bs/js/dataTables.bootstrap.js" charset="utf-8"></script>
// <script>require('./js/home')</script>

const Table = React.createClass({
  componentWillMount () {
    document.title = "PokéNurse • Home"
  },

  render () {
    // <!--<h5 id="pokestorage-h"></h5>
    // <h5 id="bagstorage-h"></h5>-->
    return (
      <div>
        <header className="header" id="profile-header">
          <p id="username-h"></p>
          <p>Status: <span id="status-h">Idle</span></p>
        </header>

        <div className="container">
          <h1>
            <span>Pokémon</span>
            <span className="glyphicon glyphicon-refresh" id="refresh-btn"></span>

            <span className="pull-right">
              <input type="button" className="btn btn-warning" id="transfer-btn" value="Transfer selected"/>
              {" "}
              <input type="button" className="btn btn-danger" id="evolve-btn" value="Evolve selected"/>
            </span>
          </h1>

          <table className="table table-condensed table-hover display" id="pokemon-data">
          <thead>
            <tr>
              <th></th>
              <th width="18%">Pokédex #</th>
              <th>Name</th>
              <th>Count</th>
              <th>Candy</th>
              <th>Evolves</th>
            </tr>
          </thead>
         </table>
        </div>

        <div className="modal fade" id="detailModal" tabIndex="-1" role="dialog" aria-labelledby="detailModalLabel"></div>
      </div>
    )
  }
})

export default Table
