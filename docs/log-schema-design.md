# Practice Log Schema

One log represents one practice day. `practiceDate` and `practiceTime` are required. Fundamentals, pieces, and reflection are optional.

```json
{
  "practiceDate": "YYYY-MM-DD",
  "practiceTime": {
    "hours": 0,
    "minutes": 0
  },
  "fundamentals": [
    {
      "type": "scales",
      "key": "C major",
      "bpm": 80,
      "timeOfFocusMinutes": 15,
      "problem": "Keep the left hand relaxed."
    }
  ],
  "pieces": [
    {
      "name": "Prelude in C major",
      "bpm": 72,
      "timeOfFocusMinutes": 25,
      "problem": "Shape the melody through the phrase ending."
    }
  ],
  "reflection": {
    "todaysWin": "Transitions between chords were cleaner.",
    "tomorrowsFocus": "Practice the middle section hands separately."
  }
}
```

## Rules

- `practiceDate` must be a real date that is not in the future.
- `practiceTime.hours` and `practiceTime.minutes` are required. Their combined value must be greater than zero.
- `fundamentals` and `pieces` are arrays because a log may contain multiple entries of either type.
- Omit optional arrays or fields when they have no value; do not add empty placeholder records.
- Store one daily log per user and `practiceDate`. Multiple practice sessions on that date belong in the same daily log.
