//declaring all the variables

const searchWrapper = document.querySelector('.search-wrapper');
const searchInputBox = searchWrapper.querySelector('.search-for-animename .search-for-animename-input');
const searchResults = searchWrapper.querySelector('.search-for-animename-results ul');
const allAnimesUl = document.querySelector('.search-for-animename-results ul');

allAnimesUl.addEventListener('click', clickedAnime);

//search for anime

function showAnimeList(list) {
    let listData;
    if (!list.length) {
        failedSearchValue = inputBsearchInputBoxox.value;
        listData = `<li>${failedSearchValue}</li>`
    } else {
        listData = list.join('');
    }
    searchResults.innerHTML = listData;
}

//if clicked get data from anime

function clickedAnime(evt) {
    const anime = evt.target;
    if (anime.tagName != 'LI') return;
    if (anime.hasAttribute('anime')) {
        var animename = anime.getAttribute('anime');
        var animeUrl = `https://anicloud.io/anime/stream/${animename}`;
        var animeName = anime.innerText;
        console.log(animeUrl);  
        sessionStorage.setItem('anime', JSON.stringify({animeUrl: animeUrl, animeName: animeName}));
        window.location.href = "anime.html";
    } else {
        console.log(`anime ${anime.innerHTML} doesn't exist`)
    }
}

allAnimes = animedatas.map(animedata => {
    return `<li anime='${animedata.animesearchname}'>${animedata.animename}</li>`;
})

searchInputBox.addEventListener('keyup', (e) => {
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

searchResults.innerHTML = allAnimes.join('');