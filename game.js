// Configuración básica del juego
const config = {
    type: Phaser.AUTO,
    width: 800,
    height: 600,
    parent: 'gameContainer',
    physics: {
        default: 'arcade',
        arcade: {
            gravity: { y: 0 },
            debug: false
        }
    },
    scene: {
        preload: preload,
        create: create,
        update: update
    }
};

let player;
let cursors;
let bullets;
let bulletTime = 0;
let witches;
let score = 0;
let scoreText;
let witchGroup;

const game = new Phaser.Game(config);

function preload() {
    this.load.image('background', 'assets/background.png');
    this.load.image('sofia', 'assets/sofia.png');
    this.load.image('bullet', 'assets/bullet.png');
    this.load.image('witch', 'assets/witch.png');
    this.load.image('potion', 'assets/potion.png');
}

function create() {
    // Fondo del juego
    this.add.image(400, 300, 'background');

    // Crear jugador (Sofía)
    player = this.physics.add.sprite(100, 300, 'sofia');
    player.setCollideWorldBounds(true);

    // Crear grupo de balas
    bullets = this.physics.add.group({
        defaultKey: 'bullet',
        maxSize: 10
    });

    // Crear grupo de brujas
    witches = this.physics.add.group();

    // Crear un grupo de pociones que las brujas lanzan
    witchGroup = this.physics.add.group();

    // Control del teclado
    cursors = this.input.keyboard.createCursorKeys();
    this.input.keyboard.on('keydown-SPACE', shootBullet, this);

    // Crear puntuación
    scoreText = this.add.text(16, 16, 'Score: 0', { fontSize: '32px', fill: '#fff' });

    // Crear brujas periódicamente
    this.time.addEvent({
        delay: 2000,
        callback: spawnWitch,
        callbackScope: this,
        loop: true
    });

    // Colisiones
    this.physics.add.collider(bullets, witches, hitWitch, null, this);
    this.physics.add.collider(witchGroup, player, hitPlayer, null, this);
}

function update() {
    player.setVelocity(0);

    if (cursors.left.isDown) {
        player.setVelocityX(-160);
    } else if (cursors.right.isDown) {
        player.setVelocityX(160);
    }

    if (cursors.up.isDown) {
        player.setVelocityY(-160);
    } else if (cursors.down.isDown) {
        player.setVelocityY(160);
    }

    witches.children.iterate(function (witch) {
        if (witch.active && witch.x < 0) {
            witch.destroy();
        }
    });
}

function shootBullet() {
    if (this.time.now > bulletTime) {
        let bullet = bullets.get(player.x + 50, player.y);
        if (bullet) {
            bullet.setActive(true);
            bullet.setVisible(true);
            bullet.setVelocityX(400);
            bulletTime = this.time.now + 250;
        }
    }
}

function spawnWitch() {
    let witch = witches.create(800, Phaser.Math.Between(50, 550), 'witch');
    witch.setVelocityX(-100);
    witchGroup.add(witch);

    this.time.addEvent({
        delay: 1000,
        callback: function () {
            if (witch.active) {
                let potion = witchGroup.create(witch.x, witch.y, 'potion');
                potion.setVelocityX(-200);
            }
        },
        callbackScope: this,
        loop: false
    });
}

function hitWitch(bullet, witch) {
    bullet.destroy();
    witch.destroy();
    score += 10;
    scoreText.setText('Score: ' + score);
}

function hitPlayer(player, potion) {
    potion.destroy();
    this.physics.pause();
    player.setTint(0xff0000);
    this.add.text(300, 250, 'Game Over', { fontSize: '64px', fill: '#ff0000' });
}
