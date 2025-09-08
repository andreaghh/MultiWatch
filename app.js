// Utility function for zero padding
function addZeroPadding(num, length = 2) {
  return String(num).padStart(length, '0');
}

// Format ms -> "MM:SS.mmm"
function formatMs(ms) {
  const totalMs = Math.max(0, Math.floor(Math.abs(ms)));
  const minutes = Math.floor(totalMs / 60000);
  const seconds = Math.floor((totalMs % 60000) / 1000);
  const milliseconds = totalMs % 1000;
  return `${addZeroPadding(minutes)}:${addZeroPadding(seconds)}.${addZeroPadding(milliseconds, 3)}`;
}

class StopwatchModel {
  constructor() {
    this.timeElapsed = 0; // in milliseconds (elapsed for both modes)
    this.intervalId = null;
    this.startTime = null;
    this.laps = [];

    // Timer (countdown) state
    this.isCountdown = false;
    this.countdownStartTime = 0; // ms
    this.isFinished = false;

    // Callbacks
    this.onTimerFinished = null;
  }

  start() {
    if (this.intervalId) return;

    // If countdown but not configured, do nothing
    if (this.isCountdown && (!this.countdownStartTime || this.countdownStartTime <= 0)) return;

    // Keep continuity when pausing/resuming
    this.startTime = Date.now() - this.timeElapsed;
    this.isFinished = false;

    // 60fps-ish update loop
    this.intervalId = setInterval(() => {
      if (this.isCountdown) {
        const elapsed = Date.now() - this.startTime;
        const remaining = this.countdownStartTime - elapsed;

        if (remaining <= 0) {
          // Snap to finished state
          this.timeElapsed = this.countdownStartTime; 
          this.isFinished = true;
          clearInterval(this.intervalId);
          this.intervalId = null;
          if (typeof this.onTimerFinished === 'function') this.onTimerFinished();
          return;
        }

        // Store elapsed; display will compute remaining
        this.timeElapsed = elapsed;
      } else {
        // Stopwatch (count up)
        this.timeElapsed = Date.now() - this.startTime;
      }
    }, 16);
  }

  pause() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
  }

  reset() {
    this.pause();
    this.timeElapsed = 0;
    this.startTime = null;
    this.laps = [];
    this.isCountdown = false;
    this.countdownStartTime = 0;
    this.isFinished = false;
  }

  recordLap() {
    const lapTime = this.isCountdown
      ? Math.max(0, this.countdownStartTime - this.timeElapsed)
      : this.timeElapsed;

    this.laps.push(lapTime);
    return lapTime;
  }

  setCountdown(timeInMs) {
    // Reset and set countdown mode
    this.reset();
    this.isCountdown = true;
    this.countdownStartTime = Math.max(0, Math.floor(timeInMs));
    this.timeElapsed = 0;
    this.isFinished = false;
  }

  getCurrentDisplay() {
    if (this.isCountdown) {
      const remaining = Math.max(0, this.countdownStartTime - this.timeElapsed);
      return formatMs(remaining);
    }
    // Stopwatch (count up)
    return formatMs(this.timeElapsed);
  }

  finish() {
    this.pause();
    this.isFinished = true;
  }

  delete(cardElement) {
    this.pause();
    if (confirm('Are you sure you want to delete this card?')) {
      cardElement.remove();
    }
  }
}

document.addEventListener("DOMContentLoaded", function () {
  const addStopwatchBtn = document.getElementById('add-stopwatch');
  const addTimerBtn = document.getElementById('add-timer');
  const container = document.getElementById('container');

  function parseTimeInput(input) {
    // Input format: "MM:SS"
    const parts = input.split(':');
    if (parts.length !== 2) return null;

    const minutes = parseInt(parts[0], 10);
    const seconds = parseInt(parts[1], 10);

    if (isNaN(minutes) || isNaN(seconds) || minutes < 0 || seconds < 0 || seconds >= 60) {
      return null;
    }
    return (minutes * 60 + seconds) * 1000;
  }

  function createStopwatch() {
    const stopwatch = new StopwatchModel();

    // Card
    const card = document.createElement('div');
    card.className = 'stopwatch-box';

    // Display
    const timerDisplay = document.createElement('time');
    timerDisplay.className = 'time-display';
    timerDisplay.setAttribute('role', 'timer');
    timerDisplay.textContent = stopwatch.getCurrentDisplay();
    card.appendChild(timerDisplay);

    // Controls
    const controlsDiv = document.createElement('div');
    controlsDiv.className = 'controls';

    const startPauseBtn = document.createElement('button');
    startPauseBtn.className = 'start-pause';
    startPauseBtn.textContent = 'Start';

    const lapBtn = document.createElement('button');
    lapBtn.className = 'lap';
    lapBtn.textContent = 'Lap';

    const resetBtn = document.createElement('button');
    resetBtn.className = 'reset';
    resetBtn.textContent = 'Reset';

    const deleteBtn = document.createElement('button');
    deleteBtn.className = 'delete';
    deleteBtn.textContent = 'Delete';

    controlsDiv.appendChild(startPauseBtn);
    controlsDiv.appendChild(lapBtn);
    controlsDiv.appendChild(resetBtn);
    controlsDiv.appendChild(deleteBtn);
    card.appendChild(controlsDiv);

    // Laps
    const lapsList = document.createElement('ul');
    lapsList.className = 'laps';
    card.appendChild(lapsList);

    // Listeners
    startPauseBtn.addEventListener('click', function () {
      if (stopwatch.isFinished) return;

      if (stopwatch.intervalId) {
        stopwatch.pause();
        startPauseBtn.textContent = 'Start';
        startPauseBtn.classList.remove('pause');
      } else {
        stopwatch.start();
        startPauseBtn.textContent = 'Pause';
        startPauseBtn.classList.add('pause');
      }
    });

    lapBtn.addEventListener('click', function () {
      if (stopwatch.timeElapsed === 0 && !stopwatch.intervalId) return;
      const lapTime = stopwatch.recordLap();
      const li = document.createElement('li');
      li.textContent = `${stopwatch.laps.length}) ${formatMs(lapTime)}`;
      lapsList.appendChild(li);
      lapsList.scrollTop = lapsList.scrollHeight;
    });

    resetBtn.addEventListener('click', function () {
      stopwatch.reset();
      timerDisplay.textContent = stopwatch.getCurrentDisplay();
      startPauseBtn.textContent = 'Start';
      startPauseBtn.classList.remove('pause');
      lapsList.innerHTML = '';
      card.classList.remove('countdown-finished');
    });

    deleteBtn.addEventListener('click', () => stopwatch.delete(card));

    // Keep UI display in sync every ~16ms while running
    const originalStart = stopwatch.start.bind(stopwatch);
    stopwatch.start = function () {
      originalStart();
      const updateInterval = setInterval(() => {
        timerDisplay.textContent = this.getCurrentDisplay();
        if (!this.intervalId) {
          clearInterval(updateInterval);
        }
      }, 16);
    };

    container.appendChild(card);
  }

  function createTimer() {
    const stopwatch = new StopwatchModel();

    // Card
    const card = document.createElement('div');
    card.className = 'stopwatch-box';

    // Display
    const timerDisplay = document.createElement('time');
    timerDisplay.className = 'time-display';
    timerDisplay.setAttribute('role', 'timer');
    timerDisplay.textContent = stopwatch.getCurrentDisplay();
    card.appendChild(timerDisplay);

    // Controls
    const controlsDiv = document.createElement('div');
    controlsDiv.className = 'controls';

    const startPauseBtn = document.createElement('button');
    startPauseBtn.className = 'start-pause';
    startPauseBtn.textContent = 'Start';

    const resetBtn = document.createElement('button');
    resetBtn.className = 'reset';
    resetBtn.textContent = 'Reset';

    const deleteBtn = document.createElement('button');
    deleteBtn.className = 'delete';
    deleteBtn.textContent = 'Delete';

    controlsDiv.appendChild(startPauseBtn);
    controlsDiv.appendChild(resetBtn);
    controlsDiv.appendChild(deleteBtn);
    card.appendChild(controlsDiv);

    // Countdown UI
    const countdownDiv = document.createElement('div');
    countdownDiv.className = 'countdown-section';

    const countdownInput = document.createElement('input');
    countdownInput.className = 'countdown-input';
    countdownInput.placeholder = 'MM:SS';
    countdownInput.maxLength = 5;

    const setCountdownBtn = document.createElement('button');
    setCountdownBtn.className = 'set-countdown';
    setCountdownBtn.textContent = 'Set Countdown';

    countdownDiv.appendChild(countdownInput);
    countdownDiv.appendChild(setCountdownBtn);
    card.appendChild(countdownDiv);

    // Time's up message
    const timeUpMsg = document.createElement('div');
    timeUpMsg.className = 'time-up-message';
    timeUpMsg.textContent = 'TIME\'S UP!';
    card.appendChild(timeUpMsg);

    // Finish callback
    stopwatch.onTimerFinished = function () {
      startPauseBtn.textContent = 'Start';
      startPauseBtn.classList.remove('pause');
      card.classList.add('countdown-finished');
      // Ensure display shows 00:00.000
      timerDisplay.textContent = stopwatch.getCurrentDisplay();
    };

    // Listeners
    startPauseBtn.addEventListener('click', function () {
      if (stopwatch.isFinished) {
        stopwatch.isFinished = false;
        card.classList.remove('countdown-finished');
      }

      if (stopwatch.intervalId) {
        stopwatch.pause();
        startPauseBtn.textContent = 'Start';
        startPauseBtn.classList.remove('pause');
      } else {
        // Prevent starting if no countdown is set
        if (!stopwatch.isCountdown || !stopwatch.countdownStartTime || stopwatch.countdownStartTime <= 0) {
          alert('Please enter a countdown time before starting the timer.');
          return;
        }
        stopwatch.start();
        startPauseBtn.textContent = 'Pause';
        startPauseBtn.classList.add('pause');
      }
    });

    resetBtn.addEventListener('click', function () {
      stopwatch.reset();
      timerDisplay.textContent = stopwatch.getCurrentDisplay();
      startPauseBtn.textContent = 'Start';
      startPauseBtn.classList.remove('pause');
      card.classList.remove('countdown-finished');
    });

    deleteBtn.addEventListener('click', () => stopwatch.delete(card));

    setCountdownBtn.addEventListener('click', function () {
      let input = countdownInput.value.trim();

      // Accept MMSS or MM:SS
      if (/^\d{3,4}$/.test(input)) {
        input = input.length === 3 ? '0' + input : input;
        input = input.substring(0, 2) + ':' + input.substring(2);
      }

      if (!input || !/^\d{2}:\d{2}$/.test(input)) {
        alert('Please enter time in MM:SS format (e.g., 02:30)');
        return;
      }

      const timeMs = parseTimeInput(input);
      if (timeMs === null) {
        alert('Please enter time in MM:SS format (e.g., 02:30)');
        return;
      }

      stopwatch.setCountdown(timeMs);
      stopwatch.isFinished = false;

      // Force display to show the new countdown value immediately
      timerDisplay.textContent = stopwatch.getCurrentDisplay();

      startPauseBtn.textContent = 'Start';
      startPauseBtn.classList.remove('pause');
      card.classList.remove('countdown-finished');
      countdownInput.value = '';
    });

    countdownInput.addEventListener('input', function (e) {
      // Let user type digits and auto-format to MM:SS
      let value = e.target.value.replace(/[^\d]/g, '');
      if (value.length > 0) {
        if (value.length <= 2) {
          // "M", "MM"
        } else if (value.length <= 4) {
          value = value.substring(0, 2) + ':' + value.substring(2);
        } else {
          value = value.substring(0, 4); // cap to 4 digits
          value = value.substring(0, 2) + ':' + value.substring(2);
        }
      }
      e.target.value = value;
    });

    // Keep UI display in sync every ~16ms while running
    const originalStart = stopwatch.start.bind(stopwatch);
    stopwatch.start = function () {
      originalStart();
      const updateInterval = setInterval(() => {
        timerDisplay.textContent = this.getCurrentDisplay();
        if (!this.intervalId) {
          clearInterval(updateInterval);
        }
      }, 16);
    };

    container.appendChild(card);
  }

  // Add new stopwatch or timer on button click
  addStopwatchBtn.addEventListener('click', createStopwatch);
  addTimerBtn.addEventListener('click', createTimer);

  // Create one stopwatch by default
  createStopwatch();
});
