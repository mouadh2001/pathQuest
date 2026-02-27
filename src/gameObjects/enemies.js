// Manages enemy creation and behavior
export class EnemyManager {
  constructor(scene) {
    this.scene = scene;
  }

  createEnemyRelative(x, heightAboveFloor, range, speed) {
    const { scene } = this;
    const y = scene.floorY - heightAboveFloor;
    const enemy = scene.enemies.create(x, y, "enemy");
    enemy.setScale(0.3).setDepth(3);
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
    // this method is intended to be used as a physics overlap callback
    if (this.scene.popupOpen) return;
    this.scene.popupOpen = true;
    this.scene.physics.pause();
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
      this.scene.playerController.respawn(); // same system as wrong answer
    };
    container.appendChild(okBtn);
    document.getElementById("modal").style.display = "flex";
  }
}
