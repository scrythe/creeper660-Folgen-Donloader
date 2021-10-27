document.querySelector('.download-episodes-div').innerHTML = sessionStorage.getItem('episodeDataLi');
document.querySelector('.download-episodes-div').classList.add("active");
document.querySelector('.download-episodes').classList.add("active");

//send request to download selected episodes

async function downloadepisodes(allToDownloadEpisodesData) {
    const response = await window.api.doAction("download-anime-episodes", allToDownloadEpisodesData);
    console.log(response);
}

document.querySelector('.download-episodes').addEventListener('click', () => {
    let allToDownloadEpisodes = Object.values(document.querySelectorAll('.download-episodes-div ul li'));
    let allToDownloadEpisodesData = allToDownloadEpisodes.map(episode => {
        return [episode.getAttribute('episodenepisodelink'), episode.querySelector('strong').innerHTML];
    })
    console.log(allToDownloadEpisodesData);
    document.querySelector('.download-episodes').classList.remove('active');
    downloadepisodes(allToDownloadEpisodesData);
})

window.api.receive('update-episode-progress fromMain', episodeData => {
    document.querySelector(`[currentEpisode="${episodeData[0]}"] span`).innerHTML = `${episodeData[1]}`;
});