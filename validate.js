const fs = require('fs');

const data = require('./backend/data/ct_ai_mock.json');
let ok = true;
for (const grade in data) {
  const arr = data[grade];
  if (!Array.isArray(arr)) {
    console.log(`Grade ${grade} is not an array`);
    ok = false;
    continue;
  }
  arr.forEach((q, i) => {
    if (!q.questions || !Array.isArray(q.questions)) {
      console.log(`Grade ${grade}, index ${i}: no questions array`);
      ok = false;
    } else {
      q.questions.forEach((qu, j) => {
        if (!qu.options || !Array.isArray(qu.options)) {
          console.log(`Grade ${grade}, index ${i}, sub ${j}: no options array`);
          ok = false;
        }
      });
    }
  });
}
if (ok) console.log("JSON is valid");
