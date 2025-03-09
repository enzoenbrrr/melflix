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

async function getAffiche(page, id=false) {
    try {
        if(id){
            response = await fetch(`https://wodioz.com/538ga496mb/c/wodioz/${id}/${page}`, {method: 'GET'});
        }else{
            response = await fetch(`https://wodioz.com/538ga496mb/c/wodioz/29/${page}`, {method: 'GET'});
        }
        const html = await response.text();
        const parser = new DOMParser();
        const doc = parser.parseFromString(html, 'text/html');
        const films = Array.from(doc.querySelectorAll('#hann a')).map(element => ({
            pathname: element.pathname,
            innerText: element.innerText
        }));
        const filmsJSON = JSON.stringify(films);
        localStorage.setItem('films-'+id+'-'+page, filmsJSON);
        return doc.querySelectorAll('#hann a');
    } catch (err) {
        console.error(err);
        return null;
    }
}

async function addToAffiche(page, cate=false,animate=false) {
    now = Date.now();
    j = 86400000 

    if(now - Number(localStorage.getItem("lastLoad-"+cate+'-'+page))< j){
        console.log("from cache");
        const filmsJSON = localStorage.getItem('films-'+cate+'-'+page);
        const films = JSON.parse(filmsJSON);
        films.forEach(async film => {
            if(localStorage.getItem("cover-"+film.pathname)){
                cover = localStorage.getItem("cover-"+film.pathname);
            }else{
                filmInfos = await getMovie(`https://wodioz.com${film.pathname}`);
                cover = filmInfos.cover;
                localStorage.setItem("cover-"+film.pathname, cover);
            }
            
            div = document.createElement("div");
            div.classList.add("film");
            img =document.createElement("img");
            img.setAttribute("onclick", `window.location.href = 'film.html#${film.pathname.split("/")[4]}'`);
            img.setAttribute("src", cover);
            img.setAttribute("loading", "lazy");
            label = document.createElement("label");
            label.innerHTML = film.innerText.split("(")[0] + "<br><p>" + film.innerText.split("(")[1].split(")")[0] + "</p>";
            div.appendChild(img);
            div.appendChild(label);
            document.getElementById("films").appendChild(div);
            if(animate){
                animationList([div]);
            }
        });
    }else{
        console.log("from fetch");
        localStorage.setItem("lastLoad-"+cate+'-'+page, now);
        films = await getAffiche(page, cate);
        films.forEach(async film => {
            if(localStorage.getItem(film.pathname.split("/")[4])+"-cover"){
                cover = localStorage.getItem(film.pathname.split("/")[4] + "-cover");
            }else{
                filmInfos = await getMovie(`https://wodioz.com${film.pathname}`);
                cover = filmInfos.cover;
                localStorage.setItem(film.pathname.split("/")[4] + "-cover", cover);
            }
            
            div = document.createElement("div");
            div.classList.add("film");
            img =document.createElement("img");
            img.setAttribute("onclick", `window.location.href = 'film.html#${film.pathname.split("/")[4]}'`);
            img.setAttribute("src", cover);
            img.setAttribute("loading", "lazy");
            label = document.createElement("label");
            label.innerHTML = film.textContent.split("(")[0] + "<br><p>" + film.textContent.split("(")[1].split(")")[0] + "</p>";
            div.appendChild(img);
            div.appendChild(label);
            document.getElementById("films").appendChild(div);
            if(animate){
                animationList([div]);
            }
        });
    }
    
    
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
    const filmId = window.location.hash.substring(1);
    film = await getMovie(`https://wodioz.com/538ga496mb/b/wodioz/${filmId}`);
    if(localStorage.getItem(filmId+"-cover")){
        console.log("from cache");
        film_cover = localStorage.getItem(filmId+"-cover");
        film_titre = localStorage.getItem(filmId+"-titre");
        film_genre = localStorage.getItem(filmId+"-genre");
        film_annee = localStorage.getItem(filmId+"-annee");
        film_synopsis = localStorage.getItem(filmId+"-synopsis");
        film_video = localStorage.getItem(filmId+"-video");
        film_HD = localStorage.getItem(filmId+"-HD");

        document.getElementById("titre").innerHTML = film_titre;
        document.getElementById("sous-titre").innerHTML = film_annee+" • "+film_genre;
        document.getElementById("synopsis").innerHTML = film_synopsis;
        document.getElementById("cover").setAttribute("src", film_cover);
        document.getElementById("cinema").setAttribute("data-url", film_video);
        if(film_HD == 'false'){
            document.getElementById("qualite").remove();
        }
        note = localStorage.getItem(filmId+"-note");
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
        console.log("from fetch");
        film = await getMovie(`https://wodioz.com/538ga496mb/b/wodioz/${filmId}`);
        document.getElementById("titre").innerHTML = film.titre;
        document.getElementById("sous-titre").innerHTML = film.annee+" • "+film.genre;
        document.getElementById("synopsis").innerHTML = film.synopsis;
        document.getElementById("cover").setAttribute("src", film.cover);
        document.getElementById("cinema").setAttribute("data-url", film.video);
        localStorage.setItem(filmId+"-HD", 'true');
        if(!film.HD){
            document.getElementById("qualite").remove();
            localStorage.setItem(filmId+"-HD", "false");
        }
        localStorage.setItem(filmId+"-cover", film.cover);
        localStorage.setItem(filmId+"-titre", film.titre);
        localStorage.setItem(filmId+"-genre", film.genre);
        localStorage.setItem(filmId+"-annee", film.annee);
        localStorage.setItem(filmId+"-synopsis", film.synopsis);
        localStorage.setItem(filmId+"-video", film.video);
        omdinfos = await getOMDB(film.titre, film.annee);
        if(omdinfos.Response == "True" && omdinfos.imdbRating != "N/A"){
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
        localStorage.setItem(filmId+"-note", note);
    }


    
}


async function getLast() {
    try {
        const response = await fetch(`https://wodioz.com/538ga496mb/home/wodioz`, {method: 'GET'});
        const html = await response.text();
        const parser = new DOMParser();
        const doc = parser.parseFromString(html, 'text/html');
        return doc.querySelectorAll('#hann a');
    } catch (err) {
        console.error(err);
        return null;
    }
}

async function addToLast(){
    films = await getLast();
    await films.forEach(async film => {
        filmInfos = await getMovie(`https://wodioz.com${film.pathname}`);
        cover = filmInfos.cover;
        
        div = document.createElement("div");
        div.classList.add("film");
        div.classList.add("film-alive");
        img =document.createElement("img");
        img.setAttribute("onclick", `window.location.href = 'film.html#${film.pathname.split("/")[4]}'`);
        img.setAttribute("src", cover);
        label = document.createElement("label");
        label.innerHTML = film.textContent.split("(")[0] + "<br><p>" + film.textContent.split("(")[1].split(")")[0] + "</p>";
        div.appendChild(img);
        div.appendChild(label);
        document.getElementById("films").appendChild(div);
        div.classList.add("animate");
    });
}

async function animationList(liste) {
    for (let i = 0; i < liste.length; i++) {
      liste[i].classList.toggle("animate");
      liste[i].style.opacity = 1;
      await new Promise(r => setTimeout(r, 100));
    }
  }
  

async function loadMore(which, cate=false){
    try {
        if(cate){
            await addToAffiche(which, cate, true);}
        else{
            await addToAffiche(which, false, true);
        }
        document.getElementById("load-more").setAttribute("onclick", `loadMore(${which+1}, ${cate})`);
    } catch (err) {
        document.getElementById("load-more").remove();
        return null;
    }
}
