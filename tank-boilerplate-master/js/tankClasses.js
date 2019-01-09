class BaseTank {
	constructor(scene, x, y, texture, frameID) {
		this.scene = scene;
		this.shadow = scene.physics.add.sprite(x, y, texture, ['shadow']);
		this.hull = scene.physics.add.sprite(x, y, texture, frameID);
		this.hull.body.setSize(this.hull.width - 8, this.hull.height - 8);
		this.hull.body.collideWorldBounds = true;
		this.hull.body.bounce.setTo(1,1)
		this.turret = scene.physics.add.sprite(x, y, texture, ['turret']);
	}
	update() {
		this.shadow.x = this.turret.x = this.hull.x
		this.shadow.y = this.turret.y = this.hull.y
	}
}

class EnemyTank extends BaseTank{
	constructor(scene, x, y, texture, frameID, player) {
		super(scene, x, y, texture, frameID);
		this.player = player;
		this.hull.angle = Phaser.Math.RND.angle();
	}
	update() {
		super.update();
		this.turret.rotation = Phaser.Math.Angle.Between(this.hull.x, this.hull.y, this.player.hull.x, this.player.hull.y);
	}
}
class PlayerTank extends BaseTank{
	constructor(scene, x, y, texture, frameID) {
		super(scene, x, y, texture, frameID)
		this.scene = scene;
		this.currentSpeed = 0;
		this.keys = scene.input.keyboard.addKeys(
			{
				left:Phaser.Input.Keyboard.KeyCodes.LEFT,
				right:Phaser.Input.Keyboard.KeyCodes.RIGHT,
				up:Phaser.Input.Keyboard.KeyCodes.UP,
				down:Phaser.Input.Keyboard.KeyCodes.DOWN,
				w:Phaser.Input.Keyboard.KeyCodes.W,
				a:Phaser.Input.Keyboard.KeyCodes.A,
				s:Phaser.Input.Keyboard.KeyCodes.S,
				d:Phaser.Input.Keyboard.KeyCodes.D
			}
		);
	}
	getTank() {
		return this.hull
	}
	update() {
		super.update();
		if(this.keys.up.isDown || this.keys.w.isDown) {
			if(this.currentSpeed < 100){
				this.currentSpeed += 10;
			}
		}
		else if (this.keys.down.isDown || this.keys.s.isDown) {
			if(this.currentSpeed > -100){
				this.currentSpeed -= 10;
			}
		}
		else { // Default
			this.currentSpeed *= 0.9;
		}
		
		if (this.keys.left.isDown || this.keys.a.isDown) {
			if(this.currentSpeed > 0){
				this.hull.angle++;
				this.shadow.angle++;
				this.turret.angle++;
			} else {
				this.hull.angle--;
				this.shadow.angle--;
				this.turret.angle--;
			}
		}
		else if (this.keys.right.isDown || this.keys.d.isDown) {
			if(this.currentSpeed > 0){
				this.hull.angle--;
				this.shadow.angle--;
				this.turret.angle--;
			} else {
				this.hull.angle++;
				this.shadow.angle++;
				this.turret.angle++;
			}
		}
		this.scene.physics.velocityFromRotation(this.hull.rotation, this.currentSpeed, this.hull.body.velocity);
	}
}