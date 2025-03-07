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
        img.setAttribute("onclick", `window.location.href('film.html#${film.pathname.split("/")[4]}')`);
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
