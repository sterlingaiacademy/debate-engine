const fs = require('fs');
let c = fs.readFileSync('frontend/src/pages/Settings.jsx', 'utf8');

const old = 'setUser({ ...user, avatar: base64Avatar });';
const rep = `const updatedUser = { ...user, avatar: base64Avatar };
                setUser(updatedUser);
                localStorage.setItem('user', JSON.stringify(updatedUser));`;

if (c.includes(old)) {
  c = c.replace(old, rep);
  fs.writeFileSync('frontend/src/pages/Settings.jsx', c);
  console.log('FIXED: Avatar now persists to localStorage');
} else {
  console.log('NOT FOUND');
}
