// 60 debate vocabulary cards across 6 categories

export const VOCAB_CATEGORIES = [
  {
    id: 'fallacies',
    name: 'Logical Fallacies',
    color: '#ef4444',
    description: 'Errors in reasoning that weaken an argument',
    cards: [
      { term: 'Ad Hominem', definition: 'Attacking the person making the argument instead of the argument itself.', example: '"You can\'t trust his views on climate change — he failed science in school."' },
      { term: 'Straw Man', definition: 'Misrepresenting someone\'s argument to make it easier to attack.', example: '"You said we should reduce military spending — so you want us completely defenceless?"' },
      { term: 'False Dichotomy', definition: 'Presenting only two choices when more options exist.', example: '"You\'re either with us or against us."' },
      { term: 'Slippery Slope', definition: 'Claiming one event will lead inevitably to extreme consequences without proof.', example: '"If we allow homework to be reduced, students will soon stop learning altogether."' },
      { term: 'Appeal to Authority', definition: 'Using an expert\'s opinion as proof, even when that expert is irrelevant or not credible.', example: '"A famous actor said vaccines are dangerous, so they must be."' },
      { term: 'Circular Reasoning', definition: 'Using the conclusion as a premise in the argument.', example: '"The Bible is true because it says so in the Bible."' },
      { term: 'Hasty Generalization', definition: 'Drawing a broad conclusion from a small sample.', example: '"I met two rude people from that country — they\'re all rude."' },
      { term: 'Red Herring', definition: 'Introducing an irrelevant topic to distract from the main argument.', example: '"Why debate climate change when crime rates are rising?"' },
      { term: 'Appeal to Emotion', definition: 'Manipulating feelings instead of using logic to win an argument.', example: '"Think of the starving children — how can you oppose this policy?"' },
      { term: 'Bandwagon Fallacy', definition: 'Arguing something is true because many people believe it.', example: '"Everyone is buying crypto, so it must be a good investment."' },
    ],
  },
  {
    id: 'rhetoric',
    name: 'Rhetoric Devices',
    color: '#a855f7',
    description: 'Techniques to make arguments more persuasive',
    cards: [
      { term: 'Ethos', definition: 'An appeal to credibility and ethics to persuade an audience.', example: '"As a doctor with 20 years of experience, I can confirm this treatment works."' },
      { term: 'Pathos', definition: 'An appeal to emotion to make the audience feel something.', example: '"Imagine a child going to sleep hungry every night — that\'s the reality we must change."' },
      { term: 'Logos', definition: 'An appeal to logic and reason using facts and evidence.', example: '"Studies show a 42% reduction in accidents in countries with stricter speed limits."' },
      { term: 'Anaphora', definition: 'Repeating a word or phrase at the start of successive clauses for emphasis.', example: '"We shall fight on the beaches, we shall fight on the landing grounds, we shall fight in the fields."' },
      { term: 'Antithesis', definition: 'Placing contrasting ideas side by side for effect.', example: '"Ask not what your country can do for you — ask what you can do for your country."' },
      { term: 'Rhetorical Question', definition: 'A question asked for effect, not an answer — it implies the answer is obvious.', example: '"Can we really afford to ignore climate change any longer?"' },
      { term: 'Tricolon', definition: 'A group of three parallel words, phrases or clauses.', example: '"Government of the people, by the people, for the people."' },
      { term: 'Hyperbole', definition: 'Deliberate exaggeration for emphasis or effect.', example: '"I\'ve told you a million times to check your sources."' },
      { term: 'Metaphor', definition: 'Describing something by saying it IS something else.', example: '"The classroom is a battlefield of ideas."' },
      { term: 'Alliteration', definition: 'Repeating the same consonant sound at the start of nearby words.', example: '"We must be bold, brave, and bold in the face of this crisis."' },
    ],
  },
  {
    id: 'structure',
    name: 'Debate Structure',
    color: '#0ea5e9',
    description: 'Key terms used in formal debate formats',
    cards: [
      { term: 'Motion', definition: 'The statement being debated. One side argues for it, the other against.', example: '"This House believes homework should be abolished."' },
      { term: 'Proposition', definition: 'The side that argues IN FAVOUR of the motion.', example: '"The proposition must argue that homework should indeed be abolished."' },
      { term: 'Opposition', definition: 'The side that argues AGAINST the motion.', example: '"The opposition argues that homework remains valuable."' },
      { term: 'Rebuttal', definition: 'Directly addressing and countering an argument made by the other side.', example: '"My opponent claims screens hurt learning — however, a 2023 study found the opposite."' },
      { term: 'Concession', definition: 'Acknowledging a point made by your opponent, before countering it.', example: '"I grant that social media has some benefits — however, the harms far outweigh them."' },
      { term: 'Point of Information (POI)', definition: 'A brief interjection during an opponent\'s speech to challenge them.', example: '"On a point of information — did you not just contradict your opening claim?"' },
      { term: 'Burden of Proof', definition: 'The obligation to provide evidence for your claim.', example: '"The proposition carries the burden of proof — they must show homework causes harm."' },
      { term: 'Status Quo', definition: 'The current state of affairs before any change.', example: '"The status quo — allowing unlimited screen time — is clearly not working."' },
      { term: 'Substantive Speech', definition: 'A main speech that builds the team\'s core arguments.', example: '"In my substantive speech, I will present three key arguments for this motion."' },
      { term: 'Summation', definition: 'A closing statement that summarises key points and impact.', example: '"In summation: the evidence is clear, the harm is real, and action is now."' },
    ],
  },
  {
    id: 'connectives',
    name: 'Connective Language',
    color: '#10b981',
    description: 'Words and phrases that link ideas powerfully',
    cards: [
      { term: 'Conversely', definition: 'On the other hand; used to introduce an opposing idea.', example: '"Some argue technology isolates people. Conversely, it has connected billions globally."' },
      { term: 'Notwithstanding', definition: 'Despite; in spite of.', example: '"Notwithstanding the economic benefits, the environmental cost is too high."' },
      { term: 'Furthermore', definition: 'In addition; used to add a supporting point.', example: '"Schools reduce inequality. Furthermore, they create the social bonds communities need."' },
      { term: 'Ergo', definition: 'Therefore; consequently. Signals a logical conclusion.', example: '"The data shows harm. Ergo, we must act."' },
      { term: 'Albeit', definition: 'Although; used to introduce a concession.', example: '"The policy has had some success, albeit limited."' },
      { term: 'Insofar as', definition: 'To the extent that.', example: '"This argument holds, insofar as we accept the premise."' },
      { term: 'Juxtapose', definition: 'To place two things side by side to contrast them.', example: '"Juxtapose the lives of the wealthy with those in poverty, and the injustice becomes clear."' },
      { term: 'Hence', definition: 'As a result; for this reason.', example: '"Screen time increases anxiety; hence, it must be limited for children."' },
      { term: 'Albeit', definition: 'Despite; even though.', example: '"The plan has merit, albeit with significant risks attached."' },
      { term: 'Primarily', definition: 'Above all; mainly.', example: '"The argument rests primarily on the economic evidence."' },
    ],
  },
  {
    id: 'evidence',
    name: 'Evidence Language',
    color: '#f59e0b',
    description: 'Phrases to cite and challenge evidence effectively',
    cards: [
      { term: 'Empirical', definition: 'Based on observation or experiment, not theory.', example: '"The empirical evidence from 40 countries clearly supports this finding."' },
      { term: 'Anecdotal Evidence', definition: 'Evidence based on personal stories rather than data — considered weak in debate.', example: '"My neighbour did well without school — but that\'s anecdotal, not proof."' },
      { term: 'Correlation vs Causation', definition: 'Two things that happen together (correlation) are not necessarily causing each other (causation).', example: '"Ice cream sales and drowning rates both rise in summer — but ice cream doesn\'t cause drowning."' },
      { term: 'Peer-Reviewed', definition: 'Research that has been checked and approved by other experts before publication.', example: '"A peer-reviewed study in The Lancet confirmed these results."' },
      { term: 'Quantitative', definition: 'Data that can be measured in numbers.', example: '"Quantitatively, 78% of participants showed improvement."' },
      { term: 'Qualitative', definition: 'Data based on descriptive observations rather than numbers.', example: '"Qualitative interviews revealed students felt more confident after the programme."' },
      { term: 'Meta-Analysis', definition: 'A study that combines results from multiple studies to draw broader conclusions.', example: '"A meta-analysis of 200 studies confirmed air pollution raises mortality rates."' },
      { term: 'Extrapolate', definition: 'To extend or apply existing data to predict beyond the known range.', example: '"If we extrapolate current trends, the sea level will rise 1m by 2100."' },
    ],
  },
  {
    id: 'moves',
    name: 'Argument Moves',
    color: '#6366f1',
    description: 'Strategic moves debaters use to win arguments',
    cards: [
      { term: 'Signposting', definition: 'Clearly telling the audience what you are about to say or just said, to aid clarity.', example: '"I will now present my third and final argument — the economic case."' },
      { term: 'Hedging', definition: 'Using cautious language to soften a claim — overuse weakens argument.', example: '"This might perhaps suggest that there could be some potential harm." (too much hedging!)' },
      { term: 'Preemptive Strike', definition: 'Addressing and dismissing a likely counterargument before your opponent raises it.', example: '"You may argue that cost is prohibitive — but I will show it pays for itself."' },
      { term: 'Burden Shifting', definition: 'Forcing your opponent to disprove your claim instead of you proving it.', example: '"Can the opposition provide a single example where this policy has failed? No."' },
      { term: 'Impact Calculus', definition: 'Comparing the magnitude and probability of harms and benefits to decide which argument matters most.', example: '"Even if both harms occur, saving 10,000 lives outweighs the economic cost."' },
      { term: 'Turning the Argument', definition: 'Showing that your opponent\'s argument actually supports YOUR side.', example: '"My opponent says strict exams create pressure. I agree — that pressure builds resilience."' },
      { term: 'Comparative Advantage', definition: 'Arguing your position is better than the alternative — not perfect, just better.', example: '"Nuclear is not risk-free — but compared to coal, it is dramatically safer."' },
      { term: 'Narrative Framing', definition: 'Setting the story or lens through which the entire debate should be viewed.', example: '"Before we debate the economics, let us agree on the moral frame: children\'s futures come first."' },
    ],
  },
];

export function generateQuiz(category) {
  const questions = [];
  const shuffled = [...category.cards].sort(() => Math.random() - 0.5).slice(0, 5);
  
  shuffled.forEach(card => {
    const wrongOptions = category.cards
      .filter(c => c.term !== card.term)
      .sort(() => Math.random() - 0.5)
      .slice(0, 3)
      .map(c => c.term);
    
    const options = [card.term, ...wrongOptions].sort(() => Math.random() - 0.5);
    questions.push({
      definition: card.definition,
      correct: card.term,
      options,
    });
  });
  
  return questions;
}
