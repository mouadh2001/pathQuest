// Handles creation of collectible items and collision logic
export class ItemManager {
  constructor(scene) {
    this.scene = scene;
    this.items = scene.physics.add.staticGroup();
  }

  addScope(x, y, questionId, locked) {
    let scope = this.items.create(x, y, "scope");
    scope.setScale(0.2);
    scope.setDepth(2);
    scope.refreshBody();
    // resize physics body
    scope.body.setSize(scope.width * 0.05, scope.height * 0.15);
    scope.questionId = questionId;
    scope.locked = locked;
    return scope;
  }

  addScopeLoop(x, y, questionId, locked) {
    let scope = this.items.create(x, y, "scopeloop");
    scope.setScale(0.2);
    scope.setDepth(2);
    scope.refreshBody();
    scope.body.setSize(scope.width * 0.05, scope.height * 0.15);
    scope.questionId = questionId;
    scope.locked = locked;
    return scope;
  }

  addLoupe(x, y) {
    let loupe = this.items.create(x, y, "loupe");
    loupe.setScale(0.2);
    loupe.setDepth(2);
    loupe.refreshBody();
    loupe.body.setSize(loupe.width * 0.05, loupe.height * 0.15);
    loupe.isLoupe = true;
    return loupe;
  }

  addScopeRelative(x, heightAboveFloor, questionId, locked) {
    const y = this.scene.floorY - heightAboveFloor;
    return this.addScope(x, y, questionId, locked);
  }

  addScopeLoopRelative(x, heightAboveFloor, questionId, locked) {
    const y = this.scene.floorY - heightAboveFloor;
    return this.addScopeLoop(x, y, questionId, locked);
  }

  addLoupeRelative(x, heightAboveFloor) {
    const y = this.scene.floorY - heightAboveFloor;
    return this.addLoupe(x, y);
  }

  handleItemCollision(player, item) {
    if (this.scene.popupOpen) return;
    this.sfx = {
      scope: this.scene.sound.add("scopeSfx", { volume: 0.5 }),
      loupe: this.scene.sound.add("loupeSfx", { volume: 0.5 }),
    };
    if (this.scene.playerController.sfx.run.isPlaying) {
      this.scene.playerController.sfx.run.stop();
    }
    // Logic: Pick up Loupe
    if (item.isLoupe) {
      this.sfx.loupe.play();
      this.scene.hasLoupe = true;
      item.destroy();
      document.getElementById("modal-feedback").innerText = ""; // CLEAR FEEDBACK HERE
      this.scene.modal.showInfoMessage(
        "🔍 Loupe collected! Now analyze the slide on the third platform.",
        true,
      );
      return;
    }
    // Logic: Locked Item Prevention (Show Modal Only Once)
    if (item.locked && !this.scene.hasLoupe) {
      if (this.scene.canShowWarning) {
        this.scene.canShowWarning = false; // Permanent lock after first show
        document.getElementById("modal-feedback").innerText = ""; // CLEAR FEEDBACK HERE
        this.scene.modal.showInfoMessage(
          "💡 This slide is too complex! You need the Loupe first.",
          true,
        );
      }
      return; // Prevent interaction
    }

    // Logic: Open Menus
    this.scene.currentScope = item;
    if (item.questionId === "tumor_v") {
      this.scene.modal.openTumorMenu();
    } else {
      this.scene.modal.openQCM(item.questionId);
    }
  }
}
