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

const game = new Phaser.Game(config);

let player;
let cursors;
let witches;
let potions;
let score = 0;
let scoreText;
let lastFired = 0;

function preload() {
    this.load.image('background', 'assets/background.png');
    this.load.image('player', 'assets/player.png'); // Image for Sofia
    this.load.image('witch', 'assets/witch.png'); // Image for witches
    this.load.image('potion', 'assets/potion.png'); // Image for potions
}

function create() {
    this.add.image(400, 300, 'background');

    player = this.physics.add.sprite(100, 300, 'player').setScale(0.5);
    player.setCollideWorldBounds(true);

    cursors = this.input.keyboard.createCursorKeys();

    witches = this.physics.add.group({
        key: 'witch',
        repeat: 5,
        setXY: { x: 400, y: 100, stepX: 100, stepY: 50 }
    });

    witches.children.iterate(function (child) {
        child.setCollideWorldBounds(true);
        child.setBounce(1);
        child.setVelocity(Phaser.Math.Between(-200, 200), 20);
    });

    potions = this.physics.add.group();

    this.physics.add.collider(player, witches, hitWitch, null, this);
    this.physics.add.overlap(potions, witches, destroyWitch, null, this);

    scoreText = this.add.text(16, 16, 'Score: 0', { fontSize: '32px', fill: '#000' });
}

function update(time) {
    if (cursors.left.isDown) {
        player.setVelocityX(-160);
    } else if (cursors.right.isDown) {
        player.setVelocityX(160);
    } else {
        player.setVelocityX(0);
    }

    if (cursors.up.isDown) {
        player.setVelocityY(-160);
    } else if (cursors.down.isDown) {
        player.setVelocityY(160);
    } else {
        player.setVelocityY(0);
    }

    if (cursors.space.isDown && time > lastFired) {
        let potion = potions.create(player.x, player.y, 'potion');
        potion.setVelocityX(300);
        lastFired = time + 500;
    }
}

function hitWitch(player, witch) {
    this.physics.pause();
    player.setTint(0xff0000);
    player.anims.play('turn');
    gameOver = true;
}

function destroyWitch(potion, witch) {
    potion.destroy();
    witch.destroy();
    score += 10;
    scoreText.setText('Score: ' + score);
}
