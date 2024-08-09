// Configuración básica del juego
const config = {
    type: Phaser.AUTO,
    width: 1000,
    height: 800,
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
let health = 3;
let healthText;
let maxBullets = 10; // Número máximo de disparos
let currentBullets = maxBullets; // Disparos actuales
let bulletText; // Texto para mostrar el número de disparos
let gameOverText; // Texto para mostrar el mensaje de Game Over
let gameOverReason = ''; // Razón del Game Over
let gracePeriod; // Temporizador para el período de gracia

const game = new Phaser.Game(config);

function preload() {
    this.load.image('background', 'assets/background.jpg');
    this.load.image('sofia', 'assets/sofia.png');
    this.load.image('bullet', 'assets/knife.png');
    this.load.image('witch', 'assets/witch.png');
    this.load.image('potion', 'assets/potion.png');
}

function create() {
    // Fondo del juego
    this.add.image(500, 400, 'background'); // Ajustado para centrar el fondo

    // Crear jugador (Sofía)
    player = this.physics.add.sprite(100, 300, 'sofia');
    player.setCollideWorldBounds(true);

    // Crear grupo de balas
    bullets = this.physics.add.group({
        defaultKey: 'bullet',
        maxSize: maxBullets
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

    // Crear indicador de salud
    healthText = this.add.text(16, 50, 'Health: 3', { fontSize: '32px', fill: '#fff' });

    // Crear indicador de balas
    bulletText = this.add.text(16, 84, 'Bullets: ' + currentBullets, { fontSize: '32px', fill: '#fff' });

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

    // Inicializar el temporizador de gracia
    gracePeriod = null;
}

function update() {
    if (gameOverText) {
        return; // Si ya hay un mensaje de Game Over, no actualices el juego
    }

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

    // Verifica si se ha acabado el juego
    if (health <= 0) {
        gameOver('te quedaste sin vida');
    } else if (currentBullets <= 0 && this.time.now > gracePeriod) {
        gameOver('te quedaste sin disparos');
    } else if (currentBullets === 0 && gracePeriod === null) {
        gracePeriod = this.time.now + 5000; // 5 segundos de gracia
        bulletText.setText('Bullets: 0 (Te quedaste sin disparos)'); // Indica al jugador que tiene 5 segundos
    }
}

function shootBullet() {
    if (this.time.now > bulletTime && currentBullets > 0) {
        let bullet = bullets.get(player.x + 50, player.y);
        if (bullet) {
            bullet.setActive(true);
            bullet.setVisible(true);
            bullet.setVelocityX(400);
            bulletTime = this.time.now + 250;
            currentBullets--;
            bulletText.setText('Bullets: ' + currentBullets); // Actualiza el texto de balas
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
    currentBullets = Math.min(maxBullets, currentBullets + 1); // Añade un disparo extra pero no supera el máximo
    bulletText.setText('Bullets: ' + currentBullets); // Actualiza el texto de balas
}

function hitPlayer(player, potion) {
    potion.destroy();
    health -= 1;
    healthText.setText('Health: ' + health);

    // Verifica si se ha acabado el juego
    if (health <= 0) {
        gameOver('te quedaste sin vida');
    }
}

function gameOver(reason) {
    if (!gameOverText) {
        this.physics.pause();
        player.setTint(0xff0000);

        // Muestra el mensaje de Game Over
        gameOverText = this.add.text(500, 400, 'Game Over\nPerdiste porque ' + reason, { fontSize: '64px', fill: '#ff0000', align: 'center' });
        gameOverText.setOrigin(0.5, 0.5);
    }
}
