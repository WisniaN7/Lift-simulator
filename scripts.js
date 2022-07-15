class SidePanelManager {
    constructor() {
        this.floors = 4
        this.HTMLElement = document.querySelector('aside ol')
        this.scale = 1
        this.lift = new Lift()
        this.building = new Building(this.lift)

        this.addEventListeners()
    }

    addFloor() {
        this.floors++
        let floorButton = this.HTMLElement.querySelector('li.button').cloneNode(true)
        floorButton.innerHTML = this.floors - 1
        floorButton.addEventListener('mouseup', this.callLift.bind(this))

        this.HTMLElement.insertBefore(floorButton, document.getElementById('ground'))

        if (this.floors % 3 == 1) {
            let floorBreak = document.createElement('li')
            floorBreak.classList.add('break')
            this.HTMLElement.insertBefore(floorBreak, document.getElementById('ground'))
        }

        if (this.HTMLElement.offsetHeight * this.scale > window.innerHeight * .9) {
            this.scale -= 0.1
            this.HTMLElement.style.transform = 'scale(' + this.scale + ')'
        }
    }

    removeFloor() {
        if (this.floors > 2) {
            this.floors--
            let buttons = this.HTMLElement.querySelectorAll('li.button')
            buttons[buttons.length - 1].remove()

            if (this.floors % 3 == 0) {
                let breaks = this.HTMLElement.querySelectorAll('li.break')
                breaks[breaks.length - 1].remove()
            }

            if (this.HTMLElement.offsetHeight * this.scale < window.innerHeight * .9 && this.scale < 1) {
                this.scale += 0.1
                this.HTMLElement.style.transform = 'scale(' + this.scale + ')'
            }
        }
    }

    callLift(e) {
        let floor = e.srcElement.innerHTML == 'G' ? 0 : Number(e.srcElement.innerHTML)
        this.lift.enqueue(floor)
    }

    addEventListeners() {
        let buttons = this.HTMLElement.querySelectorAll('li.button, li#ground')
        buttons.forEach(button => { button.addEventListener('mouseup', this.callLift.bind(this)) })

        let addFloorBtn = this.HTMLElement.querySelector('li#addFloor')
        addFloorBtn.addEventListener('mouseup', this.addFloor.bind(this))
        addFloorBtn.addEventListener('mouseup', this.building.addFloor.bind(this.building))

        let removeFloorBtn = this.HTMLElement.querySelector('li#removeFloor')
        removeFloorBtn.addEventListener('mouseup', this.removeFloor.bind(this))
        removeFloorBtn.addEventListener('mouseup', this.building.removeFloor.bind(this.building))
    }
}

class Building {
    constructor(lift) {
        this.floors = 4
        this.HTMLElement = document.getElementById('building')
        this.scale = 1
        this.lift = lift

        let floors = this.HTMLElement.querySelectorAll('div.floor')

        floors.forEach(floor => { 
            let callBtns = floor.querySelectorAll('div.call span')
            callBtns.forEach(button => { button.addEventListener('mouseup', this.callLift.bind(this)) });
        })
    }

    addFloor() {
        this.floors++
        let floorCopy = this.HTMLElement.querySelectorAll('div.floor')[1].cloneNode(true)
        floorCopy.setAttribute('data-floor', this.floors - 1)
        let callBtns = floorCopy.querySelectorAll('div.call span')
        callBtns.forEach(button => { button.addEventListener('mouseup', this.callLift.bind(this)) });
        this.HTMLElement.appendChild(floorCopy)

        if (this.HTMLElement.offsetHeight * this.scale > window.innerHeight * .9) {
            this.scale -= 0.1
            this.HTMLElement.style.transform = 'scale(' + this.scale + ')'
        }
    }

    removeFloor() {
        if (this.floors > 2) {
            this.floors--
            let floors = this.HTMLElement.querySelectorAll('div.floor')
            floors[floors.length - 1].remove()

            if (this.HTMLElement.offsetHeight * this.scale < window.innerHeight * .9 && this.scale < 1) {
                this.scale += 0.1
                this.HTMLElement.style.transform = 'scale(' + this.scale + ')'
            }
        }
    }

    callLift(e) {
        const direction = e.srcElement.getAttribute('data-direction')
        const floor = Number(e.srcElement.parentElement.parentElement.getAttribute('data-floor'))
        this.lift.enqueue(floor, direction)
    }
}

class Lift {
    constructor() {
        this.HTMLElement = document.getElementById('lift')
        this.queue = new Array
        this.moving = 0
        this.currentFloor = 0
        this.position = 5

        let t = this
        setInterval(function () { t.updateLift() }, 10)
    }

    enqueue(targetFloor, direction = 'none') {
        if (targetFloor == this.currentFloor)
            return

        if (this.moving == 0) {
            this.queue.push(targetFloor)
            this.moving = 1
        } else if (this.moving == 1) {
            if (targetFloor > this.currentFloor && direction != 'down') {
                let i = 0
                while (targetFloor > this.queue[i]) i++
                this.queue.splice(i, 0, targetFloor)
            } else {
                this.queue.push(targetFloor)
            } 
        } else {
            if (targetFloor < this.currentFloor && direction != 'up') {
                let i = 0
                while (targetFloor < this.queue[i]) i++
                this.queue.splice(i, 0, targetFloor)
            } else {
                this.queue.push(targetFloor)
            } 
        }
    }

    updateLift() {
        if (this.moving == 1)
            this.position += 2
        else if (this.moving == -1) 
            this.position -= 2

        if (this.position % 110 == 5 && this.moving != 0) {
            if (this.moving == 1)      
                this.currentFloor++
            else
                this.currentFloor--

            if (this.currentFloor == this.queue[0]) {
                this.queue.pop()
                
                this.moving = 0
                let t = this

                setTimeout(function () { // Change to some sort of timer?
                    if (t.queue.length == 0)
                        return

                    if (t.queue[0] > t.currentFloor) 
                        t.moving = 1
                    else
                        t.moving = -1
                }, 5000)
            }

            if (this.queue.length == 0 && this.currentFloor != 0)
                this.queue.push(0)
        }

        this.HTMLElement.style.bottom = this.position + 'px'
    }
}

const sidePanel = new SidePanelManager()