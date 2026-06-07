// Offline, rule-based plain-English checks. No network, no AI.

const JARGON = [
  'aforementioned',
  'herewith',
  'hereinafter',
  'notwithstanding',
  'aforesaid',
  'whereof',
  'pursuant',
  'henceforth',
  'thereto',
  'enclosed please find',
  'please find enclosed'
];

// "be"-verb followed by a past participle: regular -ed/-en, or a common irregular.
const IRREGULAR_PARTICIPLES =
  'made|done|sent|built|told|held|kept|left|paid|set|put|brought|bought|caught|taught|found|won|met';
const PASSIVE = new RegExp(
  `\\b(was|were|is|are|been|being|be)\\b\\s+(\\w+(ed|en)|${IRREGULAR_PARTICIPLES})\\b(\\s+by\\b)?`,
  'i'
);

export function countSyllables(word) {
  const w = String(word)
    .toLowerCase()
    .replace(/[^a-z]/g, '');
  if (!w) return 0;
  if (w.length <= 3) return 1;
  const groups = w
    .replace(/(?:[^laeiouy]es|ed|[^laeiouy]e)$/, '')
    .replace(/^y/, '')
    .match(/[aeiouy]{1,2}/g);
  return groups ? groups.length : 1;
}

function splitSentences(text) {
  return String(text)
    .split(/[.!?]+/)
    .map((s) => s.trim())
    .filter(Boolean);
}

function words(text) {
  return (
    String(text)
      .trim()
      .match(/[A-Za-z']+/g) || []
  );
}

export function analyseReadability(text = '') {
  const sentences = splitSentences(text);
  const allWords = words(text);
  const wordCount = allWords.length;
  const sentenceCount = sentences.length;
  const syllableCount = allWords.reduce((sum, w) => sum + countSyllables(w), 0);

  // Flesch–Kincaid grade level → approximate UK reading age (+5).
  let readingAge = 0;
  if (wordCount > 0 && sentenceCount > 0) {
    const grade = 0.39 * (wordCount / sentenceCount) + 11.8 * (syllableCount / wordCount) - 15.59;
    readingAge = Math.max(5, Math.round(grade + 5));
  }

  const flags = [];
  sentences.forEach((sentence, index) => {
    const wc = words(sentence).length;
    if (wc > 25) {
      flags.push({
        type: 'long-sentence',
        index,
        detail: `Sentence ${index + 1} has ${wc} words.`
      });
    }
    if (PASSIVE.test(sentence)) {
      flags.push({ type: 'passive', index, detail: `Sentence ${index + 1} may be passive.` });
    }
  });
  const lower = String(text).toLowerCase();
  for (const term of JARGON) {
    if (lower.includes(term)) {
      flags.push({ type: 'jargon', term, detail: `Consider plainer wording than "${term}".` });
    }
  }

  return { readingAge, wordCount, sentenceCount, syllableCount, flags };
}
