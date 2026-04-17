const fs = require('fs');
let file = "../frontend/src/App.jsx";
let content = fs.readFileSync(file, 'utf8');

content = content.replace(
  `<Route path="/settings" element={user ? <Settings user={user} /> : <Navigate to="/" />} />`,
  `<Route path="/settings" element={user ? <Settings user={user} setUser={setUser} /> : <Navigate to="/" />} />`
);

fs.writeFileSync(file, content);
console.log('App.jsx patched!');
