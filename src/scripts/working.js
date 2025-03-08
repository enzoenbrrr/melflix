async function animationList(liste) {
  console.log(liste);
  for (let i = 0; i < liste.length; i++) {
    liste[i].classList.toggle("animate");
    liste[i].style.opacity = 1;
    await new Promise(r => setTimeout(r, 100));
  }
}

document.addEventListener("wheel", async (event) => {
  if (window.scrollY < window.innerHeight && event.deltaY > 0) {
    event.preventDefault();
    window.scrollTo({
      top: window.innerHeight,
      behavior: "smooth",
    });
  } else if (window.scrollY <= window.innerHeight && event.deltaY < 0) {
    event.preventDefault();
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }
}, { passive: false });



