async function animationList(liste) {
  console.log(liste);
  for (let i = 0; i < liste.length; i++) {
    liste[i].classList.toggle("animate");
    liste[i].style.opacity = 1;
    await new Promise(r => setTimeout(r, 100));
  }
}


async function startMovie(){
  const iframe = document.getElementById('my-player');
  const cinema = document.getElementById('cinema');
  iframe.src = cinema.getAttribute("data-url");
  cinema.style.top = '0';
  document.querySelector("#player > div.jw-wrapper.jw-reset > div.jw-controls.jw-reset > div.jw-controlbar.jw-reset > div > div.jw-icon.jw-icon-inline.jw-button-color.jw-reset.jw-icon-playback").click()
}

function leaveMovie(){
  const cinema = document.getElementById('cinema');
  cinema.style.top = '-100vh';
  const iframe = document.getElementById('my-player');
  iframe.src = '';
}