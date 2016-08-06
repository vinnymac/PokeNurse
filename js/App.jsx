import React from 'react';
import ReactDOM from 'react-dom'

const App = React.createClass({
  render() {
    return (
      <div>
        React says Hello World
      </div>
    );
  }
});

ReactDOM.render(<App />, document.getElementById("testReact"))
