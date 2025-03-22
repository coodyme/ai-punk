const sounds = {
    jump: new Audio('assets/audio/jump.mp3'),
    attack: new Audio('assets/audio/attack.mp3'),
    hit: new Audio('assets/audio/hit.mp3'),
    levelUp: new Audio('assets/audio/levelUp.mp3'),
    backgroundMusic: new Audio('assets/audio/background.mp3'),
};

sounds.backgroundMusic.loop = true;

function playSound(sound) {
    if (sounds[sound]) {
        sounds[sound].currentTime = 0; // Reset sound to start
        sounds[sound].play();
    }
}

function stopSound(sound) {
    if (sounds[sound]) {
        sounds[sound].pause();
    }
}

export { sounds, playSound, stopSound };