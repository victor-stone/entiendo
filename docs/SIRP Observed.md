Watching what happens when you get 'perfect' score is instructive:

If you get 'perfect' on the first attempt the next date is 5-6 days out, say 'perfect' means x5 (score 1.0 x 5-> 5.0)

But when you get less 'errors' multiplyer is 0.75 so you're put on the sched in 1-2 days (score 1.0 -> 0.75)

When that case comes due (1,2 days) and you try again and get 'perfect' you are not flung out 5-6 days, your score only takes you 3 more days (score: 0.75 * 5 -> 3.75)

so even though you "know it" you're going to see a 3rd time before seeing the first 'perfect' one where you go it out of the box.

The numbers above are not real - they were chosen to make it easier to understand the process.
----------------------------------------------------------------------------------------------

example highlights a key difference between SIRP and classic SM-2/Anki:

In SM-2/Anki: If you get a low score, then a high score, the next interval is still based on the previous (short) interval, so you don’t immediately jump to a long interval. But after a few “good” or “easy” ratings, you can quickly get long intervals, and “easy” can sometimes push cards out too far, too fast.
In SIRP: Your system intentionally slows down the interval growth after a lapse or “not perfect” response—even if you get “perfect” next time. This means you’ll see the card again sooner, and it takes multiple “perfect” recalls to reach long intervals. This is much more forgiving for inconsistent recall and prevents cards from escaping review too quickly.
Your doc’s example (x0.75, then x5 = 3.75 days, not 5+) makes this clear:
SIRP’s interval growth is “anchored” to recent performance, not just the latest answer. This is a subtle but important distinction that helps learners who need more reinforcement, and it’s not how SM-2/Anki typically behaves.

What you can’t do in Anki’s stock settings that built into SIRP:

Dynamically adjust ease/interval based on nuanced feedback or mistake type.

Automatically re-drill “easy” cards at unpredictable intervals without manual intervention.
Use custom logic for interval growth (Anki’s is fixed by ease and interval modifiers).

---

Here’s how the terms ease factor, difficulty, feedback, and interval fit together in your SIRP system, using your actual code as context:

How SIRP Works (with your code)

1. Feedback
   This is the score the user gives after reviewing a card.
   In your code, it’s a number from 0 to 3:
   0 = Fail
   1 = Hard
   2 = Good
   3 = Easy
   The feedback is calculated in calibrate.js based on how well the user did (perfect, minor errors, etc.).
2. Difficulty (Ease Factor)
   This is a number (usually between 1.3 and 3.0) that controls how quickly intervals grow.
   In your code, it’s called difficulty (but it acts like Anki’s “ease factor”).
   If you do well, difficulty goes up a little (intervals get longer).
   If you struggle, difficulty goes down (intervals grow more slowly).
3. Interval
   This is how many days until you see the card again.
   In your code, it’s interval.
   The next interval is calculated based on the current interval, the difficulty, and your feedback.
   For “Easy,” interval grows a lot: interval * difficulty * 1.3
   For “Good,” interval grows: interval * difficulty
   For “Hard,” interval grows a little: interval * 0.7
   For “Fail,” interval shrinks: interval * 0.5 (minimum 1)
4. Randomization
   Your code adds a small random factor (±5%) so reviews aren’t too predictable.
5. Anchoring to Recent Performance
   If you get a “Hard” or “Fail,” your interval shrinks or grows slowly.
   Even if you get “Easy” next time, the interval is based on the current (short) interval, so you don’t jump to a long interval right away.
   This is what your doc means by “anchored to recent performance.”
6. Leech Handling
   If you fail a card 3 times, it’s flagged as a “leech” for special attention.
   How It All Fits Together (Step by Step)
   You answer a card.
   Your answer is evaluated (perfect, minor errors, etc.).
   calibrate.js maps this to feedback (0–3) and tweaks for mistake type.
   update.js uses feedback to adjust difficulty and interval.
   A random factor is applied.
   The next due date is set based on the new interval.
   If you keep struggling, the card stays in frequent review. If you do well several times in a row, intervals get longer.
   In summary:

Feedback = how well you did
Difficulty (ease factor) = how fast intervals grow
Interval = days until next review
Your recent performance directly controls how quickly cards move out, making SIRP more forgiving and adaptive than classic SM-2/Anki.




| Review | Feedback | Interval Calculation       | Next Interval |
| -------- | ---------- | ---------------------------- | --------------- |
| 1      | Easy (3) | 1 * 2.5 * 1.3              | ~3 days       |
| 2      | Good (2) | 3 * 2.5                    | ~8 days       |
| 2      | Hard (1) | 3 * 0.7                    | ~2 days       |
| 2      | Fail (0) | 3 * 0.5                    | ~1 day        |
| 3      | Easy (3) | 1 * 2.5 * 1.3 (after fail) | ~3 days       |
