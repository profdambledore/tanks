
// config
var config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  physics: {
    default: 'arcade',
    arcade: {
      debug: false,
      gravity: {
        y: 0
      } // Top down game, so no gravity
    }
  },
  scene: {
    preload: preload,
    create: create,
    update: update
  }
};
var game = new Phaser.Game(config);
var player;
var enemyTanks = [], maxEnemies = 4;
function preload() {
  this.load.atlas('tank', 'assets/tanks/tanks.png', 'assets/tanks/tanks.json');
  this.load.atlas('enemy', 'assets/tanks/enemy-tanks.png', 'assets/tanks/tanks.json');
  this.load.image('earth', 'assets/tanks/scorched_earth.png');
}

function create() {
  this.cameras.main.setBounds(0, 0, 1600, 1600);
  this.physics.world.setBounds(0, 0, 1600, 1600);
  this.add.tileSprite(800, 800, 1600, 1600, 'earth');
  player = new PlayerTank(this, 100, 100, 'tank', 'tank1');
  var enemyTank;
  for (var i = 0; i < maxEnemies; i++) {
	enemyTank = new EnemyTank(this, Math.random() * 800, Math.random() * 800, 'enemy', 'tank1', player);
	enemyTanks.push(enemyTank);
  }
}

function update(time, delta) {
	player.update();
	for (var i = 0; i < enemyTanks.length; i++){
		enemyTanks[i].update();
	}
}
