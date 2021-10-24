document.querySelector('.file-format-wrapper').classList.add("active");

setTimeout(() => {
    document.querySelectorAll('.dropdown-included ul li').forEach(element => {
        element.classList.remove('selected');
        element.querySelector('.checkbox input').checked = false;
    })
}, 200);

//update format if it got changed

function updateFormat() {
    var allSelectedFormats = document.querySelectorAll('.dropdown-included ul li.selected');
    var allSelectedFormatsText = Object.keys(allSelectedFormats).map(format => {
        return allSelectedFormats[format].getAttribute('format');
    });
    var allSelectedFormatsText = allSelectedFormatsText.join('');
    document.querySelector('.format').innerHTML = allSelectedFormatsText;
    dragging();
}

//function for dragging

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

//show example of the format

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
    document.querySelector('.format-example').innerHTML = allFormats;
}

//show all episodes in the format its getting renamed/downloaded...

function episodeData() {
    let formats = Object.values(document.querySelectorAll('.format .draggable'));
    let allselectedEpisodes = JSON.parse(sessionStorage.getItem('animeEpisodesData'));
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
    let clickedItem = evt.target;
    if (clickedItem.classList.contains('checkmark')) return;
    let clickedListItem = clickedItem.closest('li');
    let checkbox = clickedListItem.querySelector('.checkbox input');
    if (checkbox.tagName != 'INPUT') return;
    let includeFormatLi = checkbox.parentElement.parentElement;
    if (includeFormatLi.classList.contains('selected')) {
        includeFormatLi.classList.remove('selected');
        checkbox.checked = false;
    } else {
        includeFormatLi.classList.add('selected');
        checkbox.checked = true;
    }
    if (checkbox.checked) {
        document.querySelector('.dropdown-choose').classList.add("active")
    }
    updateFormat();
    formatexample();
});

document.querySelector('.continue-format').addEventListener('click', () => {
    var episodeDataLi = episodeData();
    sessionStorage.setItem('episodeDataLi', episodeDataLi);
    window.location.href = "download.html";
})