## Entiendo EXERCISE PHASES

There are four phases of an ExerciseCard - each has it’s own ‘phase’ value in the ExerciseState and a component to match:
ExerciseCard - Parent Component, manages the phases between children, it retrieves /api/exercises/next?tone={session.tone} to get the exercise information

1. ExercisePrompt - phase “prompt” - Displays the Exercise challenge to the user. This is an audio player which the user can hear the exercise sentence. (For development purposes we simply display the text in a `<div />` - this component stays on the screen for this phase and next (‘input’) phase. Transition to next phase: automatic.
2. ExerciseInput - phase “input” - While the ExercisePrompt is also on the screen it displays two edit fields - one for transcription of the audio and one for translation of the audio (again, in development there is no audio, it’s just a text display) - Transition to next phase: use pushes “submit” button
3. ExcerciseEval - phase “evaluation” User interface is “loading…” while the client calls /api/exercise/evaluate?exampleId=exId&transcription=user-transcription&translation=user-translation - Transition to next phase: results return from server
4. ExerciseResults - phase “results” - Show feedback, types of mistakes, the idiom being tested, the exact transcription of the audio with the conjugated idiom highlighted

At this point the user can request the ’next’ exercise

#entiendo/5
