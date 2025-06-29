The `getNext` function selects the next exercise for a user, balancing review of previously seen idioms with the introduction of new ones. Here’s how it works:

1. **Admin Bypass:**  
   If the user has an admin preference set (`getNextExample`), it returns that specific example.

2. **Due Idiom Review:**  
   - Calls `_getNextDueExercise` to find an idiom the user has already started learning and is due for review.
   - If found, `_getExerciseForDueIdiom`:
     - Checks how many examples of this idiom the user has seen.
     - If fewer than the threshold (`GET_NEXT_EXAMPLES_PER_IDIOM`), it tries to find an unseen example or creates a new one.
     - If the user has seen enough examples, it picks the example they've seen the least, or randomly if all have been seen equally.

3. **New Idiom Introduction:**  
   - If no due idiom is found, `_getExerciseForNewIdiom` checks if the user is allowed to learn a new idiom (using `_isNewAllowed`).
   - If allowed, it finds a new idiom the user hasn’t seen, and either selects an existing example or creates a new one.

4. **Fallback:**  
   - If no exercise is found and the user had a tone/usage filter, it retries without those filters.

5. **Exhaustion:**  
   - If no due or new idioms are available, it throws a `CalendarExhaustedError`.

**Supporting Functions:**
- `_getNextDueIdiom`: Finds the next idiom due for review based on user progress and optional filters.
- `_getNewIdiom`: Finds a new idiom the user hasn’t seen, with optional tone/usage filters.
- `_isNewAllowed`: Enforces limits on how many new idioms a user can learn in a given period.

**Summary:**  
The function ensures users review idioms at the right time, see a variety of examples, and only get new idioms when appropriate, adapting to their learning pace and history.
