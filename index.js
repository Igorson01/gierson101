const canvas = document.querySelector('canvas')

const c = canvas.getContext('2d')

canvas.width = innerWidth
canvas.height = innerHeight


// stałe naszej postaci
const x = canvas.width / 2
const y = canvas.height / 2
const playerRadius = 30
const playerColor = 'red'


// const naszej postaci
const player = new Player(x, y , playerRadius, playerColor)

// magazyn na nasze wszystkie pociski
const projectiles = []



function animate() {
    requestAnimationFrame(animate)
    c.clearRect(0, 0, canvas.width, canvas.height)
    player.draw()
    projectiles.forEach(projectile => {
        projectile.update()
    })
}
// addeventlistener dzieki ktoremu po kliknieciu myszka na ekranie pojawia sie pocisk ktory zmierza wlasnie w wybranym kierunku
window.addEventListener('click', (event) => {
    
    const angle = Math.atan2(event.clientY - canvas.height / 2, event.clientX - canvas.width / 2)
    const velocity = {
        x: Math.cos(angle),
        y: Math.sin(angle)
    }
    projectiles.push(new Projectile(
    canvas.width / 2,
    canvas.height / 2,
    5,
  'blue',
   velocity
))
})

animate()