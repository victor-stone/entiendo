# Entiendo Exercise Phases

There are four phases of an `ExerciseCard`. Each phase has its own `phase` value in the `ExerciseState` and a corresponding component:

- **ExerciseCard**: Parent component that manages the phases between children. It retrieves exercise information from `/api/exercises/next?tone={session.tone}`.

---

### 1. ExercisePrompt (`phase: "prompt"`)

- **Purpose**: Displays the exercise challenge to the user.
- **UI**: Audio player for the exercise sentence. (For development, displays the text in a `<div />`.)
- **Visibility**: This component remains visible during both the "prompt" and "input" phases.
- **Transition**: Advances automatically to the next phase.

---

### 2. ExerciseInput (`phase: "input"`)

- **Purpose**: Allows the user to respond to the exercise.
- **UI**: Two edit fields—one for transcription and one for translation of the audio. (In development, text is displayed instead of audio.)
- **Transition**: User clicks the "submit" button to proceed.

---

### 3. ExerciseEval (`phase: "evaluation"`)

- **Purpose**: Evaluates the user's input.
- **UI**: Displays a "loading…" indicator while the client calls  
  `/api/exercise/evaluate?exampleId=exId&transcription=user-transcription&translation=user-translation`.
- **Transition**: Proceeds when results return from the server.

---

### 4. ExerciseResults (`phase: "results"`)

- **Purpose**: Shows feedback and results.
- **UI**: Displays feedback, types of mistakes, the idiom being tested, and the exact transcription of the audio with the conjugated idiom highlighted.
- **Transition**: User can request the next exercise.

---

At this point, the user can request the **next** exercise.

---

<!-- #entiendo/5 --
