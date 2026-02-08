class LabScene extends Phaser.Scene {
  constructor() {
    super({ key: "LabScene" });
  }

  preload() {
    this.load.image("lab", "./assets/scene1.png");
    this.load.image("plateau1", "./assets/plateau1.png");
    this.load.image("plateau_locked", "./assets/plateau_locked.png");
  }

  create() {
    // Background labo
    const bg = this.add.image(0, 0, "lab").setOrigin(0);

    const scaleX = this.cameras.main.width / bg.width;
    const scaleY = this.cameras.main.height / bg.height;
    const scale = Math.max(scaleX, scaleY);

    bg.setScale(scale);
    bg.setScrollFactor(0); // reste fixe

    // Plateau 1 (débloqué)
    const p1 = this.add
      .image(200, 550, "plateau1")
      .setDisplaySize(100, 90)
      .setInteractive({ useHandCursor: true });

    // Plateaux verrouillés
    // this.add.image(650, 350, "plateau_locked").setAlpha(0.5);
    // this.add.image(900, 350, "plateau_locked").setAlpha(0.5);

    p1.on("pointerdown", () => {
      this.scene.start("GameScene");
    });

    this.add
      .text(190, 450, "Niveau 1", {
        fontSize: "40px",
        color: "#ffffff",
      })
      .setOrigin(0.5);
  }
}
