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
    container.innerHTML = "";
    // Optional OK button
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
    const cam = this.scene.cameras.main;
    // Create centered UI container in SCREEN SPACE
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
      .setOrigin(0);
    // Tumor image
    const tumorImg = this.scene.add
      .image(0, -50, "tumor")
      .setScale(0.5)
      .setInteractive({ draggable: true });

    // Enable drag
    this.scene.input.setDraggable(tumorImg);
    tumorImg.on("drag", (pointer, dragX, dragY) => {
      tumorImg.x = dragX;
      tumorImg.y = dragY;
    });
    // Zoom
    this.scene.input.on("wheel", (pointer, gameObjects, dx, dy) => {
      if (!this.tumorUI) return;
      const newScale = Phaser.Math.Clamp(
        tumorImg.scale + (dy > 0 ? -0.05 : 0.05),
        0.3,
        2.5,
      );
      tumorImg.setScale(newScale);
    });
    // Diagnose button
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

  openQCM(id, count) {
    this.scene.popupOpen = true;
    this.scene.physics.pause();
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
      q3: {
        q: "Which of these is a common symptom of a tumor?",
        a: ["Unexplained weight loss", "Improved vision", "Increased energy"],
        c: 0,
      },
      q4: {
        q: "What is metastasis?",
        a: [
          "Spread of cancer to other parts of the body",
          "A type of benign tumor",
          "A treatment method",
        ],
        c: 0,
      },
      q5: {
        q: "What is the main function of a tumor suppressor gene?",
        a: [
          "To promote cell division",
          "To prevent uncontrolled cell growth",
          "To produce energy for cells",
        ],
        c: 1,
      },
      q6: {
        q: "Which of these is NOT a type of tumor?",
        a: ["Benign", "Malignant", "Healthy"],
        c: 2,
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
          this.scene.time.delayedCall(1000, () => {
            if (this.scene.currentScope) this.scene.currentScope.destroy();
            this.closeModal();
            const passPlatform = this.scene.platforms
              .getChildren()
              .find((p) => p.id === "pass");
            if (passPlatform && passPlatform.y !== this.scene.floorY - 190) {
              passPlatform.y -= 20; // Move it up by 150 pixels
              console.log(passPlatform.y);
              passPlatform.refreshBody();
            }
            if (id === "q5") {
              const voidPlatform = this.scene.platforms
                .getChildren()
                .find((p) => p.id === "void");
              if (voidPlatform) {
                voidPlatform.destroy();
              }
            }
          });
        } else {
          b.style.background = "#fee2e2";
          b.style.borderColor = "#ef4444";
          b.style.color = "#b91c1c";
          b.innerText = "❌ Incorrect. You lost 1 life.";
          this.scene.time.delayedCall(1200, () => {
            this.scene.currentScope.destroy();
            this.closeModal();
            this.scene.playerController.loseLife();
          });
        }
      };
      container.appendChild(b);
    });
    document.getElementById("modal").style.display = "flex";
  }

  closeModal() {
    document.getElementById("modal").style.display = "none";
    this.scene.physics.resume();
    this.scene.popupOpen = false;
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
