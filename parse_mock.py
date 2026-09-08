import json
import re

with open('mock.txt', 'r', encoding='utf-8') as f:
    lines = f.read().splitlines()

data = {}
current_grade = None
current_text = None
current_q = None

i = 0
while i < len(lines):
    line = lines[i].strip()
    if not line:
        i += 1
        continue
    
    # Check for grade header
    grade_match = re.match(r'English\s*-\s*Grade\s*(\d+)', line)
    if grade_match:
        current_grade = grade_match.group(1)
        data[current_grade] = []
        current_text = None
        current_q = None
        i += 1
        continue
        
    if current_grade is None:
        i += 1
        continue
        
    # Check for text start
    text_match = re.match(r'(Text\s*\d+:\s*(.*))', line)
    if text_match:
        title = text_match.group(1)
        # Read passage body until first question bullet
        body = []
        i += 1
        while i < len(lines):
            nxt = lines[i].strip()
            if nxt.startswith('•\t') and nxt.endswith('?'):
                # Looks like a question, break
                break
            # Also break if we hit "Answer Key"
            if nxt.startswith('Answer Key'):
                break
            if nxt:
                body.append(nxt)
            i += 1
        
        current_text = {
            'passage': title + '\n\n' + '\n'.join(body),
            'questions': []
        }
        data[current_grade].append(current_text)
        continue

    # Question parsing
    if line.startswith('•\t'):
        q_text = line.replace('•\t', '').strip()
        # Ensure it's a question or a statement (questions usually followed by 4 options)
        # Actually, let's just assume any bullet followed by 4 bullets is a question.
        # But wait, options are also bullets!
        # The structure is:
        # • Question
        # • Option A
        # • Option B
        # • Option C
        # • Option D
        
        # Let's read the next 4 bullets
        if i + 4 < len(lines):
            opt1 = lines[i+1].strip()
            opt2 = lines[i+2].strip()
            opt3 = lines[i+3].strip()
            opt4 = lines[i+4].strip()
            
            if all(o.startswith('•\t') for o in [opt1, opt2, opt3, opt4]):
                opts = [opt1, opt2, opt3, opt4]
                options = []
                correct = 'A'
                letters = ['A', 'B', 'C', 'D']
                for idx, o in enumerate(opts):
                    o_text = o.replace('•\t', '').strip()
                    if '(Correct Answer)' in o_text:
                        correct = letters[idx]
                        o_text = o_text.replace('(Correct Answer)', '').strip()
                    options.append({'letter': letters[idx], 'text': o_text})
                
                if current_text:
                    current_text['questions'].append({
                        'question': q_text,
                        'options': options,
                        'correct': correct
                    })
                i += 5
                continue
    i += 1

# Clean up empty grades
cleaned_data = {}
for g, texts in data.items():
    if len(texts) > 0:
        cleaned_data[g] = texts

print("Parsed grades:", list(cleaned_data.keys()))
for g, texts in cleaned_data.items():
    q_count = sum(len(t['questions']) for t in texts)
    print(f"Grade {g}: {len(texts)} texts, {q_count} questions")

with open('backend/data/english_mock.json', 'w', encoding='utf-8') as f:
    json.dump(cleaned_data, f, indent=2)

