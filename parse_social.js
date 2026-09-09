const fs = require('fs');

const grades = {};
const letters = ['A', 'B', 'C', 'D', 'E'];

for (let grade = 5; grade <= 12; grade++) {
  let file = `Grade ${grade} Social Science Benchmark Assessment (NCERT - PISA_IBT Style).txt`;
  
  if (!fs.existsSync(file)) {
    console.log("Missing file for grade " + grade + ": " + file);
    continue;
  }

  const lines = fs.readFileSync(file, 'utf8').split('\n');
  grades[String(grade)] = [];
  
  let currentUnit = null;
  let currentOptions = [];
  let correctOption = null;
  let currentQuestion = null;
  
  for (let i = 0; i < lines.length; i++) {
    let line = lines[i].trim();
    if (!line) continue;
    
    if (line.match(/^Grade \d+/i) || line.match(/^Curriculum/i) || line.match(/^Assessment/i) || line.match(/^Section/i) || line.match(/^Explanation/i)) {
      continue;
    }

    const correctMatch = line.match(/^Correct Answer:\s*([A-E])[.)]?\s*(.*)/i);
    if (correctMatch) {
       correctOption = correctMatch[1].toUpperCase();
       continue;
    }
    
    const qMatch = line.match(/^(\d+)\.\s+(.*)/);
    if (qMatch) {
      if (currentUnit && currentOptions.length > 0) {
        currentUnit.questions[0].options = currentOptions;
        currentUnit.questions[0].correct = correctOption || 'A';
        grades[String(grade)].push(currentUnit);
      }
      currentUnit = { passage: qMatch[2], questions: [{ question: qMatch[2], options: [], correct: 'A' }] };
      currentOptions = [];
      correctOption = null;
      continue;
    }
    
    const optMatch = line.match(/^([A-E])\.\s+(.*)/i);
    if (optMatch) {
      const letter = optMatch[1].toUpperCase();
      let text = optMatch[2];
      currentOptions.push({ letter: letter, text: text });
      continue;
    }
    
    // If it's none of the above, and we have a currentUnit but no options yet, maybe it's multiline question text
    if (currentUnit && currentOptions.length === 0) {
       currentUnit.passage += '\n' + line;
       currentUnit.questions[0].question += '\n' + line;
    }
  }
  
  if (currentUnit && currentOptions.length > 0) {
    currentUnit.questions[0].options = currentOptions;
    currentUnit.questions[0].correct = correctOption || 'A';
    grades[String(grade)].push(currentUnit);
  }
  
  // Only keep the first 15 questions!
  grades[String(grade)] = grades[String(grade)].slice(0, 15);
}

for (const g in grades) {
  let qCount = grades[g].length;
  console.log(`Grade ${g}: ${qCount} questions`);
}

fs.writeFileSync('backend/data/social_science_mock.json', JSON.stringify(grades, null, 2));
console.log("Saved social_science_mock.json");
