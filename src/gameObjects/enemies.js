// Manages enemy creation and behavior
export class EnemyManager {
  constructor(scene) {
    this.scene = scene;
  }

  createEnemyRelative(x, heightAboveFloor, range, speed, name) {
    const { scene } = this;
    const y = scene.floorY - heightAboveFloor;
    const enemy = scene.enemies.create(x, y, "enemy");
    enemy.setScale(0.3).setDepth(3);
    enemy.name = name;
    // Resize physics body manually
    enemy.body.setSize(enemy.width * 0.3, enemy.height * 0.3);
    enemy.setCollideWorldBounds(false); // IMPORTANT
    enemy.setBounce(0);
    enemy.body.setAllowGravity(false);
    enemy.speed = speed;
    enemy.direction = 1;
    scene.physics.add.collider(enemy, scene.platforms);
    // ---- Patrol range (enemy platform width = 500)
    const patrolWidth = range;
    enemy.minX = x - patrolWidth / 2 + 30; // left edge limit
    enemy.maxX = x + patrolWidth / 2 - 30; // right edge limit
    return enemy;
  }
  // Increase speed of a specific enemy by name
  increaseEnemySpeedByName(name, amount = 20) {
    this.scene.enemies.children.iterate((enemy) => {
      if (!enemy) return;
      if (enemy.name === name) {
        enemy.speed += amount;
      }
    });
  }

  duplicateEnemyByName(originalName, newName) {
    const enemies = this.scene.enemies.getChildren();
    const original = enemies.find((e) => e.name === originalName);
    if (!original) return;

    const heightAboveFloor = this.scene.floorY - original.y;

    // Create enemy at same center position
    const newEnemy = this.createEnemyRelative(
      original.x, // use SAME center
      heightAboveFloor,
      original.maxX - original.minX,
      original.speed,
      newName,
    );

    // 🔥 Copy exact patrol limits
    newEnemy.minX = original.minX;
    newEnemy.maxX = original.maxX;

    // 🔥 Small visual offset ONLY on position (not range)
    newEnemy.x += 40;

    return newEnemy;
  }

  update() {
    this.scene.enemies.children.iterate((enemy) => {
      if (!enemy) return;
      enemy.setVelocityX(enemy.speed * enemy.direction);
      // Flip sprite visually
      enemy.setFlipX(enemy.direction < 0);
      // Patrol logic
      if (enemy.x >= enemy.maxX) {
        enemy.direction = -1;
      }
      if (enemy.x <= enemy.minX) {
        enemy.direction = 1;
      }
    });
  }

  handleCollision(player, enemy) {
    // 1. Check if the popup is already open to prevent double-triggering
    if (this.scene.popupOpen) return;
    // Inside handleCollision
    if (this.scene.playerController.sfx.run.isPlaying) {
      this.scene.playerController.sfx.run.stop();
    }
    // 2. Play the death sound immediately
    this.scene.sound.play("deathSfx", { volume: 0.6 });

    // 3. Pause the game and show the UI
    this.scene.popupOpen = true;
    this.scene.physics.pause();

    // Clear feedback and set message
    document.getElementById("modal-feedback").innerText = "";
    document.getElementById("modal-question").innerText =
      "⚠️ You were caught by an enemy!";

    const container = document.getElementById("modal-answers");
    container.innerHTML = "";

    const okBtn = document.createElement("button");
    okBtn.innerText = "OK";
    okBtn.className = "answer-btn";
    okBtn.onclick = () => {
      this.scene.modal.closeModal();
      this.scene.playerController.loseLife();
      this.scene.playerController.respawn();

      // Resume physics when the user clicks OK
      this.scene.physics.resume();
    };

    container.appendChild(okBtn);
    document.getElementById("modal").style.display = "flex";
  }
}
