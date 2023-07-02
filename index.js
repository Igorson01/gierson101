const canvas = document.querySelector('canvas')

const c = canvas.getContext('2d')

const scoreEl = document.querySelector('#scoreEl')
const modalEl = document.querySelector('#modalEl')
const startGameEl = document.querySelector('#startGameEl')
const modalScoreEl = document.querySelector('#modalScoreEl')
const startButtonEl = document.querySelector('#startButtonEl')
const buttonEl = document.querySelector('#buttonEl')

canvas.width = innerWidth - 1
canvas.height = innerHeight - 1

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
let powerUps = []
let frames = 0
let backgroundParticles = []
let game = {
    active: false
}


function init() {
    player = new Player(x, y , playerRadius, playerColor)
    projectiles = []
    enemies = []
    particles = []
    powerUps = []
    animationId
    score = 0
    scoreEl.innerHTML = score
    frames = 0
    backgroundParticles = []
    game = {
        active: true
    }

    const spacing = 30

    for(let x = 0; x < canvas.width + spacing; x+=spacing) {
        for(let y = 0; y < canvas.height + spacing; y+=spacing) { 
        backgroundParticles.push(
            new BackgroundParticle({
            position:{
                x,
                y
            },
            radius: 3
        }))
    }
    }

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

function spawnPowerUps() {
    spawnPowerUpsId = setInterval(() => {
        powerUps.push(new PowerUp({
            position: {
                x:-30,
                y:Math.random() * canvas.height
            },
            velocity: {
                x:Math.random() + 3,
                y:0
            }
        }))
    }, 15000)
}
function createScoreLabel({position, score}) {
    const scoreLabel = document.createElement('label')
    scoreLabel.innerHTML = score
    scoreLabel.style.color = 'white'
    scoreLabel.style.position = 'absolute'
    scoreLabel.style.left = position.x + 'px'
    scoreLabel.style.top = position.y + 'px'
    scoreLabel.style.userSelect = 'none'
    document.body.appendChild(scoreLabel)

    gsap.to(scoreLabel, {
        opacity:0,
        y: -30,
        duration: 1,
        onComplete:() => {
            scoreLabel.parentNode.removeChild(scoreLabel)
        }
    })
}

function animate() {
    animationId =  requestAnimationFrame(animate)
    c.fillStyle = 'rgba(0,0,0,0.1)'
    c.fillRect(0, 0, canvas.width, canvas.height)
    frames++

    backgroundParticles.forEach((backgroundParticle) =>{
        backgroundParticle.draw()
        
        const dist = Math.hypot(player.x - backgroundParticle.position.x, player.y - backgroundParticle.position.y)

        if(dist < 100) {
            backgroundParticle.alpha = 0

            if ( dist > 70) {
                backgroundParticle.alpha = 0.5
                
            }
        } else if(dist > 100 && backgroundParticle.alpha < 0.1) {
            backgroundParticle.alpha += 0.01
        } else if(dist > 100 && backgroundParticle.alpha > 0.1) {
            backgroundParticle.alpha -= 0.01
        }
    })

    player.update()
    for (let i = powerUps.length -1; i>=0; i--) {
        const powerUp = powerUps[i]

        // usuwamy powerupy ktore sa poza naszym ekranem 
        if(powerUp.position.x > canvas.width) {
            powerUps.splice(i, 1)
        } else powerUp.update()

        powerUp.update()
        const dist = Math.hypot(player.x - powerUp.position.x, player.y - powerUp.position.y)
        if(dist < powerUp.image.height / 2 + player.radius) {
            PowerUpSound.play()
            powerUps.splice(i,1)
            player.powerUp = 'MachineGun'
            player.color = 'yellow'
            setTimeout(() => {
                player.powerUp = null
                player.color = 'white'
            }, 5000)
        }
    }
    // machine gun animation
    if(player.powerUp === 'MachineGun') {
        const radius = 5
        const color = 'yellow'
        const angle = Math.atan2(
            mouse.position.y - player.y,
            mouse.position.x - player.x
        )
        const velocity = {
            x: Math.cos(angle) * 6,
            y: Math.sin(angle) * 6
        }
        if(frames % 2 === 0) { 
        projectiles.push( new Projectile(player.x, player.y, radius, color, velocity))
        } if(frames % 8 === 0) {
            shootAudio.play()
        }

    }
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
            Death.play()
            cancelAnimationFrame(animationId)
            clearInterval(intervalId)
            game.active = false
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
                        createScoreLabel({position: {
                            x:projectile.x,
                            y:projectile.y
                        },
                        score : 69
                    })
                        DamageTaken.play()
                        projectiles.splice(projectilesIndex, 1)
                } else {
                // a tutaj usuwamy przeciwnika i pocisk 
                //dodajemy punkty za zniszenie przeciwnika
                score += 420
                scoreEl.innerHTML = score
                createScoreLabel({position :{
                    x: projectile.x,
                    y: projectile.y
                },
                score : 420
            })

                    //zmieniamy kolor tla 
                    backgroundParticles.forEach(backgroundParticle => {
                        gsap.set(backgroundParticle, {
                            color: 'white',
                            alpha: 0.2
                        })
                        gsap.to(backgroundParticle, {
                            color: enemy.color,
                            alpha: 0.1
                        })
                    })
                    Explode.play()
                    enemies.splice(index, 1)
                    projectiles.splice(projectilesIndex, 1)
              }
            }
        }
    }
}
// addeventlistener dzieki ktoremu po kliknieciu myszka na ekranie pojawia sie pocisk ktory zmierza wlasnie w wybranym kierunku
window.addEventListener('click', (event) => {
   if(!backgroundMusic.playing()) {
    backgroundMusic.play()
   }
    if(game.active) {
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
    shootAudio.play()
    }
})
const mouse = {
    position:{
        x:0,
        y:0
    }
}
addEventListener('mousemove', (event) => {
    mouse.position.x = event.clientX
    mouse.position.y = event.clientY
})
// restart gry
buttonEl.addEventListener('click', () => {
    Select.play()
    init()
    animate()
    spawnEnemies()
    spawnPowerUps()
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
    Select.play()
    init()
    animate()
    spawnEnemies()
    spawnPowerUps()
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

window.addEventListener('keydown', () => {
    const playerSpeed = 1.5
    switch(event.key) {
        case 'd':
        player.velocity.x += playerSpeed
        break
        case 'a':
        
        player.velocity.x -= playerSpeed
        break
        case 'w':
       
        player.velocity.y -= playerSpeed
        break
        case 's':
        
        player.velocity.y += playerSpeed
        break
    }
})




