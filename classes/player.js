// tutaj tworzymy klase naszej postaci
class Player {
    constructor(x, y, radius, color) {
        this.x = x
        this.y = y 
        this.radius = radius
        this.color = color
        this.velocity = {
            x:0,
            y:0
        }
        this.powerUp
    }
    draw() {
        c.beginPath()
        c.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false)
        c.fillStyle = this.color
        c.fill()
    }

    update() {
        this.draw()

        const playerFriction = 0.99

        this.velocity.x *= playerFriction
        this.velocity.y *= playerFriction
        // kolizja pozioma
        if(this.x + this.radius + this.velocity.x <= canvas.width && this.x - this.radius + this.velocity.x >= 0) {
            this.x += this.velocity.x 
        } else {
            this.velocity.x = 0
        }
        // kolizja pionowa
        if(this.y + this.radius + this.velocity.y <= canvas.height && this.y - this.radius + this.velocity.y >= 0) {
            this.y += this.velocity.y 
        } else {
            this.velocity.y = 0
        }
        
    }
}
