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
let maxBullets = 10;
let currentBullets = maxBullets;
let bulletText;
let gameOverText;
let gracePeriod;
let startTime; // Variable para almacenar el tiempo de inicio
let elapsedTime; // Variable para el tiempo transcurrido
let timeText; // Variable para mostrar el tiempo en pantalla

const game = new Phaser.Game(config);

function preload() {
    this.load.image('background', 'assets/background.jpg');
    this.load.image('sofia', 'assets/sofia.png');
    this.load.image('bullet', 'assets/knife.png');
    this.load.image('witch', 'assets/witch.png');
    this.load.image('potion', 'assets/potion.png');
    this.load.audio('backgroundMusic', 'assets/backgroundMusic.mp3');
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
    bulletText = this.add.text(16, 84, 'Shots: ' + currentBullets, { fontSize: '32px', fill: '#fff' });

    // Crear texto para mostrar el tiempo transcurrido
    timeText = this.add.text(16, 118, 'Time: 0.00', { fontSize: '32px', fill: '#fff' });

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

    // Inicializar el tiempo de inicio
    startTime = this.time.now;

    
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

    // Actualiza el tiempo transcurrido
    elapsedTime = (this.time.now - startTime) / 1000; // Convierte a segundos
    timeText.setText('Time: ' + elapsedTime.toFixed(2)); // Muestra el tiempo con dos decimales

    // Verifica si se ha acabado el juego
    if (health <= 0) {
        gameOver.call(this, 'Te quedaste sin vida');
    } else if (currentBullets <= 0 && this.time.now > gracePeriod) {
        gameOver.call(this, 'Te quedaste sin disparos');
    } else if (currentBullets <= 0 && gracePeriod === null) {
        gracePeriod = this.time.now + 5000; // 5 segundos de gracia
        bulletText.setText('Shots: 0 (Te quedaste sin disparos)');
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
            bulletText.setText('Shots: ' + currentBullets);
        }
    }
}

function spawnWitch() {
    let witch = witches.create(900, Phaser.Math.Between(50, 550), 'witch');
    witch.setVelocityX(-10);
    witchGroup.add(witch);

    this.time.addEvent({
        delay: 10,
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
    currentBullets = Math.min(maxBullets, currentBullets + 1);
    bulletText.setText('Bullets: ' + currentBullets);

    scoreText.setText('Score: ' + score);
    document.getElementById('ranking').innerText = 'Puntaje: ' + score;
}

function hitPlayer(player, potion) {
    potion.destroy();
    health -= 1;
    healthText.setText('Health: ' + health);

    // Verifica si se ha acabado el juego
    if (health <= 0) {
        elapsedTime = this.time.now - startTime;
        gameOver.call(this, 'Te quedaste sin vida');
    }
}

function gameOver(reason) {
    if (!gameOverText) {
        this.physics.pause(); // Detiene toda la física del juego
        player.setTint(0xff0000); // Cambia el color del jugador para indicar que perdió

        // Calcula el tiempo transcurrido en segundos
        const timeTaken = (elapsedTime).toFixed(2);

        // Crear un rectángulo semitransparente como fondo para el texto de Game Over
        const graphics = this.add.graphics();
        graphics.fillStyle(0x001111, 1); // Negro con 70% de transparencia

        // Parámetros originales
        const originalWidth = 500;
        const originalHeight = 250;
        const margin = 40; // Margen proporcional (puedes ajustar este valor)

        // Ajustar la posición y tamaño del rectángulo
        const newWidth = originalWidth + 2 * margin;
        const newHeight = originalHeight + 2 * margin;
        const x = (config.width / 2) - (newWidth / 2);
        const y = (config.height / 2) - (newHeight / 2);

        graphics.fillRect(x, y, newWidth, newHeight); // Rectángulo centrado con márgenes ajustados

        // Muestra el mensaje de Game Over, la razón y el tiempo transcurrido
        gameOverText = this.add.text(
            config.width / 2, // Centro horizontal de la pantalla
            config.height / 2, // Centro vertical de la pantalla
            'Game Over\n' + reason + '\nPuntaje: ' + score + '\nTiempo: ' + timeTaken + ' segundos', 
            { fontSize: '35px', fill: '#ff0000', align: 'center' }
        );
        gameOverText.setOrigin(0.5); // Centra el texto

        // Crear un formulario HTML para que el jugador ingrese su nombre
        let nameInput = document.createElement('input');
        nameInput.type = 'text';
        nameInput.placeholder = 'Ingresa tu nombre';
        nameInput.id = 'nameInput';
        document.body.appendChild(nameInput);
        nameInput.style.position = 'absolute';
        nameInput.style.left = '50%';
        nameInput.style.top = '118%';
        nameInput.style.transform = 'translateX(-50%)';

        // Crear un botón para enviar los datos
        let saveButton = document.createElement('button');
        saveButton.textContent = 'Guardar';
        saveButton.id = 'saveButton';
        document.body.appendChild(saveButton);
        saveButton.style.position = 'absolute';
        saveButton.style.left = '50%';
        saveButton.style.top = '121%';
        saveButton.style.transform = 'translateX(-50%)';

        // Manejar el clic en el botón de guardar
        saveButton.addEventListener('click', function() {
            let playerName = nameInput.value;
            if (playerName) {
                saveScore(playerName, score); // Función para guardar el nombre y puntaje en la base de datos
                alert('Puntaje guardado con éxito');
            }
        });
    }
}

function saveScore(name, score) {
    // Implementa la lógica para guardar el nombre y puntaje en la base de datos
}


function saveScore(name, score) {
    fetch('http://localhost:5000/api/scores', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ name: name, score: score })
    })
    .then(response => response.json())
    .then(data => console.log('Puntaje guardado:', data))
    .catch((error) => console.error('Error al guardar el puntaje:', error));
}
