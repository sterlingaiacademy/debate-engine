const fs = require('fs');

const path = '/Users/hananphashim/.gemini/antigravity/brain/339d7753-3ffd-42d0-8664-df4b3d41d729/.system_generated/logs/transcript_full.jsonl';
const lines = fs.readFileSync(path, 'utf8').split('\n').filter(Boolean);

let latestDashboardContent = null;

for (const line of lines) {
  try {
    const entry = JSON.parse(line);
    
    // Check if it is a tool response for view_file
    if (entry.type === 'VIEW_FILE' && entry.status === 'DONE' && entry.content) {
      if (entry.content.includes('Dashboard.jsx') && entry.content.includes('Speech Analysis')) {
        latestDashboardContent = entry.content;
      }
    }
    
    // Check if it is a tool call for write_to_file or multi_replace
    if (entry.tool_calls) {
      for (const call of entry.tool_calls) {
        if ((call.name === 'write_to_file' || call.name === 'replace_file_content') && 
            call.args && call.args.TargetFile && call.args.TargetFile.includes('Dashboard.jsx')) {
          const content = call.args.CodeContent || call.args.ReplacementContent || call.args.ReplacementChunks?.[0]?.ReplacementContent;
          if (content && content.includes('Speech Analysis')) {
            latestDashboardContent = content;
          }
        }
      }
    }
    
  } catch (e) {
    // ignore parse errors
  }
}

if (latestDashboardContent) {
  fs.writeFileSync('extracted_speech_analysis.txt', latestDashboardContent, 'utf8');
  console.log('Found Speech Analysis in transcript! Written to extracted_speech_analysis.txt');
} else {
  console.log('Could not find Speech Analysis in transcript.');
}
