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

async function closeMenu(){
  const menu = document.getElementById('menu');
  const background = document.getElementById('background-blured');
  menu.style.transform = "translateX(-100%)";
  background.style.opacity = 0;
  await new Promise(r => setTimeout(r, 500));
  background.style.zIndex = '-1';
}

function openMenu(){
  const menu = document.getElementById('menu');
  const background = document.getElementById('background-blured');
  background.style.zIndex = '1001';
  background.style.opacity = 1;
  menu.style.transform = "translateX(0%)";
}

