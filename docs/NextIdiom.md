The `getNext` function determines the next exercise to present to a user based on their learning progress with Spanish idioms. Here's what it does:

1. First tries to find an idiom that's due for review by calling `_getNextDueIdiom`
2. If a due idiom exists (user has seen it before):

   - Checks how many examples of this idiom the user has seen
   - If under the threshold (3 examples), either:
     - Finds an existing example the user hasn't seen yet
     - Creates a new example using OpenAI if necessary
   - If at the threshold, selects examples the user has seen fewer times
   - Has fallback logic if all examples have been seen multiple times
3. If no due idiom exists:

   - Gets a new idiom the user hasn't encountered via `_getNewIdiom`
   - Finds an existing example or creates a new one

The function balances reviewing due content with introducing new material, while managing variety through different examples of the same idiom.
