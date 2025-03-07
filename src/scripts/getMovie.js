async function getMovie(url) {
    try {
        const response = await fetch(url, {method: 'GET'});
        const html = await response.text();
        const parser = new DOMParser();
        const doc = parser.parseFromString(html, 'text/html');
        const titre = doc.querySelectorAll('p')[5];
        const annee = doc.head.querySelector('title').textContent;
        const synopsis = doc.querySelectorAll('p')[2];
        const cover = doc.querySelectorAll('p img')[0].src;
        const anneeMatch = annee.match(/\((\d{4})\)/);
        const anneeOnly = anneeMatch ? anneeMatch[1] : null;
        const genreElement = doc.querySelectorAll('.categoryt')[2];
        console.log(doc);
        const genre = genreElement ? genreElement.innerText.charAt(0).toUpperCase() + genreElement.innerText.slice(1).toLowerCase() : null;
        const video = doc.querySelector("iframe").src;
        if(doc.querySelectorAll('b')[15].innerText.split(')')[1].includes("HD")){
            HD = true;
        }

        return {
            titre: titre ? titre.textContent.replace(/\n/g, '') : null,
            annee: anneeOnly,
            genre: genre,
            synopsis: synopsis ? synopsis.textContent.replace(/\n/g, '') : null,
            cover: cover ? cover : null,
            video: video ? video : null,
            HD: HD ? HD : false
        };
    } catch (err) {
        console.error(err);
        return null;
    }
}

async function getAffiche(page) {
    try {
        const response = await fetch(`https://wodioz.com/538ga496mb/c/wodioz/29/${page}`, {method: 'GET'});
        const html = await response.text();
        const parser = new DOMParser();
        const doc = parser.parseFromString(html, 'text/html');
        return doc.querySelectorAll('#hann a');
    } catch (err) {
        console.error(err);
        return null;
    }
}

async function addToAffiche(page){
    films = await getAffiche(page);
    films.forEach(async film => {
        filmInfos = await getMovie(`https://wodioz.com${film.pathname}`);
        cover = filmInfos.cover;
        
        div = document.createElement("div");
        div.classList.add("film");
        img =document.createElement("img");
        img.setAttribute("onclick", `window.location.replace('film.html#${film.pathname.split("/")[4]}')`);
        img.setAttribute("src", cover);
        label = document.createElement("label");
        label.innerHTML = film.textContent.split("(")[0] + "<br><p>" + film.textContent.split("(")[1].split(")")[0] + "</p>";
        div.appendChild(img);
        div.appendChild(label);
        document.getElementById("films").appendChild(div);
    });
}

async function setActualFilm(){
    const hash = window.location.hash.substring(1); // Récupère le hash après le #
    film = await getMovie(`https://wodioz.com/538ga496mb/b/wodioz/${hash}`);
    document.getElementById("titre").innerHTML = film.titre;
    document.getElementById("sous-titre").innerHTML = film.annee+" • "+film.genre;
    document.getElementById("synopsis").innerHTML = film.synopsis;
    document.getElementById("cover").setAttribute("src", film.cover);
    document.getElementById("background").setAttribute("src", film.cover);
    if(!film.HD){
        document.getElementById("qualite").remove();
    }
    document.getElementById("play").style.backgroundColor = `hsl(${await getDominantColor(film.cover)}deg, 50%, 60%)`;
}

async function getDominantColor(imageUrl) {
    const img = document.createElement('img');
    img.crossOrigin = 'Anonymous';
    img.src = imageUrl;
    await img.decode();

    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');
    canvas.width = img.width;
    canvas.height = img.height;
    context.drawImage(img, 0, 0, img.width, img.height);

    const imageData = context.getImageData(0, 0, img.width, img.height);
    const data = imageData.data;
    const colorCount = {};
    let dominantColor = '';
    let maxCount = 0;

    for (let i = 0; i < data.length; i += 4) {
        const rgb = `${data[i]},${data[i + 1]},${data[i + 2]}`;
        colorCount[rgb] = (colorCount[rgb] || 0) + 1;
        if (colorCount[rgb] > maxCount) {
            maxCount = colorCount[rgb];
            dominantColor = rgb;
        }
    }

    const [r, g, b] = dominantColor.split(',').map(Number);
    const hsv = rgbToHsv(r, g, b);
    return hsv;
}

function rgbToHsv(r, g, b) {
    r /= 255;
    g /= 255;
    b /= 255;

    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    const delta = max - min;

    let h = 0;
    let s = 0;
    const v = max;

    if (max !== 0) {
        s = delta / max;
    }

    if (delta !== 0) {
        if (max === r) {
            h = (g - b) / delta + (g < b ? 6 : 0);
        } else if (max === g) {
            h = (b - r) / delta + 2;
        } else {
            h = (r - g) / delta + 4;
        }
        h /= 6;
    }

    return Math.round(h * 360);
}

