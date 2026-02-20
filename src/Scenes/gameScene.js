class GameScene extends Phaser.Scene {
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
  }

  create() {
    this.physics.world.gravity.y = 1000;
    const worldWidth = 1600;
    const worldHeight = window.innerHeight;

    // 1. Background
    let bg = this.add.image(0, 0, "bg").setOrigin(0, 0);
    bg.setDepth(0);
    let scale = Math.max(
      this.cameras.main.width / bg.width,
      this.cameras.main.height / bg.height,
    );
    bg.setScale(scale).setScrollFactor(0);
    const bgBottom = bg.displayHeight;
    const floorOffsetFromBottom = 310; // <-- adjust this once only
    this.floorY = bg.displayHeight - floorOffsetFromBottom * scale;
    // 2. Platforms
    this.platforms = this.physics.add.staticGroup();
    this.createFloor(worldWidth / 2, this.floorY, worldWidth, 40);
    this.createPlatformRelative(400, 160, 200, 20);
    this.createPlatformRelative(800, 260, 250, 20);
    this.createPlatformRelative(1100, 360, 200, 20);
    this.createPlatformRelative(1400, 210, 200, 20);

    // 3. Player
    this.player = this.physics.add.image(100, 500, "idel");
    this.player.setDepth(2);
    this.player.setScale(0.7).setCollideWorldBounds(true);
    this.player.body.setSize(60, 160);
    this.physics.add.collider(this.player, this.platforms);

    // 4. Camera & World
    this.cameras.main.setBounds(0, 0, worldWidth, worldHeight);
    this.physics.world.setBounds(0, 0, worldWidth, worldHeight);
    this.cameras.main.startFollow(this.player, true, 0.1, 0.1);

    this.cursors = this.input.keyboard.createCursorKeys();
    this.playerState = "idel";

    // 5. Items & Flags
    this.items = this.physics.add.staticGroup();
    this.hasLoupe = false;
    this.popupOpen = false;
    this.canShowWarning = true; // Prevents alert spamming

    // Setup Items
    this.addScopeRelative(400, 230, "q1", false);
    this.addScopeRelative(800, 330, "q2", false);
    this.addScopeLoopRelative(1100, 430, "tumor_v", true);
    this.addLoupeRelative(1400, 250);

    this.physics.add.overlap(
      this.player,
      this.items,
      this.handleItemCollision,
      null,
      this,
    );

    this.createHTMLModal();
  }

  createFloor(x, y, width, height) {
    const rect = this.add.rectangle(x, y, width, height, 0x000000, 0);
    rect.setDepth(0);
    this.platforms.add(rect);
  }
  createPlatform(x, y, width, height) {
    let platform = this.platforms.create(x, y, "platforme");

    // Resize the body
    platform.displayWidth = width;
    platform.displayHeight = height;
    platform.setDisplaySize(width, height);

    platform.refreshBody(); // VERY IMPORTANT
    platform.setDepth(1);

    return platform;
  }
  createPlatformRelative(x, heightAboveFloor, width, height) {
    const y = this.floorY - heightAboveFloor;
    return this.createPlatform(x, y, width, height);
  }

  addScope(x, y, questionId, locked) {
    let scope = this.items.create(x, y, "scope");
    scope.setScale(0.2);
    scope.refreshBody();
    scope.questionId = questionId;
    scope.locked = locked;
  }
  addScopeLoop(x, y, questionId, locked) {
    let scope = this.items.create(x, y, "scopeloop");
    scope.setScale(0.2);
    scope.refreshBody();
    scope.questionId = questionId;
    scope.locked = locked;
  }

  addLoupe(x, y) {
    let loupe = this.items.create(x, y, "loupe");
    loupe.setScale(0.2);
    loupe.refreshBody();
    loupe.isLoupe = true;
  }
  addScopeRelative(x, heightAboveFloor, questionId, locked) {
    const y = this.floorY - heightAboveFloor;
    return this.addScope(x, y, questionId, locked);
  }

  addScopeLoopRelative(x, heightAboveFloor, questionId, locked) {
    const y = this.floorY - heightAboveFloor;
    return this.addScopeLoop(x, y, questionId, locked);
  }

  addLoupeRelative(x, heightAboveFloor) {
    const y = this.floorY - heightAboveFloor;
    return this.addLoupe(x, y);
  }

  handleItemCollision(player, item) {
    if (this.popupOpen) return;

    // Logic: Pick up Loupe
    if (item.isLoupe) {
      this.hasLoupe = true;
      item.destroy();
      alert("🔍 Loupe collected! Now analyze the slide on the third platform.");
      return;
    }

    // Logic: Locked Item Prevention (Spam Fix)
    if (item.locked && !this.hasLoupe) {
      if (this.canShowWarning) {
        this.canShowWarning = false;
        alert(
          "This slide is too complex! You need the Loupe from the 4th platform first.",
        );

        // Cooldown timer: Only allow the alert once every 3 seconds
        this.time.delayedCall(3000, () => {
          this.canShowWarning = true;
        });
      }
      return;
    }

    // Logic: Open Menus
    this.currentScope = item;
    if (item.questionId === "tumor_v") {
      this.openTumorMenu();
    } else {
      this.openQCM(item.questionId);
    }
  }

  openTumorMenu() {
    this.popupOpen = true;
    this.physics.pause();
    const cam = this.cameras.main;

    // Create centered UI container in SCREEN SPACE
    this.tumorUI = this.add
      .container(cam.width / 2, cam.height / 2)
      .setDepth(1000);

    const overlay = this.add
      .rectangle(
        -cam.width / 3,
        -cam.height / 2,
        cam.width,
        cam.height,
        0x000000,
        0.85,
      )
      .setOrigin(0);

    // Tumor image
    const tumorImg = this.add
      .image(0, -50, "tumor")
      .setScale(0.5)
      .setInteractive({ draggable: true });

    // Enable drag
    this.input.setDraggable(tumorImg);
    tumorImg.on("drag", (pointer, dragX, dragY) => {
      tumorImg.x = dragX;
      tumorImg.y = dragY;
    });

    // Zoom
    this.input.on("wheel", (pointer, gameObjects, dx, dy) => {
      if (!this.tumorUI) return;
      const newScale = Phaser.Math.Clamp(
        tumorImg.scale + (dy > 0 ? -0.05 : 0.05),
        0.3,
        2.5,
      );
      tumorImg.setScale(newScale);
    });

    // Diagnose button
    const button = this.add
      .rectangle(0, 220, 200, 55, 0x1e90ff)
      .setInteractive({ useHandCursor: true });
    const text = this.add
      .text(0, 220, "Diagnose", {
        fontSize: "22px",
        color: "#ffffff",
        fontStyle: "bold",
      })
      .setOrigin(0.5);
    button.on("pointerdown", () => {
      this.closeTumorMenu();
      this.openQCM("q_tumor");
    });
    this.tumorUI.add([overlay, tumorImg, button, text]);
  }
  closeTumorMenu() {
    if (!this.tumorUI) return;

    this.input.removeAllListeners("wheel");
    this.input.removeAllListeners("drag");

    this.tumorUI.destroy();
    this.tumorUI = null;

    this.physics.resume();
    this.popupOpen = false;
  }

  openQCM(id) {
    this.popupOpen = true;
    this.physics.pause();

    const questions = {
      q1: {
        q: "What is a tumor?",
        a: ["A virus", "Abnormal cell growth", "Healthy tissue"],
        c: 1,
      },
      q2: {
        q: "Benign tumors usually stay in one place?",
        a: ["True", "False"],
        c: 0,
      },
      q_tumor: {
        q: "Based on the zoom, what characterizes these cells?",
        a: ["Uniform shape", "Irregular borders and nuclei", "Normal size"],
        c: 1,
      },
    };

    const data = questions[id];
    document.getElementById("modal-question").innerText = data.q;
    const container = document.getElementById("modal-answers");
    container.innerHTML = "";

    data.a.forEach((ans, i) => {
      const b = document.createElement("button");
      b.innerText = ans;
      b.className = "answer-btn";

      b.onclick = () => {
        // Disable all buttons to prevent double clicking
        const buttons = container.querySelectorAll("button");
        buttons.forEach((btn) => (btn.style.pointerEvents = "none"));

        if (i === data.c) {
          b.style.background = "#dcfce7"; // Success Green
          b.style.borderColor = "#22c55e";
          b.style.color = "#15803d";
          b.innerText = "✅ Correct Analysis!";

          this.time.delayedCall(1000, () => {
            if (this.currentScope) this.currentScope.destroy();
            this.closeModal();
          });
        } else {
          b.style.background = "#fee2e2"; // Error Red
          b.style.borderColor = "#ef4444";
          b.style.color = "#b91c1c";
          b.innerText = "❌ Incorrect. Re-examine.";

          this.time.delayedCall(1200, () => this.closeModal());
        }
      };
      container.appendChild(b);
    });
    document.getElementById("modal").style.display = "flex";
  }

  closeModal() {
    document.getElementById("modal").style.display = "none";
    this.physics.resume();
    this.popupOpen = false;
  }

  update() {
    if (this.popupOpen) return;
    const onGround =
      this.player.body.touching.down || this.player.body.blocked.down;
    let velocityX = 0;
    if (this.cursors.left.isDown) {
      velocityX = -250;
      this.player.setFlipX(true);
    } else if (this.cursors.right.isDown) {
      velocityX = 250;
      this.player.setFlipX(false);
    }
    this.player.setVelocityX(velocityX);

    if (!onGround) {
      this.setPlayerState(this.player.body.velocity.y < 0 ? "jump" : "jumpOut");
    } else {
      if (velocityX !== 0) this.setPlayerState("walk");
      else this.setPlayerState("idel");
      if (this.cursors.up.isDown) this.player.setVelocityY(-550);
    }
  }

  setPlayerState(s) {
    if (this.playerState === s) return;
    this.playerState = s;
    this.player.setTexture(s);
  }

  createHTMLModal() {
    if (document.getElementById("modal")) return;

    // Create Style Tag for Professional UI
    const style = document.createElement("style");
    style.innerHTML = `
    #modal {
      position: fixed; top: 0; left: 0; width: 100%; height: 100%;
      background: rgba(15, 23, 42, 0.85); /* Dark slate overlay */
      display: none; justify-content: center; align-items: center;
      z-index: 9999; backdrop-filter: blur(5px); transition: all 0.3s ease;
    }
    .modal-content {
      background: #ffffff;
      padding: 40px;
      border-radius: 16px;
      text-align: center;
      font-family: 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
      max-width: 450px;
      width: 90%;
      box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.2), 0 10px 10px -5px rgba(0, 0, 0, 0.1);
      border-top: 6px solid #3b82f6; /* Professional blue accent */
    }
    #modal-question {
      color: #1e293b;
      font-size: 22px;
      margin-bottom: 25px;
      line-height: 1.4;
    }
    .answer-btn {
      display: block;
      width: 100%;
      margin: 12px 0;
      padding: 14px;
      cursor: pointer;
      font-size: 16px;
      font-weight: 600;
      background: #f8fafc;
      color: #334155;
      border: 2px solid #e2e8f0;
      border-radius: 8px;
      transition: all 0.2s ease;
    }
    .answer-btn:hover {
      background: #eff6ff;
      border-color: #3b82f6;
      color: #1d4ed8;
      transform: translateY(-2px);
    }
    .answer-btn:active {
      transform: translateY(0);
    }
  `;
    document.head.appendChild(style);

    let m = document.createElement("div");
    m.id = "modal";
    m.innerHTML = `
    <div class="modal-content">
      <h2 id="modal-question"></h2>
      <div id="modal-answers"></div>
    </div>`;
    document.body.appendChild(m);
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

function startGame() {
  if (!game) {
    game = new Phaser.Game(config);
  }
}

//chekpoint
