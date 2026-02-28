// Encapsulates player creation, movement and life system
export class PlayerController {
  constructor(scene) {
    this.scene = scene;
    this.spawnX = 100;
    this.spawnY = 500;
    this.lives = 3;
    this.playerState = "idel";
  }

  create() {
    const scene = this.scene;
    // create physics-enabled player
    scene.player = scene.physics.add.image(this.spawnX, this.spawnY, "idel");
    scene.player.setDepth(2);
    scene.player.setScale(0.4).setCollideWorldBounds(true);
    scene.player.body.setSize(60, 160);
    scene.physics.add.collider(scene.player, scene.platforms);

    // display lives
    scene.livesText = scene.add
      .text(20, 20, "Lives: " + this.lives, {
        fontSize: "22px",
        fill: "#ffffff",
        fontStyle: "bold",
      })
      .setScrollFactor(0)
      .setDepth(2000);
  }
  respawn() {
    this.scene.player.setPosition(this.spawnX, this.spawnY);
    this.scene.player.setVelocity(0, 0);
  }
  loseLife() {
    this.lives--;
    this.scene.livesText.setText("Lives: " + this.lives);
    if (this.lives <= 0) {
      this.gameOver();
    }
  }

  gameOver() {
    const scene = this.scene;
    scene.physics.pause();
    scene.popupOpen = true;
    document.getElementById("modal-feedback").innerText = ""; // CLEAR FEEDBACK HERE
    document.getElementById("modal-question").innerText =
      "💀 Game Over! You lost all lives.";
    const container = document.getElementById("modal-answers");
    container.innerHTML = "";
    const restartBtn = document.createElement("button");
    restartBtn.innerText = "Restart";
    restartBtn.className = "answer-btn";
    restartBtn.onclick = () => {
      document.getElementById("modal").style.display = "none";
      scene.popupOpen = false;
      scene.scene.restart();
    };
    container.appendChild(restartBtn);
    document.getElementById("modal").style.display = "flex";
  }

  setPlayerState(s) {
    if (this.playerState === s) return;
    this.playerState = s;
    this.scene.player.setTexture(s);
  }

  update(cursors) {
    if (this.scene.popupOpen) return;
    const onGround =
      this.scene.player.body.touching.down ||
      this.scene.player.body.blocked.down;
    let velocityX = 0;
    if (cursors.left.isDown) {
      velocityX = -250;
      this.scene.player.setFlipX(true);
    } else if (cursors.right.isDown) {
      velocityX = 250;
      this.scene.player.setFlipX(false);
    }
    this.scene.player.setVelocityX(velocityX);

    if (!onGround) {
      this.setPlayerState(
        this.scene.player.body.velocity.y < 0 ? "jump" : "jumpOut",
      );
    } else {
      if (velocityX !== 0) this.setPlayerState("walk");
      else this.setPlayerState("idel");
      if (cursors.up.isDown) this.scene.player.setVelocityY(-550);
    }
  }
}
