const searchWrapper = document.querySelector('.search-wrapper');
const inputBox = searchWrapper.querySelector('.search-for-animename .search-for-animename-input');
const searchResults = searchWrapper.querySelector('.search-for-animename-results ul')

inputBox.addEventListener('keyup', (e) => {
    let animeSearchStr = e.target.value;
    let emptyArray = [];
    if (animeSearchStr) {
        emptyArray = animedatas.filter(data => {
            return data.animename.toLowerCase().startsWith(animeSearchStr.toLowerCase());
        })
        emptyArray = emptyArray.map(data => {
            return data = `<li anime='${data.animesearchname}'>${data.animename}</li>`;
        })
        showAnimeList(emptyArray);
    } else {
        searchResults.innerHTML = allAnimes.join('');
    }
})

function showAnimeList(list) {
    let listData;
    if (!list.length) {
        failedSearchValue = inputBox.value;
        listData = `<li>${failedSearchValue}</li>`
    } else {
        listData = list.join('');
    }
    searchResults.innerHTML = listData;
}

const allAnimesUl = document.querySelector('.search-for-animename-results ul');
allAnimesUl.addEventListener('click', clickedAnime)

allAnimes = animedatas.map(animedata => {
    return `<li anime='${animedata.animesearchname}'>${animedata.animename}</li>`;
})

searchResults.innerHTML = allAnimes.join('');

function clickedAnime(evt) {
    const anime = evt.target;
    if (anime.tagName != 'LI') return;
    if (anime.hasAttribute('anime')) {
        var animename = anime.getAttribute('anime');
        var animeUrl = `https://anicloud.io/anime/stream/${animename}`;
        var animeName = anime.innerText;
        console.log(animeUrl);  
        loadAnimeData(animeUrl, animeName);
    } else {
        console.log(`anime ${anime.innerHTML} doesn't exist`)
    }
}

async function loadAnimeData(animeUrl, animeName) {
    searchWrapper.classList.remove("active");
    const response = await window.api.doAction("get-anime-episode-data", [animeUrl, animeName]);
    console.log(response.episodesHTML);
    document.querySelector('.staffeln-auswahl').innerHTML = response.seasonsHTML;
    document.querySelector('.episoden-auswahl').innerHTML = response.episodesHTML;
    document.querySelector('.staffeln-auswahl ul').addEventListener('click', seasonClick);
    document.querySelector('.staffeln-auswahl').classList.add("active");
    document.querySelector('.episoden-auswahl').classList.add("active");
    document.querySelector('.episoden-auswahl').addEventListener('click', episodeClick);
    document.querySelector('.go-to-format').classList.add("active");
}

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

function episodeClick(evt) {
    var checkbox = evt.target;
    if (checkbox.tagName != 'INPUT') return;
    var episodeListItem = checkbox.parentElement.parentElement;
    if (episodeListItem.classList.contains("selected") && !checkbox.checked) {
        episodeListItem.classList.remove("selected");
    } else {
        episodeListItem.classList.add("selected");
    }
}

document.querySelector('.go-to-format').addEventListener('click', () => {
    document.querySelector('.episoden-auswahl').classList.remove("active");
    document.querySelector('.staffeln-auswahl').classList.remove("active");
    document.querySelector('.go-to-format').classList.remove("active");
    document.querySelector('.file-format-wrapper').classList.add("active");
})

document.querySelector('.download-episodes').addEventListener('click', () => {
    var allToDownloadEpisodes = Object.values(document.querySelectorAll('.download-episodes-div ul li'));
    var allToDownloadEpisodesData = allToDownloadEpisodes.map(episode => {
        return [episode.getAttribute('episodenepisodelink'), episode.innerText];
    })
    console.log(allToDownloadEpisodesData);
    document.querySelector('.download-episodes-div').classList.remove("active");
    document.querySelector('.download-episodes').classList.remove('active');
    downloadepisodes(allToDownloadEpisodesData);
})

async function downloadepisodes(allToDownloadEpisodesData) {
    const response = await window.api.doAction("download-anime-episodes", allToDownloadEpisodesData);
    console.log(response);
    searchWrapper.classList.add("active");
}

document.querySelector('.dropdown-included').addEventListener('click', (evt) => {
    if (!document.querySelector('.dropdown-included ul').classList.contains('show')) {
        document.querySelector('.dropdown-included ul').classList.add("show");
    } else if (document.querySelector('.dropdown-included ul').classList.contains('show') && (evt.target == document.querySelector('.dropdown-included') || evt.target == document.querySelector('.dropdown-included p'))) {
        document.querySelector('.dropdown-included ul').classList.remove("show");
    }
    evt.stopPropagation();
})

window.onclick = function(event) {
    if (!event.target.matches('.dropdown-included')) {
        if (document.querySelector('.dropdown-included ul').classList.contains('show')) {
            document.querySelector('.dropdown-included ul').classList.remove('show');
        }
    }
}

document.querySelector('.dropdown-included ul').addEventListener('click', (evt) => {
    // var includeFormat = evt.target;
    // var includeFormatLi = includeFormat.closest('li');
    var checkbox = evt.target;
    if (checkbox.tagName != 'INPUT') return;
    var includeFormatLi = checkbox.parentElement.parentElement;
    // if (includeFormatLi.parentElement.parentElement.classList.contains('dropdown-included')) {}
    if (includeFormatLi.classList.contains('selected') && !checkbox.checked) {
        includeFormatLi.classList.remove('selected');
    } else {
        includeFormatLi.classList.add('selected');
    }
    if (checkbox.checked) {
        document.querySelector('.dropdown-choose').classList.add("active")
    }
    updateFormat();
    formatexample();
});

function updateFormat() {
    var allSelectedFormats = document.querySelectorAll('.dropdown-included ul li.selected');
    var allSelectedFormatsText = Object.keys(allSelectedFormats).map(format => {
        return allSelectedFormats[format].getAttribute('format');
    });
    var allSelectedFormatsText = allSelectedFormatsText.join('');
    document.querySelector('.format').innerHTML = allSelectedFormatsText;
    dragging();
}

function dragging() {
    const formatContainer = document.querySelector('.format');
    const draggables = document.querySelectorAll('.draggable');
    draggables.forEach(draggable => {
        draggable.addEventListener('dragstart', () => {
            draggable.classList.add('dragging');
        })

        draggable.addEventListener('dragend', () => {
            draggable.classList.remove('dragging');
            formatexample();
        })
    })
    formatContainer.addEventListener('dragover', e => {
        e.preventDefault();
        const afterElement = getDragAfterElement(formatContainer, e.clientX)
        const dragable = document.querySelector('.dragging');
        if (afterElement == null) {
            formatContainer.appendChild(dragable);
        } else {
            formatContainer.insertBefore(dragable, afterElement);
        }
    });
}

function getDragAfterElement(container, x) {
    const draggableElements = [...container.querySelectorAll('.draggable:not(.dragging)')];
    return draggableElements.reduce((closest, child) => {
        const box = child.getBoundingClientRect();
        const offset = x - box.left - box.width / 2;
        if (offset < 0 && offset > closest.offset) {
            return { offset: offset, element: child }
        } else {
            return closest;
        }
    }, { offset: Number.NEGATIVE_INFINITY }).element
}

function formatexample() {
    var episodenZahl = 1;
    var staffelZahl = 1;
    var animeName = "Hunter x Hunter";
    var episodenName = "Departure x And x Friends";
    var formats = document.querySelectorAll('.format .draggable');
    var allFormats = Object.keys(formats).reduce((wholeFormats, format) => {
        var format = formats[format];
        if (format.tagName == 'INPUT') {
            return `${wholeFormats}${format.value}`;
        } else {
            return `${wholeFormats}${eval(format.getAttribute('variable'))}`;
        }
    }, ``);
    // var allFormats = allFormats.map(formatli => {
    //     return ``;
    // })
    document.querySelector('.format-example').innerHTML = allFormats;
}

function episodeData() {
    var selectedEpisodes = Object.values(document.querySelectorAll('.episoden-auswahl ul li.selected'));
    var formats = Object.values(document.querySelectorAll('.format .draggable'));
    var allselectedEpisodes = selectedEpisodes.map(episode => {
        return {episodenEpisodeLink: episode.getAttribute('episodenepisodelink'), episodenName: episode.getAttribute('episodenname'), animeName: episode.getAttribute('animename'), staffelZahl: episode.getAttribute('staffelzahl'), episodenZahl: episode.getAttribute('episodenzahl')};
    });
    var eachEpisode = allselectedEpisodes.map(episode => {
        var episodenEpisodeLink = episode.episodenEpisodeLink;
        var episodenName = episode.episodenName;
        var animeName = episode.animeName;
        var staffelZahl = episode.staffelZahl;
        var episodenZahl = episode.episodenZahl;
        var allFormats = formats.reduce((wholeFormats, format) => {
            if (format.tagName == 'INPUT') {
                return `${wholeFormats}${format.value}`;
            } else {
                return `${wholeFormats}${eval(format.getAttribute('variable'))}`;
            }
        }, ``);
        return `<li episodenepisodelink='${episodenEpisodeLink}'>${allFormats}</li>`;
    });
    var eachEpisode = eachEpisode.join('');
    return `<ul>${eachEpisode}</ul>`;
}

document.querySelector('.continue-format').addEventListener('click', () => {
    var episodeDataLi = episodeData();
    document.querySelector('.file-format-wrapper').classList.remove("active");
    document.querySelector('.download-episodes-div').innerHTML = episodeDataLi;
    document.querySelector('.download-episodes-div').classList.add("active");
    document.querySelector('.download-episodes').classList.add("active");
    // document.querySelector('.download-episodes').classList.remove('active');
    // downloadepisodes(allSelectedEpisodesLinks);
})