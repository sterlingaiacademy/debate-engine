export const SENIOR_MOTIONS = [
  "Social media has done more harm than good",
  "Artificial intelligence will destroy more jobs than it creates",
  "Homework should be abolished in schools",
  "Climate change is the greatest threat to humanity",
  "The death penalty should be abolished worldwide",
  "Zoos should be banned",
  "School uniforms should be mandatory",
  "Smartphones should be banned in schools",
  "Universal basic income should be implemented",
  "Space exploration is a waste of money",
  "Online education is better than classroom education",
  "Celebrities have a responsibility to be role models",
  "Violent video games should be banned for children",
  "Democracy is the best form of government",
  "Globalization has done more good than harm",
  "Animal testing should be completely banned",
  "The voting age should be lowered to 16",
  "Nuclear energy is the future of sustainable power",
  "Standardized testing should be eliminated",
  "Fast food restaurants should be taxed heavily",
  "Children should not be allowed on social media until age 16",
  "Free healthcare should be a universal right",
  "Cancel culture does more harm than good",
  "The internet has weakened human relationships",
  "A four-day workweek should become the global standard",
  "The education system is failing students",
  "Online privacy is more important than national security",
  "Technology has made us less creative",
  "Higher education is no longer worth the cost",
  "Schools should teach financial literacy as a core subject",
];

export const JUNIOR_MOTIONS = [
  "School should be only 4 days a week",
  "Homework should not be given to students",
  "PE should be every day at school",
  "Children should be allowed to choose their own bedtime",
  "Cats are better pets than dogs",
  "Video games can help you learn",
  "Children should have their own smartphones",
  "Reading books is better than watching TV",
  "Summer holidays should be longer",
  "Junk food should not be sold in schools",
  "Children should get paid for doing chores",
  "Zoos are good for animals",
  "All children should learn to play a musical instrument",
  "School uniforms are a good idea",
  "Superheroes are better than sports stars as role models",
  "Recess should be longer than lessons",
  "Screen time should be limited to 1 hour per day for children",
  "Pocket money teaches children to be responsible",
  "Robots should not replace teachers",
  "Children should be able to grade their teachers",
];

export function getDailyMotion(isJunior = false) {
  const now = new Date();
  const ist = new Date(now.getTime() + 5.5 * 60 * 60 * 1000);
  const start = new Date(ist.getFullYear(), 0, 0);
  const dayOfYear = Math.floor((ist - start) / (1000 * 60 * 60 * 24));
  const motions = isJunior ? JUNIOR_MOTIONS : SENIOR_MOTIONS;
  return motions[dayOfYear % motions.length];
}

export const VOCAB_CATEGORIES = [
  {
    id: 'fallacies', name: 'Logical Fallacies', color: '#ef4444',
    description: 'Errors in reasoning that weaken an argument',
    cards: [
      { term: 'Ad Hominem', definition: 'Attacking the person making the argument instead of the argument itself.', example: '"You can\'t trust his views on climate change — he failed science in school."' },
      { term: 'Straw Man', definition: 'Misrepresenting someone\'s argument to make it easier to attack.', example: '"You said we should reduce military spending — so you want us completely defenceless?"' },
      { term: 'False Dichotomy', definition: 'Presenting only two choices when more options exist.', example: '"You\'re either with us or against us."' },
      { term: 'Slippery Slope', definition: 'Claiming one event will lead inevitably to extreme consequences without proof.', example: '"If we allow homework to be reduced, students will soon stop learning altogether."' },
      { term: 'Red Herring', definition: 'Introducing an irrelevant topic to distract from the main argument.', example: '"Why debate climate change when crime rates are rising?"' },
      { term: 'Appeal to Emotion', definition: 'Manipulating feelings instead of using logic to win an argument.', example: '"Think of the starving children — how can you oppose this policy?"' },
      { term: 'Bandwagon Fallacy', definition: 'Arguing something is true because many people believe it.', example: '"Everyone is buying crypto, so it must be a good investment."' },
    ],
  },
  {
    id: 'rhetoric', name: 'Rhetoric Devices', color: '#a855f7',
    description: 'Techniques to make arguments more persuasive',
    cards: [
      { term: 'Ethos', definition: 'An appeal to credibility and ethics to persuade an audience.', example: '"As a doctor with 20 years of experience, I can confirm this treatment works."' },
      { term: 'Pathos', definition: 'An appeal to emotion to make the audience feel something.', example: '"Imagine a child going to sleep hungry every night — that\'s the reality we must change."' },
      { term: 'Logos', definition: 'An appeal to logic and reason using facts and evidence.', example: '"Studies show a 42% reduction in accidents in countries with stricter speed limits."' },
      { term: 'Anaphora', definition: 'Repeating a word or phrase at the start of successive clauses for emphasis.', example: '"We shall fight on the beaches, we shall fight on the landing grounds, we shall fight in the fields."' },
      { term: 'Rhetorical Question', definition: 'A question asked for effect, not an answer.', example: '"Can we really afford to ignore climate change any longer?"' },
    ],
  },
  {
    id: 'structure', name: 'Debate Structure', color: '#0ea5e9',
    description: 'Key terms used in formal debate formats',
    cards: [
      { term: 'Motion', definition: 'The statement being debated. One side argues for it, the other against.', example: '"This House believes homework should be abolished."' },
      { term: 'Rebuttal', definition: 'Directly addressing and countering an argument made by the other side.', example: '"My opponent claims screens hurt learning — however, a 2023 study found the opposite."' },
      { term: 'Concession', definition: 'Acknowledging a point made by your opponent, before countering it.', example: '"I grant that social media has some benefits — however, the harms far outweigh them."' },
      { term: 'Burden of Proof', definition: 'The obligation to provide evidence for your claim.', example: '"The proposition carries the burden of proof."' },
      { term: 'Status Quo', definition: 'The current state of affairs before any change.', example: '"The status quo — allowing unlimited screen time — is clearly not working."' },
    ],
  },
  {
    id: 'connectives', name: 'Connective Language', color: '#10b981',
    description: 'Words and phrases that link ideas powerfully',
    cards: [
      { term: 'Conversely', definition: 'On the other hand; used to introduce an opposing idea.', example: '"Some argue technology isolates people. Conversely, it has connected billions globally."' },
      { term: 'Furthermore', definition: 'In addition; used to add a supporting point.', example: '"Schools reduce inequality. Furthermore, they create the social bonds communities need."' },
      { term: 'Ergo', definition: 'Therefore; consequently. Signals a logical conclusion.', example: '"The data shows harm. Ergo, we must act."' },
      { term: 'Hence', definition: 'As a result; for this reason.', example: '"Screen time increases anxiety; hence, it must be limited for children."' },
    ],
  },
  {
    id: 'evidence', name: 'Evidence Language', color: '#f59e0b',
    description: 'Phrases to cite and challenge evidence effectively',
    cards: [
      { term: 'Empirical', definition: 'Based on observation or experiment, not theory.', example: '"The empirical evidence from 40 countries clearly supports this finding."' },
      { term: 'Anecdotal Evidence', definition: 'Evidence based on personal stories rather than data — considered weak in debate.', example: '"My neighbour did well without school — but that\'s anecdotal, not proof."' },
      { term: 'Peer-Reviewed', definition: 'Research checked and approved by other experts before publication.', example: '"A peer-reviewed study in The Lancet confirmed these results."' },
      { term: 'Meta-Analysis', definition: 'A study that combines results from multiple studies to draw broader conclusions.', example: '"A meta-analysis of 200 studies confirmed air pollution raises mortality rates."' },
    ],
  },
  {
    id: 'moves', name: 'Argument Moves', color: '#6366f1',
    description: 'Strategic moves debaters use to win arguments',
    cards: [
      { term: 'Signposting', definition: 'Clearly telling the audience what you are about to say or just said, to aid clarity.', example: '"I will now present my third and final argument — the economic case."' },
      { term: 'Preemptive Strike', definition: 'Addressing and dismissing a likely counterargument before your opponent raises it.', example: '"You may argue that cost is prohibitive — but I will show it pays for itself."' },
      { term: 'Impact Calculus', definition: 'Comparing the magnitude and probability of harms and benefits.', example: '"Even if both harms occur, saving 10,000 lives outweighs the economic cost."' },
      { term: 'Narrative Framing', definition: 'Setting the story or lens through which the entire debate should be viewed.', example: '"Before we debate the economics, let us agree on the moral frame: children\'s futures come first."' },
    ],
  },
];

export function generateQuiz(category) {
  const shuffled = [...category.cards].sort(() => Math.random() - 0.5).slice(0, 5);
  return shuffled.map(card => {
    const wrong = category.cards
      .filter(c => c.term !== card.term)
      .sort(() => Math.random() - 0.5)
      .slice(0, 3)
      .map(c => c.term);
    return {
      definition: card.definition,
      correct: card.term,
      options: [card.term, ...wrong].sort(() => Math.random() - 0.5),
    };
  });
}
