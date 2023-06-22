const canvas = document.querySelector('canvas')

const c = canvas.getContext('2d')

canvas.width = innerWidth
canvas.height = innerHeight

// stałe naszej postaci
const x = canvas.width / 2
const y = canvas.height / 2
const playerRadius = 15
const playerColor = 'white'


// const naszej postaci
const player = new Player(x, y , playerRadius, playerColor)

// magazyn na nasze wszystkie pociski
const projectiles = []

const enemys = []

const particles = []

function spawnEnemy() {
    setInterval(() => {
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
        const color = `hsl(${Math.random() * 360}, 50%, 50%)`
        const angle = Math.atan2( canvas.height / 2 - y, canvas.width / 2 -x)
        const velocity = {
            x: Math.cos(angle) * 2,
            y: Math.sin(angle) * 2
        }
     
        enemys.push(new Enemy(x,y,radius,color,velocity))
   }, 2000)
}
let animationId
function animate() {
    animationId =  requestAnimationFrame(animate)
    c.fillStyle = 'rgba(0,0,0,0.1)'
    c.fillRect(0, 0, canvas.width, canvas.height)
    player.draw()
    particles.forEach((particle,index) => {
        if(particle.alpha <= 0) {
            particles.splice(index,1)
        } else { 
        particle.update()
        }
    })
    projectiles.forEach((projectile, projectileIndex) => {
        projectile.update()
        // usuwamy pociski z kranca ekranu
         if(projectile.x + projectile.radius < 0 ||
            projectile.x - projectile.radius > canvas.width || 
            projectile.y + projectile.radius < 0 || 
            projectile.y - projectile.radius > canvas.height) {
            setTimeout(() => {
                projectiles.splice(projectileIndex, 1)
            },0)
            }
    })
    enemys.forEach((enemy, index) => {
        enemy.update()
        const dist = Math.hypot(player.x - enemy.x, player.y - enemy.y)
        if(dist - enemy.radius - player.radius < 1) {
            cancelAnimationFrame(animationId)
        }
        
        projectiles.forEach((projectile, projectileIndex) => {
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
                
                if(enemy.radius - 10 > 20) {
                    gsap.to(enemy,  {
                        radius: enemy.radius - 10
                    })
                    setTimeout(() => {
                        
                        projectiles.splice(projectileIndex, 1)
                    },0)
                } else {
                setTimeout(() => {
                    enemys.splice(index, 1)
                    projectiles.splice(projectileIndex, 1)
                },0)
              }
            }
        })
    })
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
animate()
spawnEnemy()
