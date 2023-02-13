"use strict";

/**
 * @type {HTMLCanvasElement}
 */
let ID;
const NR_PIXELI_MOV = 13; //nr de pixeli mutati
const NR_MAX_RACHETE = 3;
const LUNG_RACH = 50; //lungime racheta
const DURATA_RACHETA = 100; //cate frameuri o racheta exista
const DIM_VIATA = 100; //dimensiunea unei vieti
const TIMP_INVINCIBILITATE = 200;
const NR_VIETI = 3;
const TIMP_AFIS_MES = 150; //cat timp sa se afiseze un mesaj
const NR_PCT_REGENERARE_VT = 75; //cate puncte minime trebuie sa faca pt a primi o viata in plus

const culori = {
  roz_pal: "#b49594",
  albastru_inchis: "#0d1b2a",
  albastru: "#1b263b",
  albastru_deschis: "#415a77",
  bleu: "#778da9",
  semi_alb: "#e0e1dd",
};

const culoriAsteroizi = {
  4: "#e0e1dd",
  3: "#E0CBA8",
  2: "#778da9",
  1: "#b49594",
};

const fonturi = {
  font1: "monospace",
  font2: "candara",
};

const canvas = document.querySelector("canvas");
const context = canvas.getContext("2d");
//pentru responsiveness, astfel incat canvas-ul sa nu isi mai faca stretch automat pe dimensiunea pe care i-am dat-o eu in css
canvas.width = 0.85 * canvas.clientWidth * 3;
canvas.height = 0.8 * canvas.clientHeight * 3;

//functie pentru scriere de text
function scrieText(text, transparenta = 1, deplasare_jos = 0, dim_font = 6) {
  context.save();

  //centrare text
  context.textAlign = "center";
  context.textBaseline = "middle";
  context.globalAlpha = transparenta;
  context.fillStyle = culori.semi_alb;
  context.font = `${dim_font}rem ${fonturi.font2}`;
  context.fillText(text, canvas.width / 2, canvas.height / 2 + deplasare_jos);

  context.restore();
}

scrieText('Apasati "Start joc" pentru a incepe');

const btnPauza = document.querySelector(".pauzaJoc");
btnPauza.addEventListener("click", () => {
  cancelAnimationFrame(ID);
  btnPauza.classList.toggle("ascuns");
  btnContinua.classList.toggle("ascuns");
});

const btnContinua = document.querySelector(".continuaJoc");
btnContinua.addEventListener("click", () => {
  ID = requestAnimationFrame(rulare);
  btnContinua.classList.toggle("ascuns");
  btnPauza.classList.toggle("ascuns");
});

const startJoc = document.querySelector("#start-joc");

startJoc.addEventListener("click", () => {
  startJoc.classList.add("ascuns");
  btnPauza.classList.toggle("ascuns");
  //avand in vedere ca butonul de restart este acelasi cu butonul de start joc, in cazul in care numarul de vieti este 0, adica jocul s-a sfarsit, sa se dea reaload paginii pentru a putea reporni jocul cu toate variabilele setate corect
  if (nava.nr_vieti === 0) window.location.reload();
  rulare();
});

const btnX = document.querySelector(".btnX");
btnX.addEventListener("click", () => {
  const div = document.querySelector(".nume-utilizator");
  div.classList.add("ascuns");
  scoruri.actualizareTop();
});

const btnSalveaza = document.querySelector(".btnTrimite");
btnSalveaza.addEventListener("click", () => {
  const input = document.querySelector(".nume-utilizator input");
  const nume = input.value;
  if (nume.length < 2) alert("Numele nu poate fi mai mic de doua caractere!");
  else if (nume.length > 10)
    alert("Numele nu poate avea mai mult de 10 caractere!");
  else {
    nava.nume_jucator = nume;
    console.log(nava.nume_jucator);
    const div = document.querySelector(".nume-utilizator");
    div.classList.add("ascuns");
    scoruri.actualizareTop();
  }
});

function distantaPuncte(x1, x2, y1, y2) {
  return Math.sqrt(Math.pow(x1 - x2, 2) + Math.pow(y1 - y2, 2));
}

//elemente joc:
//1. NAVA
const nava = {
  x: canvas.width / 2,
  y: canvas.height / 2,
  dim: 50, //dimensiunea navei
  unghi: 0,
  rachete: [],
  nr_vieti: NR_VIETI,
  timp_inciv: TIMP_INVINCIBILITATE,
  nume_jucator: "Anonim",

  desenareNava() {
    context.save();

    context.strokeStyle = culori.semi_alb;
    context.lineWidth = 5;

    // mutare in functie de unghiul navei
    const radiani = this.unghi * (Math.PI / 180);
    context.translate(this.x, this.y);
    context.rotate(radiani);
    context.translate(-this.x, -this.y);

    context.beginPath();
    //x si y reprezinta mijlocul navei, de aceea, pentru a desena nava corect, scadem din y ceva pentru ca botul navei sa fie mai sus decat centrul navei
    context.moveTo(this.x, this.y - 1.5 * this.dim);
    context.lineTo(this.x - this.dim, this.y + this.dim);
    context.lineTo(this.x + this.dim, this.y + this.dim);
    context.closePath();
    context.stroke();

    context.restore();
  },

  //verificare margini canvas (daca nava a trecut de margini):
  verificareNava() {
    if (this.x - this.dim * 1.5 > canvas.width) this.x = 0 - 1.5 * this.dim;
    else if (this.x + this.dim * 1.5 < 0)
      this.x = canvas.width + 1.5 * this.dim;
    if (this.y - this.dim * 1.5 > canvas.height) this.y = 0 - 1.5 * this.dim;
    else if (this.y + this.dim * 1.5 < 0)
      this.y = canvas.height + 1.5 * this.dim;
  },

  //desenare numar vieti nava
  desenareVieti() {
    for (let i = 0; i < this.nr_vieti; i++) {
      context.save();

      context.strokeStyle = culori.semi_alb;
      context.lineWidth = 3;
      const margine = 15;
      context.beginPath();
      context.moveTo(i * DIM_VIATA + DIM_VIATA * 0.5, margine);
      context.lineTo(
        i * DIM_VIATA + DIM_VIATA * 0.25,
        margine + DIM_VIATA * 0.5
      );
      context.lineTo(i * DIM_VIATA + DIM_VIATA, margine + DIM_VIATA * 0.5);
      context.closePath();
      context.stroke();

      context.restore();
    }
  },

  //pozitionare nava pe centru si cu invincibilitate
  pozitionareNava() {
    this.timp_inciv = TIMP_INVINCIBILITATE;
    this.x = canvas.width / 2;
    this.y = canvas.height / 2;
    this.unghi = 0;
  },

  //verificare coliziune nava cu asteroizi
  verificareColiziuneNava() {
    for (let i = 0; i < nivele.asteroizi.length; i++) {
      const ast = nivele.asteroizi[i];
      // context.beginPath();
      // context.arc(this.x, this.y, nava.dim, 0, 2 * Math.PI, false);
      // context.fill();
      if (
        distantaPuncte(this.x, ast.x, this.y, ast.y) < this.dim + ast.r * 35 &&
        this.timp_inciv === 0
      ) {
        this.nr_vieti--;
        this.pozitionareNava();
      }
    }
  },

  desenareFoc() {
    const radiani = nava.unghi * (Math.PI / 180);

    context.save();

    const gradient = context.createLinearGradient(
      nava.x,
      nava.y + 1.8 * nava.dim,
      nava.x + 0.5 * nava.dim,
      nava.y + nava.dim
    );
    gradient.addColorStop(0, "rgba(255,100,0,0.6)");
    gradient.addColorStop(0.6, "rgba(255,0,0,0.6)");
    context.fillStyle = gradient;

    context.translate(nava.x, nava.y);
    context.rotate(radiani);
    context.translate(-nava.x, -nava.y);

    context.beginPath();
    context.moveTo(nava.x, nava.y + 1.8 * nava.dim);
    context.lineTo(nava.x - 0.5 * nava.dim, nava.y + nava.dim);
    context.lineTo(nava.x + 0.5 * nava.dim, nava.y + nava.dim);
    context.closePath();
    context.fill();

    context.restore();
  },
};

//2. RACHETA
class Racheta {
  constructor(x, y, unghi) {
    this.x = x;
    this.y = y;
    this.unghi = unghi;
    this.timp_viata = DURATA_RACHETA;
  }

  //verificare margini canvas (daca racheta a trecut de margini):
  verificareRacheta() {
    if (this.x - LUNG_RACH > canvas.width) this.x = 0;
    else if (this.x + LUNG_RACH < 0) this.x = canvas.width;
    if (this.y - LUNG_RACH > canvas.height) this.y = 0;
    else if (this.y + LUNG_RACH < 0) this.y = canvas.height;
  }

  desenareRacheta() {
    context.save();

    context.strokeStyle = culori.roz_pal;
    context.lineWidth = 7;

    // mutare in functie de unghiul navei
    context.translate(this.x, this.y);
    context.rotate(this.unghi * (Math.PI / 180));
    context.translate(-this.x, -this.y);

    context.beginPath();
    context.moveTo(this.x, this.y);
    context.lineTo(this.x, this.y - LUNG_RACH);
    context.stroke();

    context.restore();
  }
}

//3. ASTEROIZI
class Asteroid {
  // r - raza === nr de rachete necesare distrugerii asteroidului
  constructor() {
    this.r = (Math.floor(Math.random() * 10) % 4) + 1;
    this.x = (Math.random() * 10000) % canvas.width;
    this.y = (Math.random() * 10000) % canvas.height;
    this.traicX = Math.floor(Math.random() * 10) - 5; //cu cat se va modifica x
    this.traicY = Math.floor(Math.random() * 10) - 5; //cu cat se va modifica y
    this.viteza =
      (Math.floor(Math.random() * 10) % nivele.viteza_max_asteroid) + 0.1;
  }

  desenareAsteroid() {
    context.save();

    context.strokeStyle = culoriAsteroizi[this.r];
    context.lineWidth = 7;

    context.beginPath();
    context.arc(this.x, this.y, this.r * 35, 0, 2 * Math.PI, false);
    context.stroke();

    context.beginPath();
    context.textAlign = "center";
    context.textBaseline = "middle";
    context.fillStyle = culoriAsteroizi[this.r];
    context.font = `3rem ${fonturi.font2}`;
    context.fillText(this.r, this.x, this.y);

    context.restore();
  }

  //verificare margini canvas (daca asteroidul a trecut de margini):
  verificareAsteroid() {
    const raza = this.r * 35;
    if (this.x - raza > canvas.width) this.x = 0 - raza;
    else if (this.x + raza < 0) this.x = canvas.width + raza;
    if (this.y - raza > canvas.height) this.y = 0 - raza;
    else if (this.y + raza < 0) this.y = canvas.height + raza;
  }

  verificareColiziuneRacheta() {
    for (let i = 0; i < nava.rachete.length; i++) {
      const rac = nava.rachete[i];
      if (distantaPuncte(rac.x, this.x, rac.y, this.y) < this.r * 35) {
        this.r--;
        scoruri.scorActual += 5 - this.r;
        if (
          scoruri.scorActual > scoruri.nr_pct_regenerare_vt &&
          nava.nr_vieti < NR_VIETI
        ) {
          nava.nr_vieti++;
          scoruri.nr_pct_regenerare_vt += NR_PCT_REGENERARE_VT;
        }
        if (this.r === 0) {
          const index = nivele.asteroizi.indexOf(this);
          nivele.asteroizi.splice(index, 1);
        }
        nava.rachete.splice(i, 1);
      }
    }
  }
}

//4. NIVELE:
const nivele = {
  nrNivel: 0,
  nrAsteroizi: 2,
  viteza_max_asteroid: 0,
  asteroizi: [],
  timp_afis_nivel: TIMP_AFIS_MES, //nr de frameuri pt care se afiseaza ce nivel este
  introducereAsteroizi() {
    for (let z = 0; z < nivele.nrAsteroizi; z++)
      nivele.asteroizi.push(new Asteroid());
  },
};

//5. SCORURI:
const scoruri = {
  scorActual: 0,
  scoruriMaxime: [0, 0, 0, 0, 0],
  numeJucatori: ["", "", "", "", ""],
  nr_pct_regenerare_vt: NR_PCT_REGENERARE_VT,

  desenareScor() {
    context.save();

    context.textAlign = "center";
    context.textBaseline = "middle";
    context.fillStyle = culori.semi_alb;
    context.font = `3rem ${fonturi.font2}`;
    const masura = context.measureText(`Scor: ${this.scorActual}`);
    const margine = 50;
    context.fillText(
      `Scor: ${this.scorActual}`,
      canvas.width - masura.width,
      margine
    );

    context.restore();
  },
  initializareScoruriMaxime() {
    if (
      localStorage.getItem("scoruri_maxime") &&
      localStorage.getItem("nume_scoruri_maxime")
    ) {
      const scorurile = localStorage.getItem("scoruri_maxime").split(",");
      const nume = localStorage.getItem("nume_scoruri_maxime").split(",");
      for (let i = 0; i < scorurile.length; i++)
        this.scoruriMaxime[i] = Number.parseInt(scorurile[i]);
      this.numeJucatori = nume;
      console.log(this.numeJucatori, this.scoruriMaxime);

      //actualizare scoruri in html:
      const elemente = document.querySelectorAll("#scoruri-maxime li");
      for (let i = 0; i < scorurile.length; i++) {
        if (this.numeJucatori[i] !== "")
          elemente[i].innerText = `${i + 1}. ${this.numeJucatori[i]} : ${
            this.scoruriMaxime[i]
          } `;
      }
    }
  },
  verificareTop() {
    if (this.scorActual > this.scoruriMaxime[4]) {
      //jucatorul se afla in top 5
      const div = document.querySelector(".nume-utilizator");
      div.classList.remove("ascuns");
    }
  },
  actualizareTop() {
    let pozitie = 5;
    for (let i = 4; i >= 0; i--)
      if (this.scorActual > this.scoruriMaxime[i]) pozitie--;
    //inserare scor pe pozitia potrivita
    this.scoruriMaxime.splice(pozitie, 0, this.scorActual);
    this.numeJucatori.splice(pozitie, 0, nava.nume_jucator);
    console.log(this.numeJucatori);
    //stergere ultim scor
    this.scoruriMaxime.splice(5, 1);
    this.numeJucatori.splice(5, 1);
    //salvare in local storage
    localStorage.setItem("scoruri_maxime", this.scoruriMaxime);
    localStorage.setItem("nume_scoruri_maxime", this.numeJucatori);
  },
};

//verificare reload pagina pentru popularea sectiunii de scoruri maxime
window.addEventListener("load", () => {
  scoruri.initializareScoruriMaxime();
});

// APASARE BUTOANE
//pentru a putea apasa mai multe butoane in acelasi timp:
const butoaneApasate = {
  c: {
    apasat: false,
    functie() {
      nava.unghi -= NR_PIXELI_MOV * 0.3;
    },
  },
  z: {
    apasat: false,
    functie() {
      nava.unghi += NR_PIXELI_MOV * 0.3;
    },
  },
  ArrowUp: {
    apasat: false,
    functie() {
      const radiani = nava.unghi * (Math.PI / 180);
      nava.x += NR_PIXELI_MOV * Math.sin(radiani);
      nava.y -= NR_PIXELI_MOV * Math.cos(radiani);

      if (nava.timp_inciv === 0) nava.desenareFoc();
      else {
        //focul navei sa se deseneze doar la cate 13 frameuri
        if (nava.timp_inciv % 13 === 0) nava.desenareFoc();
      }
    },
  },
  ArrowDown: {
    apasat: false,
    functie() {
      const radiani = nava.unghi * (Math.PI / 180);
      nava.x -= NR_PIXELI_MOV * Math.sin(radiani);
      nava.y += NR_PIXELI_MOV * Math.cos(radiani);
    },
  },
  ArrowLeft: {
    apasat: false,
    functie() {
      const radiani = nava.unghi * (Math.PI / 180);
      nava.x -= NR_PIXELI_MOV * Math.cos(radiani);
      nava.y -= NR_PIXELI_MOV * Math.sin(radiani);
    },
  },
  ArrowRight: {
    apasat: false,
    functie() {
      const radiani = nava.unghi * (Math.PI / 180);
      nava.x += NR_PIXELI_MOV * Math.cos(radiani);
      nava.y += NR_PIXELI_MOV * Math.sin(radiani);
    },
  },
  x: {
    apasat: false,
    functie: function () {
      if (nava.rachete.length < NR_MAX_RACHETE) {
        const radiani = nava.unghi * (Math.PI / 180);
        nava.rachete.push(
          new Racheta(
            nava.x + 1.5 * nava.dim * Math.sin(radiani),
            nava.y - 1.5 * nava.dim * Math.cos(radiani),
            nava.unghi
          )
        );
      }
    },
  },
};

document.addEventListener("keydown", (ev) => {
  if (butoaneApasate[ev.key]) {
    butoaneApasate[ev.key].apasat = true;
    if (ev.key === "ArrowUp" || ev.key === "ArrowDown") ev.preventDefault();
  }
});

document.addEventListener("keyup", (ev) => {
  if (butoaneApasate[ev.key]) {
    butoaneApasate[ev.key].apasat = false;
  }
});

function miscaElemente() {
  Object.keys(butoaneApasate).forEach((cheie) => {
    butoaneApasate[cheie].apasat && butoaneApasate[cheie].functie();
  });
}

// RULARE:
function rulare() {
  context.clearRect(0, 0, canvas.width, canvas.height);
  if (nava.nr_vieti !== 0) {
    miscaElemente();
    nava.verificareNava();
    if (nava.timp_inciv === 0) nava.desenareNava();
    else {
      //nava sa se deseneze doar la cate 13 frameuri
      if (nava.timp_inciv % 13 === 0) nava.desenareNava();
      nava.timp_inciv--;
    }

    nava.verificareColiziuneNava();
    nava.desenareVieti();

    //desenare rachete
    for (let i = 0; i < nava.rachete.length; i++) {
      const rac = nava.rachete[i];
      rac.verificareRacheta();
      rac.desenareRacheta();
      rac.timp_viata--;
      if (rac.timp_viata % 2 === 0) {
        //racheta sa se miste doar la cate 2 frameuri
        const radiani = rac.unghi * (Math.PI / 180);
        rac.x += 1.5 * NR_PIXELI_MOV * Math.sin(radiani);
        rac.y -= 1.5 * NR_PIXELI_MOV * Math.cos(radiani);
      }
      if (rac.timp_viata === 0) {
        nava.rachete.splice(i, 1);
      }
      //daca nu faceam false pe apasat se tragea dintr-o singura apasare de 'x' toate rachetele disponibile
      butoaneApasate["x"].apasat = false;
    }

    if (nivele.asteroizi.length === 0) {
      //crestere nivel
      nivele.nrNivel++;
      nivele.nrAsteroizi++;
      nivele.viteza_max_asteroid += 0.5;
      nivele.introducereAsteroizi();
      nivele.timp_afis_nivel = TIMP_AFIS_MES;

      //modificare nava
      nava.pozitionareNava();
    } else if (nivele.timp_afis_nivel !== 0) {
      const pas_trasparenta = 1 / TIMP_AFIS_MES;
      scrieText(
        `Nivel ${nivele.nrNivel}`,
        pas_trasparenta * nivele.timp_afis_nivel
      );
      nivele.timp_afis_nivel--;
    }

    //desenare asteroizi
    for (let j = 0; j < nivele.asteroizi.length; j++) {
      const ast = nivele.asteroizi[j];
      ast.verificareColiziuneRacheta();
      ast.verificareAsteroid();
      ast.desenareAsteroid();
      ast.y += ast.traicX * ast.viteza;
      ast.x += ast.traicY * ast.viteza;
    }

    scoruri.desenareScor();

    ID = requestAnimationFrame(rulare);
    //astfel functia este apelata in continuu, realizandu-se animatia
  } else {
    //a murit
    if (!btnPauza.classList.contains("ascuns"))
      btnPauza.classList.add("ascuns");
    if (!btnContinua.classList.contains("ascuns"))
      btnContinua.classList.add("ascuns");
    scrieText("SFARSIT JOC");
    scrieText(`Scor obtinut: ${scoruri.scorActual}`, 1, 100, 4);
    scoruri.verificareTop();
    startJoc.textContent = "Restart";
    startJoc.classList.remove("ascuns");
  }
}
