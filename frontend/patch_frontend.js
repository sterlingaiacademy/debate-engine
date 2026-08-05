const fs = require('fs');
const file = '/Users/hananphashim/.gemini/antigravity/worktrees/debate-engine/analyze-entire-project-scope/frontend/src/pages/SpeechAnalysis.jsx';
let content = fs.readFileSync(file, 'utf8');

// Fix analyze fetch
content = content.replace(/const data = await response\.json\(\);\s*if \(!response\.ok\) \{\s*throw new Error\(data\.error \|\| 'Failed to process speech'\);\s*\}/s, `
      if (!response.ok) {
        let errorMsg = 'Failed to process speech';
        try {
          const errorData = await response.json();
          if (errorData.error) errorMsg = errorData.error;
        } catch(e) {
          errorMsg = \`Server error (\${response.status})\`;
        }
        throw new Error(errorMsg);
      }
      const data = await response.json();
`);

fs.writeFileSync(file, content);
console.log("Patched locally");
