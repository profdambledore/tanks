
// config
var config = {
  type: Phaser.AUTO,
  width: 800,
  height: 800,
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
var enemyTanks = [], maxEnemies = 4, bullets, enemyBullets = 1;
function preload() {
  this.load.atlas('tank', 'assets/tanks/tanks.png', 'assets/tanks/tanks.json');
  this.load.atlas('enemy', 'assets/tanks/enemy-tanks.png', 'assets/tanks/tanks.json');
  this.load.image('earth', 'assets/tanks/scorched_earth.png');
  this.load.image('bullet', 'assets/tanks/bullet.png');
  this.load.image('landscape', 'assets/tanks/landscape-tileset.png');
  this.load.tilemapTiledJSON('level1', 'assets/tanks/landscape.json', )
  //this.load.spritesheet('explosion', 'asets/tanks/explosion.png');
}

function create() {
  this.cameras.main.setBounds(0, 0, 1600, 1600);
  this.physics.world.setBounds(0, 0, 1600, 1600);
  this.physics.world.on('worldbounds', function(body){
	killBullet(body.gameObject);
  }, this);
  
  this.map = this.make.tilemap({key: 'level1' });
  var landscape = this.map.addTilesetImage('landscape-tileset','landscape');
  this.map.createStaticLayer('ground', landscape, 0, 0);
  var destructLayer = this.map.createDynamicLayer('destroyable_walls', landscape, 0, 0);
  destructLayer.setCollisionByProperty({collide: true});
  var wallsLayer = this.map.createDynamicLayer('walls', landscape, 0, 0);
  wallsLayer.setCollisionByProperty({collide: true});
  
  player = new PlayerTank(this, game.config.width * 0.5, game.config.height * 0.5, 'tank', 'tank1');
  player.enableCollision(destructLayer, wallsLayer);
  var outerFrame = new Phaser.Geom.Rectangle(0, 0, game.config.width, game.config.height);
  var innerFrame = new Phaser.Geom.Rectangle(game.config.width * 0.25, game.config.height * 0.25, game.config.width * 0.5, game.config.height * 0.5);
  enemyBullets = this.physics.add.group({
	defaultKey: 'bullet',
	maxSize: 10
  })
  var enemyTank, loc;
  for (var i = 0; i < maxEnemies; i++) {
	loc = Phaser.Geom.Rectangle.RandomOutside(outerFrame, innerFrame);
	enemyTank = new EnemyTank(this, loc.x, loc.y, 'enemy', 'tank1', player);
	enemyTank.enableCollision(destructLayer, wallsLayer);
	enemyTank.setBullets(enemyBullets);
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
	bullet.body.collideWorldBounds = true;
	bullet.body.onWorldBounds = true;
	bullet.rotation = rotation;
	
	const destructLayer = this.map.getLayer('destroyable_walls').tilemapLayer;
	const wallsLayer = this.map.getLayer('walls').tilemapLayer;
	this.physics.add.collider(bullet, destructLayer, bulletHitWall, null, this);
	this.physics.add.collider(bullet, wallsLayer, bulletHitWall, null, this);
	
	this.physics.velocityFromRotation(bullet.rotation, 500, bullet.body.velocity);
	if (target === player) {
		this.physics.add.overlap(player.hull, bullet, bulletHitPlayer, null, this);
	} else {
		for (var i = 0; i < enemyTanks.length; i++) {
			this.physics.add.overlap(enemyTanks[i].hull, bullet, bulletHitEnemy, null, this);
		}
	}
}

function bulletHitPlayer(hull, bullet) {
	killBullet(bullet);
	player.damage();
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
	killBullet(bullet);
	enemy.damage();
}

function killBullet(bullet) {
	bullet.disableBody(true, true);
	bullet.setActive(false);
	bullet.setVisible(false);
}

function bulletHitWall(bullet, tile){
	killBullet(bullet);
	var destructLayer = this.map.getLayer('destroyable_walls').tilemapLayer;
	var wallsLayer = this.map.getLayer('walls').tilemapLayer;
	if (tile === 'wallsLayer') {
		return;
	}
	var index = tile.index + 1;
	var tileProperties = destructLayer.tileset[0].tileProperties[index - 1];
	var checkCollision = false;
	
	if (tileProperties) {
		if (tileProperties.collide) {
			checkCollision = true;
		}
	}
	const newTile = destructLayer.putTileAt(index, tile.x, tile.y);
	if (checkCollision) {
		newTile.setCollision(true);
	}
}
