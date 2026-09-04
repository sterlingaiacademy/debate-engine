const { renderToString } = require('react-dom/server');
const React = require('react');
const { PanelLeft, PanelLeftClose, PanelLeftOpen, Sidebar, SidebarClose, LayoutPanelLeft, LayoutSidebar } = require('lucide-react');

const render = (Component) => {
  if(!Component) return 'Not found';
  return renderToString(React.createElement(Component));
};

console.log('PanelLeft:', render(PanelLeft));
console.log('PanelLeftClose:', render(PanelLeftClose));
console.log('LayoutPanelLeft:', render(LayoutPanelLeft));
console.log('Sidebar:', render(Sidebar));
