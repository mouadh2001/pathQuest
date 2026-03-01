// Responsible for all on‑screen popups and menus
export class ModalUI {
  constructor(scene) {
    this.scene = scene;
    this.tumorUI = null;
  }

  showInfoMessage(message, autoClose = true, delay = 1500) {
    this.scene.popupOpen = true;
    this.scene.physics.pause();
    document.getElementById("modal-question").innerText = message;
    const container = document.getElementById("modal-answers");
    container.innerHTML = ""; // Optional OK button
    const okBtn = document.createElement("button");
    okBtn.innerText = "OK";
    okBtn.className = "answer-btn";
    okBtn.onclick = () => {
      this.closeModal();
    };
    container.appendChild(okBtn);
    document.getElementById("modal").style.display = "flex";
    if (autoClose) {
      this.scene.time.delayedCall(delay, () => {
        if (this.scene.popupOpen) this.closeModal();
      });
    }
  }

  openTumorMenu() {
    this.scene.popupOpen = true;
    this.scene.physics.pause();
    const cam = this.scene.cameras.main; // Create centered UI container in SCREEN SPACE
    this.tumorUI = this.scene.add
      .container(cam.width / 2, cam.height / 2)
      .setDepth(1000);
    const overlay = this.scene.add
      .rectangle(
        -cam.width / 3,
        -cam.height / 2,
        cam.width,
        cam.height,
        0x000000,
        0.85,
      )
      .setOrigin(0); // Tumor image
    const tumorImg = this.scene.add
      .image(0, -50, "tumor")
      .setScale(0.5)
      .setInteractive({ draggable: true }); // Enable drag

    this.scene.input.setDraggable(tumorImg);
    tumorImg.on("drag", (pointer, dragX, dragY) => {
      tumorImg.x = dragX;
      tumorImg.y = dragY;
    }); // Zoom
    this.scene.input.on("wheel", (pointer, gameObjects, dx, dy) => {
      if (!this.tumorUI) return;
      const newScale = Phaser.Math.Clamp(
        tumorImg.scale + (dy > 0 ? -0.05 : 0.05),
        0.3,
        2.5,
      );
      tumorImg.setScale(newScale);
    }); // Diagnose button
    const button = this.scene.add
      .rectangle(0, 220, 200, 55, 0x1e90ff)
      .setInteractive({ useHandCursor: true });
    const text = this.scene.add
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
    this.scene.input.removeAllListeners("wheel");
    this.scene.input.removeAllListeners("drag");
    this.tumorUI.destroy();
    this.tumorUI = null;
    this.scene.physics.resume();
    this.scene.popupOpen = false;
  }

  openQCM(id) {
    this.scene.popupOpen = true;
    this.scene.physics.pause();
    this.sfx = {
      correct: this.scene.sound.add("correctSfx", { volume: 0.5 }),
      wrong: this.scene.sound.add("wrongSfx", { volume: 0.5 }),
    };
    const questions = {
      // ... (your existing questions object)
      q1: {
        q: "En anatomie pathologique, le terme architecture tumorale désigne ?",
        a: [
          "La taille des cellules tumorales",
          "L'organisation des cellules tumorales",
          "Le garde de malignité",
          "Le type immunohistochimique",
        ],
        c: 1,
        fbc: "Exact. L’architecture tumorale décrit la façon dont les cellules sont organisées entre elles.",
        fbw: "Incorrect. L’architecture tumorale concerne l’organisation spatiale, pas la taille ou le grade.",
      },
      // ADD fbc and fbw to your other questions here so they show up!
      q2: {
        q: "Une tumeur organisée en amas arrondis bien délimités présente une architecture ?",
        a: ["Fasciculaire", "Infilitrante", "Nodulaire", "Myxoïde"],
        c: 2,
        fbc: "Correct ! Le terme 'Nodulaire' vient de 'Nodule' (petit nœud/amas).",
        fbw: "Non. Rappelez-vous : amas arrondis = nodules.",
      },
      q3: {
        q: "Des cellules tumorales disposées en faisceaux parallèles ou entrecroisés évoquent une architecture ?",
        a: ["Fasciculaire", "Infilitrante", "Nodulaire", "Myxoïde"],
        c: 0,
        fbc: "Exact. Les faisceaux cellulaires sont caractéristiques d’une architecture fasciculaire.",
        fbw: "Incorrect. Une organisation en faisceaux correspond à une architecture fasciculaire, et non nodulaire, infiltrante ou myxoïde.",
      },

      q4: {
        q: "Une architecture tumorale infiltrante se caractérise par ?",
        a: [
          "Une croissance bien limitée",
          "Une organisation en faisceaux",
          "Une invasion diffuse des tissus adjacents",
          "Un stroma abondant gélatineux",
        ],
        c: 2,
        fbc: "Correct. Une tumeur infiltrante envahit progressivement les tissus voisins sans limites nettes.",
        fbw: "Incorrect. L’architecture infiltrante se définit par une invasion diffuse des tissus adjacents, et non par une organisation en faisceaux ou un stroma myxoïde.",
      },

      q5: {
        q: "Une tumeur avec un stroma riche, pâle et gélatineux, pauvre en cellules, présente une architecture ?",
        a: ["Fasciculaire", "Infilitrante", "Nodulaire", "Myxoïde"],
        c: 3,
        fbc: "Exact. Le terme myxoïde décrit un stroma abondant d’aspect gélatineux.",
        fbw: "Incorrect. Un stroma pâle, riche et gélatineux est typique d’une architecture myxoïde.",
      },
      q6: {
        q: "Quelle architecture tumorale est la PLUS compatible avec une tumeur mal limitée, envahissant les structures adjacentes ?",
        a: ["Nodulaire", "Malignant", "Infilitrante", "Fasciculaire"],
        c: 2,
        fbc: "Correct. Une tumeur infiltrante ne respecte pas les limites anatomiques normales.",
        fbw: "Faux. Une tumeur mal limitée qui envahit les tissus adjacents correspond à une architecture infiltrante.",
      },
      q_tumor: {
        q: "Based on the zoom, what characterizes these cells?",
        a: ["Uniform shape", "Irregular borders and nuclei", "Normal size"],
        c: 1,
      },
    };
    const data = questions[id];
    const modal = document.getElementById("modal");
    const questionText = document.getElementById("modal-question");
    const container = document.getElementById("modal-answers");
    const feedback = document.getElementById("modal-feedback");

    // 1. Reset UI
    questionText.innerText = data.q;
    container.innerHTML = "";
    feedback.innerText = "";
    feedback.className = "feedback-area"; // For CSS styling

    // 2. Create Buttons
    data.a.forEach((ans, i) => {
      const b = document.createElement("button");
      b.innerText = ans;
      b.className = "answer-btn";

      b.onclick = () => {
        // Disable all buttons immediately so they can't click twice
        const buttons = container.querySelectorAll("button");
        buttons.forEach((btn) => (btn.style.pointerEvents = "none"));
        if (i === data.c) {
          // ✅ CORRECT LOGIC
          this.sfx.correct.play();
          this.scene.correctcount += 20; // Increment score
          this.scene.progressBar.width = this.scene.correctcount; // Update progress bar visually
          b.classList.add("correct-choice"); // Use CSS classes for cleaner code
          b.style.background = "#dcfce7";
          b.style.color = "#15803d";

          // Show Correct Feedback
          feedback.innerText = data.fbc || "✅ Correct !";
          feedback.style.color = "#166534";

          this.scene.time.delayedCall(3000, () => {
            this.handleSuccess(id); // Move logic to a helper to keep it clean
            this.closeModal();
          });
        } else {
          // ❌ WRONG LOGIC
          this.sfx.wrong.play();
          b.style.background = "#fee2e2";
          b.style.color = "#b91c1c";

          // Show Wrong Feedback
          feedback.innerText = data.fbw || "❌ Incorrect. Try again!";
          feedback.style.color = "#7f1d1d";

          this.scene.time.delayedCall(3000, () => {
            if (this.scene.currentScope) this.scene.currentScope.destroy();
            this.closeModal();
            this.scene.playerController.respawn();
          });
        }
      };
      container.appendChild(b);
    });

    modal.style.display = "flex";
  }

  // Helper to handle the platform movements
  handleSuccess(id) {
    if (this.scene.currentScope) this.scene.currentScope.destroy();

    const passPlatform = this.scene.platforms
      .getChildren()
      .find((p) => p.id === "pass");
    if (passPlatform && passPlatform.y !== this.scene.floorY - 190) {
      passPlatform.y -= 20;
      passPlatform.refreshBody();
    }

    if (id === "q6") {
      const voidPlatform = this.scene.platforms
        .getChildren()
        .find((p) => p.id === "void");
      if (voidPlatform) voidPlatform.destroy();
    }
  }

  closeModal() {
    document.getElementById("modal").style.display = "none";
    this.scene.physics.resume();
    this.scene.popupOpen = false;
  }

  createHTMLModal() {
    if (document.getElementById("modal")) return;
    const modal = document.createElement("div");
    modal.id = "modal";
    modal.innerHTML = `
    <div class="modal-content">
      <h2 id="modal-question"></h2>
      <div id="modal-feedback"></div>
      <div id="modal-answers"></div>
      <div id="modal-message"></div>
    </div>
  `;
    document.body.appendChild(modal);
  }
}
//checkpoint pp
