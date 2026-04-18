const fs = require('fs');
const p = 'frontend/src/pages/ConversationalAgent.jsx';
let c = fs.readFileSync(p, 'utf8');

c = c.replace(/        <\/div>\r?\n                \)}\r?\n        <\/div>\r?\n      <\/div>\r?\n      \)}\r?\n    <\/div>\r?\n    <\/>\r?\n  \);\r?\n}\r?\n?$/, `        </div>
      </div>
      )}
    </div>
    </>
  );
}`);

fs.writeFileSync(p, c);
console.log('Fixed syntax error');
