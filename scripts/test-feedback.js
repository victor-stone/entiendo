//import { getFeedbackForUser } from "../src/server/lib/openai.js"
import { progressQuery } from './query.js';
import progress from "../staging/query/progress.js";

const userId = 'google-oauth2|101722812212104773442';
const ONE_WEEK = 7 * 24 * 60 * 60 * 1000;
const now = Date.now();

const prog = progressQuery.q('..{.userId == $userId && !.isSandbox}.history', { userId, now, ONE_WEEK })

console.log(JSON.stringify(prog, null, 2));

console.log('done');


function getHistory(progress, from, to = Date.now()) {
  return progress.filter( p => {
    if( p.userId === userId ) {
        if (Array.isArray(p.history)) {
            p.history = p.history.filter(({date}) => {
                return date >= from && date <= to;
            });
            if( p.history.length > 0 ) {
                return true;
            }
        }
    }
    return false;
  });
}

// let feedback;
// try {
//     feedback = await getFeedbackForUser({
//         userId: 'google-oauth2|101722812212104773442',
//         progress: prog
//     });
// }
// catch( err ) {
//     console.log(err);
// }

// console.log(JSON.stringify(feedback, null, 2));

const results = 
{
  "userId": "google-oauth2|101722812212104773442",
  "insights": [
    {
      "pattern": "Frequent minor errors: prepositions, articles, and short connector words",
      "description": "Across many idioms, your mistakes tend to be small missing words (like 'de', 'a', 'el', 'al') that impact the rhythm and correctness of Rioplatense Spanish. For example, missed prepositions in 'voy al gimnasio', 'de modo que', or short words like 'si', 'de', and 'a' in idioms keep appearing.",
      "suggestion": "Try speaking or writing out full sentences and consciously slow down to notice every small preposition or linking word typical in spoken Spanish. Consider shadowing audio and focusing on these connectives."
    },
    {
      "pattern": "Recurring transcription misunderstandings tied to audio details",
      "description": "You often mishear or miss details in Rioplatense audio—tense confusion, missing accent marks, and plural/singular switches. These audio misunderstandings lead to mixed-up subjects and small shifts in meaning, as seen with 'ayer' vs. 'che', 'todo' vs. 'toda', or 'va'/'vas'.",
      "suggestion": "Work on active listening drills with Rioplatense audio, ideally using slowed-down or repeated sentences, to tune your ear to tense and subject shifts. Re-listen and check your understanding before transcribing."
    },
    {
      "pattern": "Most translation errors are not pure misunderstandings—often they’re nuance or register issues",
      "description": "In translations, your answers are rarely truly wrong, but they might miss idiomatic tone or drift more formal/informal than native speech ('by myself' vs. original meaning, register with 'get off their asses', literal vs. idiomatic translation, etc.).",
      "suggestion": "After translating, pause and think: 'Is this how people would say it in natural English, or did I just swap word for word?' Reading Rioplatense dialogues, or asking a native how they’d say something, will help build intuition for local tone."
    },
    {
      "pattern": "Success streaks and high lapse counts on super common idioms",
      "description": "Even idioms that are marked as 'super common' sometimes have multiple lapses and lower confidence (for example: missing 'de' in 'de modo que', misunderstanding 'ponerle pilas'). This suggests you might focus more on novelty than solidifying core expressions.",
      "suggestion": "Make sure to revisit even 'easy-looking' cards with intention—super common idioms form the backbone of everyday speech, so focus on mastering these to automaticity, not just passing the card."
    },
    {
      "pattern": "Typo errors are recurring despite high comprehension",
      "description": "Many of your mistakes are typos or missing accents/punctuation, even when comprehension is strong. This can undervalue your progress but also points to a pattern of rushing in written tasks.",
      "suggestion": "Type a little slower in exercises. Consider practicing Spanish writing (messages, short diary entries) and double-checking accent marks and small details. Over time, this will make it smoother and more automatic."
    }
  ],
  "strategyTips": [
    "Review your recent mistakes by reading the correct phrases out loud, focusing on every detail, especially prepositions and little words—this reinforces muscle memory for natural speech.",
    "Get more Rioplatense audio exposure: watch short clips, listen to native podcasts, or replay Entiendo’s audio slowly to catch subject and tense markers.",
    "Don’t brush off 'small' mistakes—dedicate a session to shadowing and rewriting common idioms until every part (including articles and connectors) feels automatic."
  ]
}
