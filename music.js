const audio = {
shootAudio: new Howl({
    src: './audio/Basic_shoot_noise.wav',
    volume: 0.05
}),
DamageTaken: new Howl({
    src: './audio/Damage_taken.wav',
    volume: 0.1
}),
 Death: new Howl({
    src: './audio/Death.wav',
    volume: 0.1
}),
 Explode:new Howl({
    src: './audio/Explode.wav',
    volume: 0.1
}),
PowerUpSound: new Howl({
    src: './audio/PowerUp_noise.wav',
    volume: 0.1
}),
Select: new Howl({
    src: './audio/Select.wav',
    volume: 0.1,
    html5: true
}),
backgroundMusic: new Howl({
    src: './audio/Hyper.wav',
    volume: 0.5,
    loop: true
})
}