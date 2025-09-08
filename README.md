# Stopwatch & Timer App

A DOM-driven stopwatch and countdown timer built with **JavaScript, HTML, and CSS**.  
This app supports multiple stopwatches and timers, smooth time updates, laps, reset, and a countdown with a "time’s up" cue.

---

## How to Run

1. Clone or download this repository.  
2. Open the project folder.  
3. Simply open `index.html` in your browser (double click or right-click → "Open with browser").  
4. No build step or external dependencies are required.  

---

## Core Features (MVP)

- **Add Stopwatch**  
  - Clicking the “Add Stopwatch” button inserts a new stopwatch card dynamically via JavaScript.
- **Controls per Card**  
  - **Start/Pause**: Toggles the running state and updates button text/style.  
  - **Lap**: Records and appends lap times under the stopwatch.  
  - **Reset**: Stops time, clears laps, resets display to `00:00.000`.  
- **Countdown (Timer mode)**  
  - User enters a start time (MM:SS format).  
  - Timer counts down to `00:00.000`.  
  - Stops automatically, changes card background, and shows a “TIME’S UP!” message.  
- **Time Display**  
  - Updates smoothly in real-time.  
  - Correctly formatted as `MM:SS.mmm`.  
- **DOM-driven UI**  
  - No page reloads required. All interactions handled via JavaScript.

---

## Items Attempted

- **Delete Stopwatch Card (with confirmation)**
-  **Timer Functionality** 
  - This was a hard part of the exercise.  
  - I had issues while trying to create the timer — it was challenging to make it function correctly, update smoothly, and stop exactly at `00:00.000`.  
  - Eventually, I was able to get the countdown working with proper input, auto-stop, and visual cues.  

---

## Known Issues / Limitations

- **Persistence**  
  - Stopwatches, timers, and laps are not saved after a page reload (no `localStorage` implemented yet).  
- **Rename & Reorder**  
  - Cards cannot be renamed or reordered (drag-and-drop not implemented).  
- **Keyboard Shortcuts**  
  - No support for keyboard-based controls (e.g., spacebar to pause).  
- **Lap Data**  
  - Fastest lap highlighting or average lap calculations are not included.  
---

## Future Improvements

- Persist stopwatch/timer state using `localStorage`.  
- Add inline title editing for each card.  
- Implement drag-and-drop reordering of cards.  
- Keyboard shortcuts for accessibility.   
