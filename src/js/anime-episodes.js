//get seasons and episodes of anime and hide searchbox

async function loadAnimeData() {
    let animeData = JSON.parse(sessionStorage.getItem('anime'));
    let animeUrl = animeData['animeUrl'];
    let animeName = animeData['animeName'];
    const response = await window.api.doAction("get-anime-episode-data", [animeUrl, animeName]);
    document.querySelector('.staffeln-auswahl').innerHTML = response.seasonsHTML;
    document.querySelector('.episoden-auswahl').innerHTML = response.episodesHTML;
    document.querySelector('.staffeln-auswahl ul').addEventListener('click', seasonClick);
    document.querySelector('.staffeln-auswahl').classList.add("active");
    document.querySelector('.episoden-auswahl').classList.add("active");
    document.querySelector('.episoden-auswahl').addEventListener('click', episodeClick);
    document.querySelector('.ganze-staffe-auswählen').addEventListener('click', ganzeStaffeAuswaehlen);
    document.querySelector('.go-to-format').addEventListener('click', goToFormat);
    document.querySelector('.go-to-format').classList.add("active");
}

loadAnimeData();

//if clicked on season show it's specific episodes

function seasonClick(evt) {
    var season = evt.target;
    if (season.tagName != 'A') return;
    if (season.hasAttribute('season')) {
        document.querySelectorAll('.staffeln-auswahl ul a').forEach(element => {
            element.classList.remove("selected");
        });
        season.classList.add("selected");
        var seasonNumber = season.getAttribute('season');
        document.querySelectorAll('.episoden-auswahl ul').forEach(element => {
            element.classList.remove("active");
        });
        document.querySelector(`.episoden-auswahl [episodeSeason="${seasonNumber}"]`).classList.add('active');
    }
}

// if clicked on episode, make it selected

function episodeClick(evt) {
    let clickedItem = evt.target;
    if (clickedItem.classList.contains('checkmark')) return;
    let clickedListItem = clickedItem.closest('li');
    let checkbox = clickedListItem.querySelector('.checkbox input');
    if (checkbox.tagName != 'INPUT') return;
    let episodeListItem = checkbox.parentElement.parentElement;
    if (episodeListItem.classList.contains("selected")) {
        episodeListItem.classList.remove("selected");
        checkbox.checked = false;
    } else {
        episodeListItem.classList.add("selected");
        checkbox.checked = true;
    }
}

function goToFormat() {
    let selectedEpisodes = Object.values(document.querySelectorAll('.episoden-auswahl ul li.selected'));
    let allselectedEpisodes = selectedEpisodes.map(episode => {
        return {episodenEpisodeLink: episode.getAttribute('episodenepisodelink'), episodenName: episode.getAttribute('episodenname'), animeName: episode.getAttribute('animename'), staffelZahl: episode.getAttribute('staffelzahl'), episodenZahl: episode.getAttribute('episodenzahl')};
    });
    sessionStorage.setItem('animeEpisodesData', JSON.stringify(allselectedEpisodes));
    window.location.href = "format.html";
}

function ganzeStaffeAuswaehlen() {
    let selectedUl = document.querySelector('.episoden-auswahl ul.active');
    let selectedLis = selectedUl.querySelectorAll('li.selected');
    let episodesLis = selectedUl.querySelectorAll('li');
    if (selectedLis.length != episodesLis.length) {
        episodesLis.forEach(element => {
            element.classList.add('selected');
            element.querySelector('.checkbox input').checked = true;
        })
    } else {
        episodesLis.forEach(element => {
            element.classList.remove('selected');
            element.querySelector('.checkbox input').checked = false;
        })
    }
}