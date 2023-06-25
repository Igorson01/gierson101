const canvas = document.querySelector('canvas')

const c = canvas.getContext('2d')

const scoreEl = document.querySelector('#scoreEl')
const modalEl = document.querySelector('#modalEl')
const startGameEl = document.querySelector('#startGameEl')
const modalScoreEl = document.querySelector('#modalScoreEl')
const startButtonEl = document.querySelector('#startButtonEl')
const buttonEl = document.querySelector('#buttonEl')

canvas.width = innerWidth
canvas.height = innerHeight

// stałe naszej postaci
const x = canvas.width / 2
const y = canvas.height / 2
const playerRadius = 15
const playerColor = 'white'


let player = new Player(x, y , playerRadius, playerColor)
let projectiles = []
let enemies = []
let particles = []
let animationId
let intervalId
let score = 0

function init() {
    player = new Player(x, y , playerRadius, playerColor)
    projectiles = []
    enemies = []
    particles = []
    animationId
    score = 0
    scoreEl.innerHTML = score

}

// dzieki funkcji spawnEnemies tworzymy przeciwników, przeciwnicy zostali stworzeni tak aby respili sie za canvasem co dwie sekundy
function spawnEnemies() {
    intervalId = setInterval(() => {
        const radius = Math.random() * (40 - 10) + 10
        let x 
        let y
        if(Math.random() < 0.5) {
         x = Math.random() < 0.5 ? 0 - radius : canvas.width + radius
         y = Math.random() * canvas.height
        } else {
         x = Math.random() * canvas.width
         y = Math.random() < 0.5 ? 0 - radius : canvas.height + radius
        }
        // dzieki hsl i math random dajemy naszym przeciwnikom wiele barw ktore są losowe
        const color = `hsl(${Math.random() * 360}, 50%, 50%)`
        const angle = Math.atan2( canvas.height / 2 - y, canvas.width / 2 -x)
        const velocity = {
            x: Math.cos(angle) * 2,
            y: Math.sin(angle) * 2
        }
     
        enemies.push(new Enemy(x,y,radius,color,velocity))
   }, 1000)
}

function animate() {
    animationId =  requestAnimationFrame(animate)
    c.fillStyle = 'rgba(0,0,0,0.1)'
    c.fillRect(0, 0, canvas.width, canvas.height)
    player.draw()
    for(let particlesIndex = particles.length - 1; particlesIndex >= 0; particlesIndex--) {
        const particle = particles[particlesIndex]
    
        if(particle.alpha <= 0) {
            particles.splice(particlesIndex,1)
        } else { 
        particle.update()
        }
    }
    for(let projectilesIndex = projectiles.length - 1; projectilesIndex >= 0; projectilesIndex--) {
        const projectile = projectiles[projectilesIndex]

        projectile.update()
        // usuwamy pociski z kranca ekranu
         if(projectile.x + projectile.radius < 0 ||
            projectile.x - projectile.radius > canvas.width || 
            projectile.y + projectile.radius < 0 || 
            projectile.y - projectile.radius > canvas.height) {
    
            projectiles.splice(projectilesIndex, 1)

            }
    }


    for(let index = enemies.length - 1; index >= 0; index--) {
        const enemy = enemies[index]
        enemy.update()

        const dist = Math.hypot(player.x - enemy.x, player.y - enemy.y)
        // dodajemy warunek przegrania gry, w tym wypadku jest to dotkniecie naszej postaci przez wroga
        if(dist - enemy.radius - player.radius < 1) {
            cancelAnimationFrame(animationId)
            clearInterval(intervalId)
            modalEl.style.display = 'block'
            gsap.fromTo('#modalEl', {
                scale:0.8,
                opacity:0,
            }, {
                scale:1,
                opacity: 1,
                ease: 'expo' 
            })
            modalScoreEl.innerHTML = score
        }
        
        for( let projectilesIndex = projectiles.length -1; projectilesIndex >= 0; projectilesIndex--) {
            const projectile = projectiles[projectilesIndex]
        
            const dist = Math.hypot(projectile.x - enemy.x, projectile.y - enemy.y)

           // kiedy pocisk dotyka przeciwnika
            if(dist - enemy.radius - projectile.radius < 1) {

                // tworzenie eksplozji 
                for (let i = 0; i < enemy.radius * 2; i++) {
                    particles.push(new Particle(
                        projectile.x , 
                        projectile.y, 
                        Math.random() * 2, 
                        enemy.color, 
                        {
                          x: (Math.random() - 0.5) * (Math.random() * 6), 
                          y: (Math.random() - 0.5) * (Math.random() * 6)
                        }))
                }
                // tutaj zmniejszamy przeciwnikow
                if(enemy.radius - 10 > 20) {
                    score += 69
                    scoreEl.innerHTML = score
                    gsap.to(enemy,  {
                        radius: enemy.radius - 10
                    })
                    
                        // dzieki splice usuwamy pociski z naszej mapy po zatakowaniu przeciwnika
                        projectiles.splice(projectilesIndex, 1)
                } else {
                // tutaj dodajemy punkty za zniszenie przeciwnika
                score += 420
                scoreEl.innerHTML = score

                
                    // a tutaj usuwamy przeciwnika i pocisk 
                    enemies.splice(index, 1)
                    projectiles.splice(projectilesIndex, 1)
              }
            }
        }
    }
}
// addeventlistener dzieki ktoremu po kliknieciu myszka na ekranie pojawia sie pocisk ktory zmierza wlasnie w wybranym kierunku
window.addEventListener('click', (event) => {
    const projectileRadius = 5
    const projectileColor = 'white'
    const angle = Math.atan2(
        event.clientY - player.y,
        event.clientX - player.x
    )
    const velocity = {
        x: Math.cos(angle) * 6,
        y: Math.sin(angle) * 6
    }
    projectiles.push(new Projectile(
        player.x,
        player.y,
        projectileRadius,
        projectileColor,
        velocity
    ))
})
// restart gry
buttonEl.addEventListener('click', () => {
    init()
    animate()
    spawnEnemies()
    gsap.to('#modalEl' , {
        opacity: 0,
        scale: 0.8,
        duration: 0.2,
        ease: 'expo.in',
        onComplete: () => {
            modalEl.style.display = 'none'
        }
    })
})
// start gry
startButtonEl.addEventListener('click', () => {
    init()
    animate()
    spawnEnemies()
    gsap.to('#startGameEl' , {
        opacity: 0,
        scale: 0.8,
        duration: 0.2,
        ease: 'expo.in',
        onComplete: () => {
            startGameEl.style.display = 'none'
        }
    })
})

