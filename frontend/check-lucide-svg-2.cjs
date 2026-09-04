const { renderToString } = require('react-dom/server');
const React = require('react');
const { PanelLeftInactive, PanelLeftDashed } = require('lucide-react');

const render = (Component) => {
  if(!Component) return 'Not found';
  return renderToString(React.createElement(Component));
};

console.log('PanelLeftInactive:', render(PanelLeftInactive));
console.log('PanelLeftDashed:', render(PanelLeftDashed));
