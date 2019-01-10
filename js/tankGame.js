
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
var enemyTanks = [], maxEnemies = 4, bullets;
function preload() {
  this.load.atlas('tank', 'assets/tanks/tanks.png', 'assets/tanks/tanks.json');
  this.load.atlas('enemy', 'assets/tanks/enemy-tanks.png', 'assets/tanks/tanks.json');
  this.load.image('earth', 'assets/tanks/scorched_earth.png');
  this.load.image('bullet', 'assets/tanks/bullet.png');
  //this.load.spritesheet('explosion', 'asets/tanks/explosion.png');
}

function create() {
  this.cameras.main.setBounds(0, 0, 1600, 1600);
  this.physics.world.setBounds(0, 0, 800, 600);
  this.add.tileSprite(800, 800, 1600, 1600, 'earth');
  player = new PlayerTank(this, game.config.width * 0.5, game.config.height * 0.5, 'tank', 'tank1');
  var outerFrame = new Phaser.Geom.Rectangle(0, 0, game.config.width, game.config.height);
  var innerFrame = new Phaser.Geom.Rectangle(game.config.width * 0.25, game.config.height * 0.25, game.config.width * 0.5, game.config.height * 0.5);
  var enemyTank, loc;
  for (var i = 0; i < maxEnemies; i++) {
	loc = Phaser.Geom.Rectangle.RandomOutside(outerFrame, innerFrame);
	enemyTank = new EnemyTank(this, loc.x, loc.y, 'enemy', 'tank1', player);
	enemyTanks.push(enemyTank);
	this.physics.add.collider(player.hull, enemyTank.hull);
	if (i > 0) {
		for (var j = 0;		j < enemyTanks.length - 1; j++) {
			this.physics.add.collider(enemyTank.hull, enemyTanks[j].hull);
		}
	}
  }
  bullets = this.physics.add.group({
	defaultKey: 'bullet',
	maxSize: 1	
  });
  this.input.on('pointerdown', tryShoot, this);
  this.cameras.main.startFollow(player.hull, true, 0.5, 0.5);
}

function update(time, delta) {
	player.update();
	for (var i = 0; i < enemyTanks.length; i++){
		enemyTanks[i].update();
	}
}

function tryShoot(pointer) {
	var bullet = bullets.get(player.turret.x, player.turret.y);
	if (bullet) {
		fireBullet.call(this, bullet, player.turret.rotation, enemyTanks);
	}
}

function fireBullet(bullet, rotation, target) {
	bullet.enableBody(false);
	bullet.setActive(true);
	bullet.setVisible(true);
	bullet.rotation = rotation;
	this.physics.velocityFromRotation(bullet.rotation, 500, bullet.body.velocity);
	if (target === player) {
		
	} else {
		for (var i = 0; i < enemyTanks.length; i++) {
			this.physics.add.overlap(enemyTanks[i].hull, bullet, bulletHitEnemy, null, this);
	}
	
}

function bulletHitEnemy(hull, bullet){
	var enemy;
	var index;
	for (var i = 0; i < enemyTanks.length; i++) {
		if (enemyTanks[i].hull === hull) {
			enemy = enemyTanks[i];
			index = i;
			break;
		}
	}
	enemy.damage();
}
