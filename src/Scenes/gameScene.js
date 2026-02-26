import LabScene from "./labScene.js";
import {
  createFloor,
  createPlatformRelative,
} from "../gameObjects/platforms.js";
import { EnemyManager } from "../gameObjects/enemies.js";
import { ItemManager } from "../gameObjects/items.js";
import { ModalUI } from "../gameObjects/modal.js";
import { PlayerController } from "../gameObjects/player.js";

export default class GameScene extends Phaser.Scene {
  constructor() {
    super({ key: "GameScene" });
  }

  preload() {
    this.load.image("bg", "../assets/background.png");
    this.load.image("idel", "../assets/idel1.png");
    this.load.image("walk", "../assets/walk1.png");
    this.load.image("jump", "../assets/jump1.png");
    this.load.image("jumpOut", "../assets/jump2.png");
    this.load.image("scope", "../assets/scope.png");
    this.load.image("loupe", "../assets/loupe.png");
    this.load.image("tumor", "../assets/tumeur.jpg");
    this.load.image("scopeloop", "../assets/scopeloupe.png");
    this.load.image("platforme", "../assets/platforme.png");
    this.load.image("enemy", "../assets/enemy.png");
  }

  create() {
    // shared globals
    this.popupOpen = false;
    this.hasLoupe = false;
    this.canShowWarning = true;

    this.physics.world.gravity.y = 1400;
    const worldWidth = 1400;
    const worldHeight = window.innerHeight;

    // 1. Background
    let bg = this.add.image(0, 0, "bg").setOrigin(0, 0);
    bg.setDepth(0);
    let scale = Math.max(
      this.cameras.main.width / bg.width,
      this.cameras.main.height / bg.height,
    );
    bg.setScale(scale).setScrollFactor(0);
    const floorOffsetFromBottom = 310;
    this.floorY = bg.displayHeight - floorOffsetFromBottom * scale;

    // 2. Platforms
    this.platforms = this.physics.add.staticGroup();
    createFloor(this, worldWidth / 2, this.floorY, worldWidth, 40);
    createPlatformRelative(this, 400, 100, 150, 20); //1st q platform
    createPlatformRelative(this, 800, 110, 150, 20); //2nd q platform
    createPlatformRelative(this, 1200, 130, 150, 20); //loupe q platform
    createPlatformRelative(this, 1100, 400, 150, 20); //loupe platform
    createPlatformRelative(this, 150, 150, 150, 20); //pass to enemy platform
    createPlatformRelative(this, 600, 400, 500, 20); //enemy platform

    // 3. Player
    this.playerController = new PlayerController(this);
    this.playerController.create();

    // 4. Camera & World
    this.cameras.main.setBounds(0, 0, worldWidth, worldHeight);
    this.physics.world.setBounds(0, 0, worldWidth, worldHeight);
    this.cameras.main.startFollow(this.player, true, 0.1, 0.1);
    this.cursors = this.input.keyboard.createCursorKeys();

    // 5. Items & Flags
    this.itemManager = new ItemManager(this);
    this.itemManager.addScopeRelative(400, 180, "q1", false);
    this.itemManager.addScopeRelative(800, 200, "q2", false);
    this.itemManager.addScopeLoopRelative(1200, 220, "tumor_v", true);
    this.itemManager.addLoupeRelative(1100, 450);

    // 6. Enemies
    this.enemies = this.physics.add.group();
    this.enemyManager = new EnemyManager(this);
    this.enemyManager.createEnemyRelative(600, 430);

    // overlaps
    this.physics.add.overlap(
      this.player,
      this.itemManager.items,
      this.itemManager.handleItemCollision,
      null,
      this.itemManager,
    );
    this.physics.add.overlap(
      this.player,
      this.enemies,
      this.enemyManager.handleCollision,
      null,
      this.enemyManager,
    );

    // modal/UI helper
    this.modal = new ModalUI(this);
    this.modal.createHTMLModal();
  }

  update() {
    if (this.popupOpen) return;
    this.playerController.update(this.cursors);
    this.enemyManager.update();
  }
}

const config = {
  type: Phaser.AUTO,
  width: window.innerWidth,
  height: window.innerHeight,
  physics: { default: "arcade", arcade: { debug: false } },
  scene: [LabScene, GameScene],
};
let game = null;
export function startGame() {
  if (!game) {
    game = new Phaser.Game(config);
  }
}

//checkpoint tt
