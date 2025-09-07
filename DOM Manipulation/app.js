function addZeroPadding(num) {
    return num < 10 ? "0" + num : num
}
class StopwatchModel {
    constructor() {
        this.timeElapsed = 0
        this.intervalId = null
    }
 
 
    toHMS() {
        const hours = Math.floor(this.timeElapsed / 3600)
        const minutes = Math.floor((this.timeElapsed % 3600) / 60)
        const seconds = this.timeElapsed % 3600 % 60
        return `${addZeroPadding(hours)}:${addZeroPadding(minutes)}:${addZeroPadding(seconds)}`
    }
 
 
    start(intervalId) {
        if (this.intervalId) return
        this.intervalId = intervalId
    }
 
 
    pause() {
        if (this.intervalId) {
            clearInterval(this.intervalId)
            this.intervalId = null
        }
    }
 
 
    reset() {
        this.pause();
        this.timeElapsed = 0
    }

    delete(cardElement){
        this.pause();
        cardElement.remove();
    }

}
 
 
document.addEventListener("DOMContentLoaded", function () {
    const body = document.querySelector('body')

    //create title
    const title = document.createElement('h1')
    title.textContent = 'Stopwatch Application'
    body.appendChild(title)

   
    //add stop watch button
    const addButton = document.createElement('button')
    addButton.textContent = 'Add stop watch'
    addButton.id = "add-stopwatch"
    body.appendChild(addButton)


    // Container for all stopwatches
    const container = document.createElement('div')
    container.id = 'container'
    body.appendChild(container)

    function createStopwatch (){
        const stopwatch = new StopwatchModel()

        //stopwatch card
        const card = document.createElement('div')
        card.className = 'stopwatch-box'

        //create timer display
        const timerDisplay = document.createElement('time')
        timerDisplay.setAttribute('role', 'timer')
        timerDisplay.textContent = stopwatch.toHMS()
        card.appendChild(timerDisplay)

         //create start button
        const button = document.createElement('button')
        button.textContent = 'Start Timer'
        card.appendChild(button)

         //create reset button
        const restButton = document.createElement('button')
        restButton.textContent ='reset'
        card.appendChild(restButton)
        
        //delete button
        const deleteButton = document.createElement('button')
        deleteButton.textContent = 'Delete'
        card.appendChild(deleteButton)

        //Funcionalidad de los botones

        button.addEventListener('click', function () {
        if (stopwatch.intervalId) {
            stopwatch.pause()
            button.textContent = 'Start Timer'
        } else {
            stopwatch.start(setInterval(() => {
                stopwatch.timeElapsed++
                timerDisplay.textContent = stopwatch.toHMS()
            }, 1000))
            button.textContent = 'Pause Timer'
        }
    })

        restButton.addEventListener('click', function (){
            stopwatch.reset()
            timerDisplay.textContent = stopwatch.toHMS()
            button.textContent = 'start timer'
        })

        deleteButton.addEventListener('click', () =>{
            stopwatch.delete(card)
        })

        container.appendChild(card)
    }

    //add new stopwatch in button click
    addButton.addEventListener('click', createStopwatch)

    //create one by default
    createStopwatch()


  

 
 
}) 
// GOOD ENGINERRING TECHNIS USABILIY, RESPONSABILITY, WHAT WAS IMPLEMPETED, GOOD PRACTICES ON THE CODE