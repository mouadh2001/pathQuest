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
    // Load images
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
    this.load.image("enemy", "../assets/enemy1.png");
    // Load audio
    this.load.audio("bgMusic", "../sounds/background.wav");
    this.load.audio("jumpSfx", "../sounds/jumpin.wav");
    this.load.audio("landSfx", "../sounds/runing.wav");
    this.load.audio("runSfx", "../sounds/runing.wav");
    this.load.audio("deathSfx", "../sounds/death.wav");
    this.load.audio("correctSfx", "../sounds/correct.wav");
    this.load.audio("wrongSfx", "../sounds/wrong.wav");
    this.load.audio("scopeSfx", "../sounds/scope.wav");
    this.load.audio("loupeSfx", "../sounds/loupe.mp3");
  }

  create() {
    // Stop any existing music
    const htmlMusic = document.getElementById("htmlMusic");
    if (htmlMusic) {
      htmlMusic.pause();
      htmlMusic.currentTime = 0;
    }
    // shared globals
    this.popupOpen = false;
    this.hasLoupe = false;
    this.canShowWarning = true;
    this.correctcount = 0;
    this.incorrectcount = 0;

    this.physics.world.gravity.y = 1300;
    const worldWidth = 1320;
    const worldHeight = window.innerHeight;

    //progressbar
    this.progressBar = this.add.rectangle(
      380,
      30,
      this.correctcount,
      20,
      0x00ff00,
    );
    this.progressBar.setOrigin(0, 0.5);
    this.progressBar.setDepth(2000);
    //Savois acquis

    this.savois = this.add
      .text(150, 20, "|  Savois acquis:", {
        fontSize: "22px",
        fill: "#ffffff",
        fontStyle: "bold",
      })
      .setScrollFactor(0)
      .setDepth(2000);

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
    createPlatformRelative(this, 400, 100, 150, 20, "q1"); //1st q platform
    createPlatformRelative(this, 700, 130, 150, 20, "q2"); //2nd q platform
    createPlatformRelative(this, 1200, 130, 150, 20, "q3"); //loupe q platform
    createPlatformRelative(this, 950, 300, 150, 20, "loupe"); //loupe platform
    createPlatformRelative(this, 150, 130, 150, 20, "pass"); //pass to enemy platform
    createPlatformRelative(this, 530, 300, 400, 20, "enemy"); //enemy platform
    createPlatformRelative(this, 200, 410, 400, 20, "q4"); //q4 enemy platform
    createPlatformRelative(this, 800, 410, 150, 20, "q5"); //q5 platform
    createPlatformRelative(this, 950, 410, 150, 20, "void"); //void platform
    createPlatformRelative(this, 1175, 410, 300, 20, "q7"); //q7 platform

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
    this.itemManager.addScopeRelative(400, 140, "q1", false);
    this.itemManager.addScopeRelative(550, 50, "q2", false);
    this.itemManager.addScopeRelative(700, 170, "q3", false);
    this.itemManager.addScopeRelative(100, 450, "q4", false);
    this.itemManager.addScopeRelative(1250, 450, "q6", false);
    this.itemManager.addScopeRelative(800, 450, "q5", false);
    this.itemManager.addScopeLoopRelative(1200, 170, "tumor_v", true);
    this.itemManager.addLoupeRelative(950, 340);

    // 6. Enemies
    this.enemies = this.physics.add.group();
    this.enemyManager = new EnemyManager(this);
    this.enemyManager.createEnemyRelative(530, 330, 400, 100, "E1");
    this.enemyManager2 = new EnemyManager(this);
    this.enemyManager2.createEnemyRelative(650, 40, 1000, 100, "E2");
    this.enemyManager3 = new EnemyManager(this);
    this.enemyManager3.createEnemyRelative(210, 440, 400, 100, "E3");
    this.enemyManager4 = new EnemyManager(this);
    this.enemyManager4.createEnemyRelative(1020, 440, 550, 100, "E4");

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

    // 7. Audio
    this.bgMusic = this.sound.add("bgMusic", { loop: true, volume: 0.3 });
    this.bgMusic.play();
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
