class LabScene extends Phaser.Scene {
  constructor() {
    super({ key: "LabScene" });
  }

  preload() {
    this.load.image("lab", "../assets/scene1.png");
  }

  create() {
    this.bg = this.add.image(
      this.cameras.main.centerX,
      this.cameras.main.centerY,
      "lab",
    );

    // 1. Create the Visual Circle
    // We draw it at 0,0 locally so we can move the whole 'this.circle' object later
    this.circle = this.add
      .graphics()
      .fillStyle(0x0000ff, 0.4)
      .fillCircle(0, 0, 55)
      .setAlpha(0);

    // 2. Create Hotspot (Zone)
    // We set the hit area to 75, 75 because the hit area is relative to the Zone's top-left
    this.hotspot = this.add
      .zone(0, 0, 150, 150)
      .setInteractive(
        //
        new Phaser.Geom.Circle(75, 75, 75),
        Phaser.Geom.Circle.Contains,
      )
      .on("pointerover", () => this.circle.setAlpha(1))
      .on("pointerout", () => this.circle.setAlpha(0))
      .on("pointerdown", () => this.scene.start("GameScene"));

    this.hotspot.useHandCursor = true;

    this.lvlText = this.add
      .text(0, 0, "Lvl 1", {
        fontSize: "40px",
        color: "#ffffff",
        fontStyle: "bold",
      })
      .setOrigin(0.5);

    this.resize();
    this.scale.on("resize", this.resize, this);
  }

  resize() {
    const { width, height } = this.cameras.main;
    this.bg.setPosition(width / 2, height / 2);

    const scale = Math.min(width / this.bg.width, height / this.bg.height);
    this.bg.setScale(scale);

    // 3. Calculate the specific spot (e.g., 300, 400 from your original image)
    // This formula ensures the spot stays pinned to the image content
    const x = this.bg.x + (260 - this.bg.width / 2) * scale;
    const y = this.bg.y + (695 - this.bg.height / 2) * scale;

    // Move everything to that exact spot
    this.hotspot.setPosition(x, y).setScale(scale);
    this.circle.setPosition(x, y).setScale(scale);
    this.lvlText.setPosition(x + 1 * scale, y - 120 * scale).setScale(scale);
  }
}
