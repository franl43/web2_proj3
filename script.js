const canvas = document.getElementById('canvas')
const ctx = canvas.getContext('2d')
canvas.width = innerWidth;
canvas.height = innerHeight;

// klasa za stvaranje teksta
class Text {
    constructor({
        text = '',
        font = '24px Arial',
        textAlign = 'end',
        color = 'white',
        position = {x: 0, y: 0}
    }) {
        this.text = text
        this.font = font
        this.textAlign = textAlign
        this.color = color
        this.position = position
    }
    // funkcija za iscrtavanje teksta
    draw() {
        ctx.fillStyle = this.color
        ctx.font = this.font
        ctx.textAlign = this.textAlign
        ctx.fillStyle = this.color
        ctx.fillText(this.text, this.position.x, this.position.y)
    }
}

// klasa za stvaranje pravokutnika
class Rect {
    constructor({
        position = {x: 0, y: 0},
        width = 100,
        height = 100,
        vel = {dx: 0, dy: 0},
        speed = 12,
        color = 'red',
        shadow = {color: 'black', blur: 20}
    }) {
        this.position = position
        this.width = width
        this.height = height
        this.vel = vel
        this.speed = speed
        this.color = color
        this.shadow = shadow
    }
    // funkcija za iscrtavanje pravokutnika
    draw() {
        ctx.fillStyle = this.color
        ctx.shadowBlur = this.shadow.blur
        ctx.shadowColor = this.shadow.color
        ctx.fillRect(this.position.x, this.position.y, this.width, this.height)
    }
    // funkcija za pomicanje pravokutnika
    move() {
        this.position.x += this.vel.dx * this.speed
        this.position.y += this.vel.dy * this.speed
    }
}

// objekti za prikaz vremena
const bestText = new Text({position: {x: canvas.width -20, y: 25}})
const currentText = new Text({position: {x: canvas.width -20, y: 50}})
// objekt koji predstavlja pravokutnik
const spaceShip = new Rect({position: {x: (canvas.width - 100) / 2, y: (canvas.height - 100) / 2}, speed: 12})

// asteroids
let asteroids = []
const numOfAsteroids = 10
// funkcija koja stvara asteroide
function createAsteroids(numOfAsteroids = 10) {
    for(let i=0; i<numOfAsteroids; i++) {
        let size = randomInt(30)+70

        var position = {
            x: randomInt(canvas.width),
            y: randomInt(canvas.height)
        }

        if(position.x < canvas.width/2) {
            if(position.y < canvas.height/2) {
                position.x -= (Math.max(position.x, position.y) + size)
                position.y -= (Math.max(position.x, position.y) + size)
            } else {
                position.x -= (Math.max(position.x, canvas.height - position.y) + size)
                position.y += (Math.max(position.x, canvas.height - position.y))
            }
        } else {
            if(position.y < canvas.height/2) {
                position.x += (Math.max(canvas.width - position.x, position.y))
                position.y -= (Math.max(canvas.width - position.x, position.y) + size)
            } else {
                position.x += (Math.max(canvas.width - position.x, canvas.height - position.y))
                position.y += (Math.max(canvas.width - position.x, canvas.height - position.y))
            }
        }

        var vel = {
            dx: 0,
            dy: 0
        }
        if(position.x < canvas.width/2) {
            vel.dx = Math.abs(randomInt(3)-1.5)
        } else {
            vel.dx = -Math.abs(randomInt(3)-1.5)
        }
        if(position.y < canvas.height/2) {
            vel.dy = Math.abs(randomInt(3)-1.5)
        } else {
            vel.dy = -Math.abs(randomInt(3)-1.5)
        }
    
        var speed = randomInt(5) + 2
        asteroids.push(new Rect({position: position, width: size, height: size, vel: vel, speed: speed, color: randomColor()}))
    }
}
createAsteroids(numOfAsteroids)
setInterval(createAsteroids, 5000)

// game
let dxl = 0
let dxr = 0
let dyu = 0
let dyd = 0
let start = performance.now()
// funkcija u kojoj se iscrtavaju objekti, pomice svemirski brod i zaustavlja igra ako je doslo do sudara
function animate() {
    let best = localStorage.getItem('best')
    best = best != null ? best : 0
    let bestInner = 'Najbolje vrijeme: '+formatTime(best)
    let end = performance.now()
    let current = end - start
    let currentInner = 'Vrijeme: '+formatTime(current)
    ctx.clearRect(0, 0, canvas.width, canvas.height)

    spaceShip.draw()
    asteroids.forEach(a => {
        if(colision(a)) {
            if(best == null) {
                localStorage.setItem('best', current)
            } else {
                if(current > best) {
                    localStorage.setItem('best', current)
                }
            }
            document.location.reload()
        }
        a.draw()
    })
    
    bestText.text = bestInner
    bestText.draw()
    currentText.text = currentInner
    currentText.draw()

    spaceShip.position.x += dxl;
    spaceShip.position.x += dxr;
    spaceShip.position.y += dyu;
    spaceShip.position.y += dyd;

    asteroids.forEach(a => a.move())

    if(asteroids.length >= 100) {
        asteroids.splice(0, 50)
    }

    requestAnimationFrame(animate)
}
animate()

// funkcija za detekciju sudara
function colision(other) {
    return spaceShip.position.x + spaceShip.width > other.position.x &&
        other.position.x + other.width > spaceShip.position.x &&
        spaceShip.position.y + spaceShip.height > other.position.y &&
        other.position.y + other.height > spaceShip.position.y
}

// eventListener koji pritiskom tipke pomice svemirski brod u smjeru pritisnute tipke
addEventListener('keydown', (e) => {
    if(e.code == 'ArrowLeft') dxl = -spaceShip.speed;
    if(e.code == 'ArrowRight') dxr = spaceShip.speed;
    if(e.code == 'ArrowUp') dyu = -spaceShip.speed;
    if(e.code == 'ArrowDown') dyd = spaceShip.speed;
});
// eventListener koji otpustanjem tipke zaustavlja svemirski brod u smjeru pritisnute tipke
addEventListener('keyup', (e) => {
    if(e.code == 'ArrowLeft') dxl = 0;
    if(e.code == 'ArrowRight') dxr = 0;
    if(e.code == 'ArrowUp') dyu = 0;
    if(e.code == 'ArrowDown') dyd = 0;
});

// resize
// funkcija koja mijenja velicinu canvasa, pomice tekst i svemirski brod kada se dogodi resize
function resize() {
    canvas.width = innerWidth;
    canvas.height = innerHeight;
    spaceShip.position.x = (canvas.width - 100) / 2;
    spaceShip.position.y = (canvas.height - 100) / 2;
    bestText.position.x = canvas.width -20
    currentText.position.x = canvas.width -20
}

addEventListener('resize', (e) => {
    resize()
})

// utils
// funkcija za generiranje nasumicnog integera u rasponu 1 - max
function randomInt(max) {
    return Math.ceil(Math.random() * max)
}

// funkcija za generiranje nasumicne boje za asteroide
function randomColor() {
    let rand = randomInt(3)
    switch (rand) {
        case 1:
            return '#a6a6a6'
        case 2:
            return '#808080'
        case 3:
            return '#595959'
    }
}

// funkcija za formatiranje vremena
function formatTime(ms) {
    let seconds = ms / 1000
    ms = Math.round(ms % 1000)
    let minutes = Math.floor(seconds / 60)
    seconds = Math.floor(seconds % 60)
    return minutes.toString().padStart(2, '0')+':'+seconds.toString().padStart(2, '0')+'.'+ms.toString().padStart(3, '0')
}