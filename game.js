class GameScene extends Phaser.Scene {
  constructor() {
    super({ key: "GameScene" });
  }

  preload() {
    // Chargement des images
    this.load.image("bg", "assets/background.png");
    this.load.image("idel", "assets/idel1.png");
    this.load.image("walk", "assets/walk1.png");
    this.load.image("jump", "assets/jump1.png");
    this.load.image("jumpOut", "assets/jump2.png");
  }

  create() {
    // Configuration de la physique
    this.physics.world.gravity.y = 1000;
    const worldWidth = 1600; // Largeur du niveau
    const worldHeight = 630;

    // 1. Background (Adapté à la taille de l'écran et fixe)
    let bg = this.add.image(0, 0, "bg").setOrigin(0, 0);
    let scale = Math.max(
      this.cameras.main.width / bg.width,
      this.cameras.main.height / bg.height,
    );
    bg.setScale(scale).setScrollFactor(0);

    // 2. Groupe de plateformes statiques
    this.platforms = this.physics.add.staticGroup();

    // Le sol principal
    this.createPlatform(800, 610, 1600, 40);

    // Plateformes aériennes (x, y, largeur, hauteur)
    this.createPlatform(400, 450, 200, 20);
    this.createPlatform(800, 350, 250, 20);
    this.createPlatform(1100, 250, 200, 20);
    this.createPlatform(1400, 400, 200, 20);

    // 3. Joueur
    this.player = this.physics.add.image(100, 500, "idel");
    this.player.setScale(0.7);
    this.player.setCollideWorldBounds(true);

    // Hitbox : Ajustement pour coller au sol malgré le vide dans l'image
    // On définit une boîte de 60px de large et 110px de haut
    this.player.body.setSize(60, 160);

    // 4. Caméra
    this.cameras.main.setBounds(0, 0, worldWidth, worldHeight);
    this.physics.world.setBounds(0, 0, worldWidth, worldHeight);
    this.cameras.main.startFollow(this.player, true, 0.1, 0.1);

    // 5. Collisions et Contrôles
    this.physics.add.collider(this.player, this.platforms);
    this.cursors = this.input.keyboard.createCursorKeys();
    this.playerState = "idel";
  }

  // Fonction pour créer des rectangles physiques facilement
  createPlatform(x, y, width, height) {
    const rect = this.add.rectangle(x, y, width, height, 0x444444);
    this.platforms.add(rect);
  }

  setPlayerState(newState) {
    if (this.playerState === newState) return;
    this.playerState = newState;
    this.player.setTexture(newState);
  }

  update() {
    const onGround =
      this.player.body.touching.down || this.player.body.blocked.down;
    let velocityX = 0;

    // Déplacement Horizontal
    if (this.cursors.left.isDown) {
      velocityX = -250;
      this.player.setFlipX(true);
    } else if (this.cursors.right.isDown) {
      velocityX = 250;
      this.player.setFlipX(false);
    }
    this.player.setVelocityX(velocityX);

    // Logique des états (Animations/Textures)
    if (!onGround) {
      // En l'air
      if (this.player.body.velocity.y < 0) {
        this.setPlayerState("jump");
      } else {
        this.setPlayerState("jumpOut");
      }
    } else {
      // Au sol
      if (velocityX !== 0) {
        this.setPlayerState("walk");
      } else {
        this.setPlayerState("idel");
      }

      // Saut
      if (this.cursors.up.isDown) {
        this.player.setVelocityY(-550);
      }
    }
  }
}

// Configuration du jeu
const config = {
  type: Phaser.AUTO,
  width: 1200,
  height: 630,
  physics: {
    default: "arcade",
    arcade: {
      debug: false, // Change en true pour voir les boîtes de collision
    },
  },
  scene: GameScene,
};

new Phaser.Game(config);
