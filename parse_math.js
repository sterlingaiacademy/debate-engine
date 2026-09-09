const fs = require('fs');

const grades = {};
const letters = ['A', 'B', 'C', 'D', 'E'];

for (let grade = 5; grade <= 12; grade++) {
  let file;
  if (grade === 5) file = 'Grade 5 Mathematics PISA_IBT Style MCQs V2.txt';
  else if (grade === 10 || grade === 11 || grade === 12) file = `Grade ${grade} Mathematics PISA & IBT Style MCQs.txt`;
  else file = `Grade ${grade} Mathematics PISA_IBT Style MCQs.txt`;
  
  if (!fs.existsSync(file)) {
    console.log("Missing file for grade " + grade + ": " + file);
    continue;
  }

  const lines = fs.readFileSync(file, 'utf8').split('\n');
  grades[String(grade)] = [];
  
  let currentUnit = { passage: '', questions: [] };
  let currentQuestion = null;
  let currentOptions = [];
  let correctOption = null;
  
  for (let i = 0; i < lines.length; i++) {
    let line = lines[i].trim();
    if (!line) continue;
    
    if (line.match(/^Grade \d+/i) || line.match(/^Welcome/i) || line.match(/^Section/i) || line.match(/^Explanation/i)) {
      continue;
    }
    
    const qMatch = line.match(/^(\d+)\.\s+(.*)/);
    if (qMatch) {
      if (currentQuestion && currentOptions.length > 0) {
        currentUnit.questions.push({
          question: currentQuestion,
          options: currentOptions,
          correct: correctOption || 'A'
        });
        grades[String(grade)].push(currentUnit);
      }
      currentUnit = { passage: qMatch[2], questions: [] };
      currentQuestion = null;
      currentOptions = [];
      correctOption = null;
      continue;
    }
    
    const optMatch = line.match(/^([A-E])\)\s+(.*)/i);
    if (optMatch) {
      const letter = optMatch[1].toUpperCase();
      let text = optMatch[2];
      let isCorrect = false;
      if (text.includes('✔') || text.toLowerCase().includes('correct answer')) {
        isCorrect = true;
        text = text.replace(/✔/g, '').replace(/\(Correct Answer\)/ig, '').trim();
      }
      currentOptions.push({ letter: letters[currentOptions.length], text: text });
      if (isCorrect) correctOption = letter;
      continue;
    }
    
    if (currentUnit.passage && currentOptions.length === 0) {
      if (currentQuestion === null) currentQuestion = line;
      else currentQuestion += '\n' + line;
    }
  }
  
  if (currentQuestion && currentOptions.length > 0) {
    currentUnit.questions.push({
      question: currentQuestion,
      options: currentOptions,
      correct: correctOption || 'A'
    });
    grades[String(grade)].push(currentUnit);
  }
}

for (const g in grades) {
  let qCount = 0;
  grades[g].forEach(u => qCount += u.questions.length);
  console.log(`Grade ${g}: ${qCount} questions`);
}

fs.writeFileSync('backend/data/mathematics_mock.json', JSON.stringify(grades, null, 2));
console.log("Saved mathematics_mock.json");
