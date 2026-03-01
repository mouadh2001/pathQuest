// Encapsulates player creation, movement and life system
export class PlayerController {
  constructor(scene) {
    this.scene = scene;
    this.spawnX = 100;
    this.spawnY = 500;
    this.lives = 3;
    this.playerState = "idel";

    // Track air state for landing sound
    this.wasInAir = false;
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
    // Initialize sound objects (allows for looping control)
    this.sfx = {
      jump: scene.sound.add("jumpSfx", { volume: 0.4 }),
      land: scene.sound.add("landSfx", { volume: 0.3 }),
      run: scene.sound.add("runSfx", { volume: 0.2, loop: true }),
    };
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
    if (this.scene.popupOpen) {
      if (this.sfx.run.isPlaying) this.sfx.run.stop();
      return;
    }

    const player = this.scene.player;
    const onGround = player.body.touching.down || player.body.blocked.down;
    let velocityX = 0;

    // 1. Movement Logic
    if (cursors.left.isDown) {
      velocityX = -250;
      player.setFlipX(true);
    } else if (cursors.right.isDown) {
      velocityX = 250;
      player.setFlipX(false);
    }
    player.setVelocityX(velocityX);

    // 2. Sound & Animation Logic
    if (!onGround) {
      // In the air
      this.setPlayerState(player.body.velocity.y < 0 ? "jump" : "jumpOut");
      this.wasInAir = true; // Mark that we are airborne

      // Stop running sound if we jump/fall
      if (this.sfx.run.isPlaying) this.sfx.run.stop();
    } else {
      // On the ground

      // Check for LANDING
      if (this.wasInAir) {
        this.sfx.land.play();
        this.wasInAir = false;
      }

      if (velocityX !== 0) {
        this.setPlayerState("walk");
        // Start running sound if not already playing
        if (!this.sfx.run.isPlaying) this.sfx.run.play();
      } else {
        this.setPlayerState("idel");
        // Stop running sound if standing still
        if (this.sfx.run.isPlaying) this.sfx.run.stop();
      }

      // Check for JUMPING
      if (cursors.up.isDown) {
        player.setVelocityY(-550);
        this.sfx.jump.play();
        // Stop running sound immediately when jumping
        if (this.sfx.run.isPlaying) this.sfx.run.stop();
      }
    }
  }
}
