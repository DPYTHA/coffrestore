const splashText = document.getElementById("splash-text");
const fullText = "PythAcademy";
let index = 0;

function showNextLetter() {
  if (index < fullText.length) {
    splashText.textContent += fullText[index];
    index++;
    setTimeout(showNextLetter, 150);
  } else {
    // Attendre un peu puis afficher la page d'accueil
    setTimeout(() => {
      document.getElementById("splash").style.display = "none";
      document.getElementById("home").classList.remove("hidden");
    }, 1000);
  }
}

window.onload = showNextLetter;
