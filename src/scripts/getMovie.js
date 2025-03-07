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

async function getOMDB(title, year) {
    try {
        const response = await fetch(`https://www.omdbapi.com/?t=${encodeURIComponent(title)}&y=${year}&apikey=41192fec`);
        const data = await response.json();
        return data;
    } catch (error) {
        console.error("Erreur lors de la requête :", error);
        return null;
    }
}

async function setActualFilm(){
    const hash = window.location.hash.substring(1); // Récupère le hash après le #
    film = await getMovie(`https://wodioz.com/538ga496mb/b/wodioz/${hash}`);
    document.getElementById("titre").innerHTML = film.titre;
    document.getElementById("sous-titre").innerHTML = film.annee+" • "+film.genre;
    document.getElementById("synopsis").innerHTML = film.synopsis;
    document.getElementById("cover").setAttribute("src", film.cover);
    document.getElementById("background").setAttribute("src", film.cover);
    getDominantColorFromImgElement(document.getElementById("cover"), (color) => {
        document.getElementById("play").style.backgroundColor = color.hsl;
    });
    if(!film.HD){
        document.getElementById("qualite").remove();
    }
    omdinfos = await getOMDB(film.titre, film.annee);
    if(omdinfos.Response == "True"){
        console.log(omdinfos.imdbRating);
        note = omdinfos.imdbRating;
        const noteCinq = (parseFloat(note) / 2).toFixed(1);
        const f = noteCinq.split('.').map(Number)[0];
        demi = Math.round(noteCinq-f) == 1 ? true : false;
        for(let i=0; i<f; i++){
            document.querySelectorAll("#note i")[i].classList.remove("bi-star");
            document.querySelectorAll("#note i")[i].classList.add("bi-star-fill");
        }
        if(demi){
            document.querySelectorAll("#note i")[f].classList.remove("bi-star");
            document.querySelectorAll("#note i")[f].classList.add("bi-star-half");
        }
    }else{
        document.getElementById("note").remove();
    }
}

function getDominantColorFromImgElement(imgElement, callback) {
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");

    // On s'assure que l'image est bien chargée
    if (imgElement.complete) {
        processImage();
    } else {
        imgElement.onload = processImage;
    }

    function processImage() {
        canvas.width = imgElement.naturalWidth;
        canvas.height = imgElement.naturalHeight;

        // Dessine l'image sur le canvas
        ctx.drawImage(imgElement, 0, 0, canvas.width, canvas.height);

        // Récupère les données des pixels de l'image
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height).data;

        const colorCounts = {};
        let maxCount = 0;
        let dominantRGB = "";

        // Analyse des pixels (échantillonnage tous les 10 pixels pour optimiser)
        for (let i = 0; i < imageData.length; i += 4 * 10) {
            const r = imageData[i];
            const g = imageData[i + 1];
            const b = imageData[i + 2];

            const rgb = `${r},${g},${b}`;

            colorCounts[rgb] = (colorCounts[rgb] || 0) + 1;

            if (colorCounts[rgb] > maxCount) {
                maxCount = colorCounts[rgb];
                dominantRGB = rgb;
            }
        }

        // Convertir RGB en HSL
        const rgbValues = dominantRGB.split(',').map(Number);
        const hsl = rgbToHsl(rgbValues[0], rgbValues[1], rgbValues[2]);

        callback({
            hsl: `hsl(${hsl.h}, 80%, 50%)`
        });
    }

    // Fonction pour convertir RGB en HSL
    function rgbToHsl(r, g, b) {
        r /= 255;
        g /= 255;
        b /= 255;

        const max = Math.max(r, g, b);
        const min = Math.min(r, g, b);
        let h, s, l = (max + min) / 2;

        if (max === min) {
            h = s = 0; // achromatic
        } else {
            const d = max - min;
            s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
            switch (max) {
                case r:
                    h = (g - b) / d + (g < b ? 6 : 0);
                    break;
                case g:
                    h = (b - r) / d + 2;
                    break;
                case b:
                    h = (r - g) / d + 4;
                    break;
            }
            h /= 6;
        }

        return {
            h: Math.round(h * 360),
            s: Math.round(s * 100),
            l: Math.round(l * 100)
        };
    }
}
