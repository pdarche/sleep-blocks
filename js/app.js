'use strict';

/*
* Render the application
*
*/

window.React = require('react');
var ReactDOM = require('react-dom');
var BlocksApp = require('./components/BlocksApp');

ReactDOM.render(
  <BlocksApp/>,
  document.getElementById('app')
);