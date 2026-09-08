const fs = require('fs');

const text = fs.readFileSync('science_raw.txt', 'utf8');
const lines = text.split('\n');

const grades = {};
let currentGrade = null;
let currentUnit = null;
let currentQuestion = null;
let currentOptions = [];
let correctOption = null;

const letters = ['A', 'B', 'C', 'D', 'E'];

for (let i = 0; i < lines.length; i++) {
  let line = lines[i].trim();
  if (!line) continue;

  const gradeMatch = line.match(/^Science\s*-\s*Grade\s*(\d+)/i);
  if (gradeMatch) {
    currentGrade = gradeMatch[1];
    if (parseInt(currentGrade) >= 6) {
      grades[currentGrade] = [];
    }
    currentUnit = null;
    currentQuestion = null;
    continue;
  }

  if (!currentGrade || parseInt(currentGrade) < 6) continue;

  if (line.match(/^PISA-Style/i) || line.match(/^Questions/i) || line.match(/^Marks/i) || line.match(/^Suggested/i) || line.match(/^Format/i) || line.match(/^25$/) || line.match(/^40 minutes/i) || line.match(/^50 minutes/i) || line.match(/^60 minutes/i) || line.match(/^45 minutes/i) || line.match(/^55 minutes/i) || line.match(/^MCQ/i) || line.match(/^Instructions/i) || line.match(/^THINKQUEST MOCK TEST/i) || line.match(/^Science - Grade/i)) {
    continue;
  }

  const unitMatch = line.match(/^Unit\s*\d+\s*:\s*(.*)/i);
  if (unitMatch) {
    if (currentQuestion && currentOptions.length > 0 && currentUnit) {
      currentUnit.questions.push({
        question: currentQuestion,
        options: currentOptions,
        correct: correctOption || 'A'
      });
    }
    currentUnit = {
      passage: unitMatch[1] + '\n',
      questions: []
    };
    grades[currentGrade].push(currentUnit);
    currentQuestion = null;
    currentOptions = [];
    correctOption = null;
    continue;
  }

  if (line.startsWith('•') || line.startsWith('·')) {
    line = line.replace(/^[•·]\s*/, '').trim();
    
    // In this document, questions are bullets, options are bullets.
    // Usually an option doesn't end in a question mark, but a question might not either.
    // If currentOptions.length >= 4, the NEXT bullet is a new question.
    // Or if currentQuestion is null, it's a question.
    if (currentQuestion === null || currentOptions.length >= 4) {
      if (currentQuestion && currentOptions.length > 0) {
        currentUnit.questions.push({
          question: currentQuestion,
          options: currentOptions,
          correct: correctOption || 'A'
        });
      }
      currentQuestion = line;
      currentOptions = [];
      correctOption = null;
    } else {
      let isCorrect = false;
      if (line.includes('(Correct Answer)')) {
        isCorrect = true;
        line = line.replace(/\s*\(Correct Answer\)\s*/i, '').trim();
      }
      const letter = letters[currentOptions.length];
      currentOptions.push({ letter, text: line });
      if (isCorrect) {
        correctOption = letter;
      }
    }
  } else {
    if (currentUnit && currentQuestion === null) {
      currentUnit.passage += line + '\n';
    } else if (currentQuestion !== null) {
      currentQuestion += ' ' + line;
    }
  }
}

if (currentQuestion && currentOptions.length > 0 && currentUnit) {
  currentUnit.questions.push({
    question: currentQuestion,
    options: currentOptions,
    correct: correctOption || 'A'
  });
}

for (const g in grades) {
  let qCount = 0;
  grades[g].forEach(u => qCount += u.questions.length);
  console.log(`Grade ${g}: ${qCount} questions`);
}

fs.writeFileSync('backend/data/science_mock.json', JSON.stringify(grades, null, 2));
console.log('Saved to backend/data/science_mock.json');
