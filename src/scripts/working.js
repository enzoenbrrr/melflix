async function animationList(liste) {
  console.log(liste);
  for (let i = 0; i < liste.length; i++) {
    liste[i].classList.toggle("animate");
    liste[i].style.opacity = 1;
    await new Promise(r => setTimeout(r, 100));
  }
}





