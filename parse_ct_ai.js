const fs = require('fs');

const grades = {};
for (let grade = 5; grade <= 12; grade++) {
  let file = `Computational Thinking and AI MCQs Grade ${grade}.txt`;
  
  if (!fs.existsSync(file)) {
    console.log("Missing file for grade " + grade);
    continue;
  }

  const lines = fs.readFileSync(file, 'utf8').split('\n');
  
  let currentSection = 0; // 0=Header, 1=CT, 2=AI
  let ctQuestions = [];
  let aiQuestions = [];
  
  let currentUnit = null;
  let currentOptions = [];
  let correctOption = null;
  
  function saveCurrentQuestion() {
     if (currentUnit && currentOptions.length > 0) {
        currentUnit.questions[0].options = currentOptions;
        currentUnit.questions[0].correct = correctOption || 'A';
        
        if (currentSection === 1) ctQuestions.push(currentUnit);
        if (currentSection === 2) aiQuestions.push(currentUnit);
     }
     currentUnit = null;
     currentOptions = [];
     correctOption = null;
  }
  
  for (let i = 0; i < lines.length; i++) {
    let line = lines[i].trim();
    if (!line) continue;
    
    if (line.match(/^(Section|Part)\s+1:/i)) {
      saveCurrentQuestion();
      currentSection = 1;
      continue;
    }
    
    if (line.match(/^(Section|Part)\s+2:/i)) {
      saveCurrentQuestion();
      currentSection = 2;
      continue;
    }
    
    const correctMatch = line.match(/^(?:Correct\s+)?Answer:\s*([A-E])[.)]?/i);
    if (correctMatch) {
       correctOption = correctMatch[1].toUpperCase();
       continue;
    }
    if (line.match(/^Explanation:/i)) {
       continue;
    }
    
    const qMatch1 = line.match(/^Question\s+\d+/i);
    const qMatch2 = line.match(/^(\d+)\.\s+(.*)/);
    
    if (qMatch1) {
       saveCurrentQuestion();
       currentUnit = { passage: "", questions: [{ question: "", options: [], correct: 'A' }] };
       continue;
    }
    
    if (qMatch2) {
       saveCurrentQuestion();
       let text = qMatch2[2];
       currentUnit = { passage: text, questions: [{ question: text, options: [], correct: 'A' }] };
       continue;
    }
    
    const optMatch = line.match(/^[\s\u2022]*([A-E])[.)]\s+(.*)/i);
    if (optMatch) {
      const letter = optMatch[1].toUpperCase();
      let text = optMatch[2];
      
      if (text.match(/\(Correct Answer\)/i)) {
         correctOption = letter;
         text = text.replace(/\s*\(Correct Answer\)/i, '').trim();
      }
      
      currentOptions.push({ letter: letter, text: text });
      continue;
    }
    
    if (currentUnit && currentOptions.length === 0) {
       if (currentUnit.passage) {
           currentUnit.passage += '\n' + line;
           currentUnit.questions[0].question += '\n' + line;
       } else {
           currentUnit.passage = line;
           currentUnit.questions[0].question = line;
       }
    }
  }
  saveCurrentQuestion();
  
  grades[String(grade)] = [
    ...ctQuestions.slice(0, 10),
    ...aiQuestions.slice(0, 5)
  ];
}

for (const g in grades) {
  console.log(`Grade ${g}: ${grades[g].length} questions`);
}
fs.writeFileSync('backend/data/ct_ai_mock.json', JSON.stringify(grades, null, 2));
console.log("Saved backend/data/ct_ai_mock.json");
