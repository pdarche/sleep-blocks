/*
* Render the application
*
*/

window.React = require('react');
var BlocksApp = require('./components/BlocksApp');

React.render(
  <BlocksApp/>,
  document.getElementById('app')
);