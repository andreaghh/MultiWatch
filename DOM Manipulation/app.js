// Utility function for zero padding
function addZeroPadding(num, length = 2) {
    return String(num).padStart(length, '0');
}

class StopwatchModel {
    constructor() {
        this.timeElapsed = 0; // in milliseconds
        this.intervalId = null;
        this.startTime = null;
        this.laps = [];
        this.isCountdown = false;
        this.countdownStartTime = 0;
        this.isFinished = false;
    }

    // Format time to MM:SS.mmm as required
    toMMSSmmm(ms = this.timeElapsed) {
        const totalMs = Math.abs(ms);
        const minutes = Math.floor(totalMs / 60000);
        const seconds = Math.floor((totalMs % 60000) / 1000);
        const milliseconds = totalMs % 1000;
        
        return `${addZeroPadding(minutes)}:${addZeroPadding(seconds)}.${addZeroPadding(milliseconds, 3)}`;
    }

    start() {
        if (this.intervalId) return;
        
        this.startTime = Date.now() - this.timeElapsed;
        this.intervalId = setInterval(() => {
            if (this.isCountdown) {
                const remaining = this.countdownStartTime - (Date.now() - this.startTime);
                if (remaining <= 0) {
                    this.timeElapsed = this.countdownStartTime;
                    this.finish();
                    return;
                }
                this.timeElapsed = Date.now() - this.startTime;
            } else {
                this.timeElapsed = Date.now() - this.startTime;
            }
        }, 16); // ~60fps for smooth updates
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
        let lapTime;
        if (this.isCountdown) {
            lapTime = this.countdownStartTime - this.timeElapsed;
        } else {
            lapTime = this.timeElapsed;
        }
        this.laps.push(lapTime);
        return lapTime;
    }

    setCountdown(timeInMs) {
        this.reset();
        this.isCountdown = true;
        this.countdownStartTime = timeInMs;
        this.timeElapsed = 0;
    }

    getCurrentDisplay() {
        if (this.isCountdown && !this.isFinished) {
            const remaining = this.countdownStartTime - this.timeElapsed;
            return this.toMMSSmmm(Math.max(0, remaining));
        }
        if (this.isCountdown && this.isFinished) {
            return "00:00.000";
        }
        return this.toMMSSmmm();
    }

    finish() {
        this.pause();
        this.isFinished = true;
    }

    delete(cardElement) {
        this.pause();
        if (confirm('Are you sure you want to delete this stopwatch?')) {
            cardElement.remove();
        }
    }
}

document.addEventListener("DOMContentLoaded", function () {
    const body = document.querySelector('body');
    const addButton = document.getElementById('add-stopwatch');
    const container = document.getElementById('container');

    function parseTimeInput(input) {
        const parts = input.split(':');
        if (parts.length !== 2) return null;
        
        const minutes = parseInt(parts[0]);
        const seconds = parseInt(parts[1]);
        
        if (isNaN(minutes) || isNaN(seconds) || minutes < 0 || seconds < 0 || seconds >= 60) {
            return null;
        }
        
        return (minutes * 60 + seconds) * 1000;
    }

    function createStopwatch() {
        const stopwatch = new StopwatchModel();

        // Stopwatch card
        const card = document.createElement('div');
        card.className = 'stopwatch-box';

        // Create timer display
        const timerDisplay = document.createElement('time');
        timerDisplay.className = 'time-display';
        timerDisplay.setAttribute('role', 'timer');
        timerDisplay.textContent = stopwatch.getCurrentDisplay();
        card.appendChild(timerDisplay);

        // Control buttons
        const controlsDiv = document.createElement('div');
        controlsDiv.className = 'controls';

        // Start/Pause button
        const startPauseBtn = document.createElement('button');
        startPauseBtn.className = 'start-pause';
        startPauseBtn.textContent = 'Start';
        controlsDiv.appendChild(startPauseBtn);

        // Lap button
        const lapBtn = document.createElement('button');
        lapBtn.className = 'lap';
        lapBtn.textContent = 'Lap';
        controlsDiv.appendChild(lapBtn);

        // Reset button
        const resetBtn = document.createElement('button');
        resetBtn.className = 'reset';
        resetBtn.textContent = 'Reset';
        controlsDiv.appendChild(resetBtn);

        // Delete button
        const deleteBtn = document.createElement('button');
        deleteBtn.className = 'delete';
        deleteBtn.textContent = 'Delete';
        controlsDiv.appendChild(deleteBtn);

        card.appendChild(controlsDiv);

        // Countdown section
        const countdownDiv = document.createElement('div');
        countdownDiv.className = 'countdown-section';

        const countdownInput = document.createElement('input');
        countdownInput.className = 'countdown-input';
        countdownInput.placeholder = 'MM:SS';
        countdownInput.maxLength = 5;
        countdownDiv.appendChild(countdownInput);

        const setCountdownBtn = document.createElement('button');
        setCountdownBtn.className = 'set-countdown';
        setCountdownBtn.textContent = 'Set Countdown';
        countdownDiv.appendChild(setCountdownBtn);

        card.appendChild(countdownDiv);

        // Time's up message
        const timeUpMsg = document.createElement('div');
        timeUpMsg.className = 'time-up-message';
        timeUpMsg.textContent = '⏰ TIME\'S UP!';
        card.appendChild(timeUpMsg);

        // Laps list
        const lapsList = document.createElement('ul');
        lapsList.className = 'laps';
        card.appendChild(lapsList);

        // Event listeners
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
            const lapItem = document.createElement('li');
            lapItem.textContent = `${stopwatch.laps.length}) ${stopwatch.toMMSSmmm(lapTime)}`;
            lapsList.appendChild(lapItem);
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

        deleteBtn.addEventListener('click', () => {
            stopwatch.delete(card);
        });

        setCountdownBtn.addEventListener('click', function () {
            const input = countdownInput.value.trim();
            if (!input) return;

            // Confirm if laps should be kept before setting countdown
            let keepLaps = true;
            if (stopwatch.laps.length > 0) {
                keepLaps = confirm('Do you want to keep the laps?\nIf you choose Cancel, laps will be removed.');
            }

            const timeMs = parseTimeInput(input);
            if (timeMs === null) {
                alert('Please enter time in MM:SS format (e.g., 02:30)');
                return;
            }

            stopwatch.setCountdown(timeMs);
            timerDisplay.textContent = stopwatch.getCurrentDisplay();
            startPauseBtn.textContent = 'Start';
            startPauseBtn.classList.remove('pause');
            if (!keepLaps) {
                lapsList.innerHTML = '';
            } else {
                // If keeping laps, restore them visually
                lapsList.innerHTML = '';
                stopwatch.laps.forEach((lapTime, idx) => {
                    const lapItem = document.createElement('li');
                    lapItem.textContent = `${idx + 1}) ${stopwatch.toMMSSmmm(lapTime)}`;
                    lapsList.appendChild(lapItem);
                });
            }
            card.classList.remove('countdown-finished');
            countdownInput.value = '';
        });

        // Format countdown input as user types
        countdownInput.addEventListener('input', function (e) {
            let value = e.target.value.replace(/[^\d]/g, '');
            if (value.length > 0) {
                if (value.length <= 2) {
                    value = value;
                } else if (value.length <= 4) {
                    value = value.substring(0, 2) + ':' + value.substring(2);
                }
            }
            e.target.value = value;
        });

        // Update display during timer
        const originalStart = stopwatch.start;
        stopwatch.start = function() {
            originalStart.call(this);
            
            const updateInterval = setInterval(() => {
                if (!this.intervalId) {
                    clearInterval(updateInterval);
                    return;
                }
                
                timerDisplay.textContent = this.getCurrentDisplay();
                
                if (this.isCountdown && this.isFinished) {
                    card.classList.add('countdown-finished');
                    startPauseBtn.textContent = 'Start';
                    startPauseBtn.classList.remove('pause');
                    clearInterval(updateInterval);
                    
                    // Flash effect
                    let flashes = 0;
                    const flashInterval = setInterval(() => {
                        card.style.transform = flashes % 2 === 0 ? 'scale(1.02)' : 'scale(1)';
                        flashes++;
                        if (flashes > 6) {
                            clearInterval(flashInterval);
                            card.style.transform = '';
                        }
                    }, 200);
                }
            }, 16);
        };

        container.appendChild(card);
    }

    // Add new stopwatch on button click
    addButton.addEventListener('click', createStopwatch);

    // Create one stopwatch by default
    createStopwatch();
});