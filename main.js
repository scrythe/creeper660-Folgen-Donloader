// Modules to control application life and create native browser window
const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const ipc = ipcMain;
const puppeteer = require('puppeteer-extra');
const StealthPlugin = require('puppeteer-extra-plugin-stealth')
puppeteer.use(StealthPlugin());
const child_process = require('child_process');

function createWindow () {
  // Create the browser window.
  const mainWindow = new BrowserWindow({
    width: 1200,
    height: 680,
    minWidth: 940,
    minHeight: 560,
    frame: false,
    autoHideMenuBar: true,
    webPreferences: {
      nodeIntegration: false, // is default value after Electron v5
      contextIsolation: true, // protect against prototype pollution
      enableRemoteModule: false, // turn off remote
      devTools: true,
      preload: path.join(__dirname, 'preload.js')
    }
  })

  // and load the index.html of the app.
  mainWindow.loadFile('src/search.html')
  mainWindow.setBackgroundColor('#212529')

  //// Minimize App
  ipc.on('minimizeApp toMain', () => {
    mainWindow.minimize();
  })

  ////Maximize and or Restore App
  ipc.on('maximizeRestoreApp toMain', () => {
    if (mainWindow.isMaximized()) {
      mainWindow.restore();
    } else {
      mainWindow.maximize();
    }
  })
  
  //// Close App
  ipc.on('closeApp toMain', () => {
    mainWindow.close();
  })

  // Open the DevTools.
  // mainWindow.webContents.openDevTools()
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(() => {
  createWindow()

  app.on('activate', function () {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

// //// Close App
// ipc.on('closeApp toMain', () => {
//   mainWindow.close();
// })


// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', function () {
  if (process.platform !== 'darwin') app.quit()
})

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.

const dialog = require('electron').dialog
ipcMain.handle('get-anime-episode-data', async (event, arg) => {
    const data = arg;
    const urls = data[0];
    const animeName = data[1];
    var animeDataHTML = await allAnimeEpisodeAndSeasonData(urls, animeName);
    return animeDataHTML;
})

// // get Anime Episode and Season Data

const request = require('request');
const cheerio = require('cheerio');

function getAnimeStaffeln(url) {
    return new Promise(resolve => {
        request(url, (error, response, html) => {
            if(!error && response.statusCode == 200) {
                var staffeln = [];
                const $$ = cheerio.load(html);
                const staffelnList = $$('#stream ul').eq(0);
                // console.log($$.html(staffelnList));
                staffelnList.find('li a').each((i, el) => {
                    var links = `https://anicloud.io${$$(el).attr('href')}`;
                    staffeln.push(links);
                })
                resolve(staffeln);
            }
        })
    })
}

function getAnimeEpisodesSeasonList(url) {
    return new Promise((resolve) => {
        request(url, (error, response, html) => {
            if(!error && response.statusCode == 200) {
                var $$ = cheerio.load(html);
                var seasonEpisodes = $$.html('.seasonEpisodesList');
                resolve(seasonEpisodes);
            }
        })
    })
}

function getAnimeEpisodesList(url) {
    return new Promise(async resolve => {
        let animeStaffeln = await getAnimeStaffeln(url);
        var getAnimeEpisodesPromises = [];
        animeStaffeln.forEach(element => {
            getAnimeEpisodesPromises.push(getAnimeEpisodesSeasonList(element));
        });
        await Promise.all(getAnimeEpisodesPromises).then((v) => {
            var seasons = v;
            var seasons = seasons.sort((a, b) => {
                var a = cheerio.load(cheerio.load(a).html())('tbody').attr('id').replace("season" , "");
                var b = cheerio.load(cheerio.load(b).html())('tbody').attr('id').replace("season" , "");
                return a - b;
            })
            resolve(seasons);
        })
    })
}

function getAnimeEpisodesData(url, animeName) {
    return new Promise(async resolve => {
        var seasons = await getAnimeEpisodesList(url);
        var episodesData = [];
        seasons.forEach(element => {
            var season = cheerio.load(element).html();
            var $$ = cheerio.load(season);
            var seasonEpisodesBody = $$('tbody');
            var seasonNumberName = $$(seasonEpisodesBody).attr('id');
            var seasonNumber = seasonNumberName.replace(/[^0-9]*/, '');
            var seasonEpisodeData = [];
            $$('tbody tr').each((i, el) => {
                var episdodeNumberName = $$(el).find(`.${seasonNumberName}EpisodeID a`).text().replace(/\B\s+|\s+\B/g, '');
                var episodeNumber = episdodeNumberName.replace(/[^0-9]*/, '');
                var episodeName = $$(el).find('.seasonEpisodeTitle a span').text().replace(/.\[(.*?)\]/, '');
                var episodehref = $$(el).find('.seasonEpisodeTitle a').attr('href');
                var episodeLink = `https://anicloud.io${episodehref}`
                var episodeData = {episdodeNumberName: episdodeNumberName, episodeName: episodeName, episodeLink: episodeLink, episodeNumber: episodeNumber};
                seasonEpisodeData.push(episodeData);
            });
            var seasonEpisodeData = seasonEpisodeData.map(data => {
                return `<li episodenname='${data.episodeName}' animename='${animeName}' staffelzahl='${seasonNumber}' episodenzahl='${data.episodeNumber}' episodenepisodeLink='${data.episodeLink}'><label class="checkbox"><input type="checkbox"><span class="checkmark"></span></label><span>${data.episdodeNumberName}</span><strong>${data.episodeName}</strong></li>`;
            })
            var seasonEpisodeData = seasonEpisodeData.join('');
            episodesData.push({[seasonNumber]: seasonEpisodeData});
        });
        resolve(episodesData);
    });
}

function allAnimeEpisodeAndSeasonData(url, animeName) {
    return new Promise(async resolve => {
        var episodesData = await getAnimeEpisodesData(url, animeName);
        var episodesHTML = episodesData.map(data => {
            var seasonNumber = Object.keys(data)[0];
            return `<ul episodeSeason='${seasonNumber}'>${data[seasonNumber]}</ul>`;
        });
        var episodesHTML = episodesHTML.join('');
        var seasonsHTML = episodesData.map(data => {
            var seasonNumber = Object.keys(data)[0];
            if (seasonNumber == 0) {
                return `<li><a season="${seasonNumber}" link="https://anicloud.io/anime/stream/hunter-x-hunter/filme">Filme</a></li>`;
            } else {
                return `<li><a season="${seasonNumber}" link="https://anicloud.io/anime/stream/hunter-x-hunter/filme">${seasonNumber}</a></li>`;
            }
        });
        var seasonsHTML = seasonsHTML.join('');
        var seasonsHTML = `<ul><li><strong>Staffeln:</strong></li>${seasonsHTML}</ul>`;
        var animeDataHTML = {episodesHTML: episodesHTML, seasonsHTML: seasonsHTML};
        resolve(animeDataHTML);
    })
}

ipcMain.handle('download-anime-episodes', async (event, arg) => {
    const urls = arg;
    var filepath = dialog.showOpenDialogSync({properties: ['openDirectory']});
    const response = await executedownlaodfilescommand(urls, filepath);
    fs.unlinkSync(`${filepath}\\hls-download.bat`);
    return response;
})

var fs = require('file-system');

// videoLinkArray = ["https://anicloud.io/anime/stream/hunter-x-hunter/staffel-1/episode-1", "https://anicloud.io/anime/stream/hunter-x-hunter/staffel-1/episode-2", "https://anicloud.io/anime/stream/hunter-x-hunter/staffel-1/episode-3"]


function getredirectlink(url) {
    return new Promise(resolve => {
        request(url, (error, response, html) => {
            if(!error && response.statusCode == 200) {
                const $$ = cheerio.load(html);
                const watchEpisodehref = $$('.watchEpisode').eq(3).attr('href');
                const watchEpisodelink = `https://anicloud.io${watchEpisodehref}`;
                resolve(watchEpisodelink);
            }
        })
    })
}

function checkifvoelink(url, page) {
    return new Promise(async resolve => {
        var voeRegExp = new RegExp("https:\/\/voe.sx");
        var testvoeRegExp = voeRegExp.test(url);
        while (testvoeRegExp === false) {
            await new Promise(done => setTimeout(() => done(), 3000));
            url = page.url();
            console.log(url)
            testvoeRegExp = voeRegExp.test(url);
        }
        if (testvoeRegExp === true) {
            resolve(url);
        }
    })
}

function getstreamingwebsite(videoLinkArray) {
    return new Promise (async resolve => {
        const browser = await puppeteer.launch({ executablePath: `${__dirname}\\..\\app.asar.unpacked\\node_modules\\puppeteer\\.local-chromium\\win64-901912\\chrome-win\\chrome.exe`, headless: false });
        const page = await browser.newPage();
        var voelinks = [];
        for (const anicloudUrl of videoLinkArray) {
            var streamingurl = await getredirectlink(anicloudUrl[0]);
            await page.goto(streamingurl);
            var url = page.url();
            console.log(url);
            var voelink = await checkifvoelink(url, page);
            console.log(voelink);
            voelinks.push([voelink, anicloudUrl[1]]);
        }
        await browser.close();
        resolve(voelinks);
    })
}

function getstreamingurl(streamingwebsite) {
    return new Promise (async resolve => {
        request(streamingwebsite, (error, response, html) => {
            if(!error && response.statusCode == 200) {
                var searchconstsourcesRegExp = new RegExp("const sources(.*?)};", "s");
                var constsources = html.match(searchconstsourcesRegExp)[0];
                var searchHlsSrcRegExp = new RegExp("https(.*?)master.m3u8", "s");
                var hlssrc = constsources.match(searchHlsSrcRegExp)[0];                resolve(hlssrc);
            }
        })
    })
}

function getAllStreamingUrls(videoLinkArray) {
    return new Promise (async resolve => {
        var streamingwebsites = await getstreamingwebsite(videoLinkArray);
        var streamingurls = [];
        for (const streamingwebsite of streamingwebsites) {
            var streamingurl = await getstreamingurl(streamingwebsite[0]);
            streamingurls.push([streamingurl, streamingwebsite[1]]);
        }
        resolve(streamingurls);
    })
}

function getindexmu38link(streamingurl) {
    return new Promise (async resolve => {
        request(streamingurl, (error, response, html) => {
            if(!error && response.statusCode == 200) {
                const urlRegExp = new RegExp("https(.*?)index-v1-a1.m3u8", "s");
                const indexmu38link = html.match(urlRegExp)[0];
                console.log(indexmu38link)
                resolve(indexmu38link);
            }
        })
    })
}

function getAllIndexmu38Links(videoLinkArray) {
    return new Promise (async resolve => {
        var streamingsurls = await getAllStreamingUrls(videoLinkArray);
        var indexmu38links = [];
        for (const streamingurl of streamingsurls) {
            var indexmu38link = await getindexmu38link(streamingurl[0]);
            indexmu38links.push([indexmu38link, streamingurl[1]]);
        }
        console.log(indexmu38links);
        resolve(indexmu38links);
    })
}

function downloadfiles(videoLinkArray, filepath) {
    return new Promise (async resolve => {
        const indexmu38links = await getAllIndexmu38Links(videoLinkArray);
        // __dirname + '/../extraResources/
        const ffmpeg = `"${__dirname}\\..\\ffmpeg"`;
        var downloadfilecommands = indexmu38links.map(indexmu38link => {
            return `${ffmpeg} -i "${indexmu38link[0]}" -c copy -bsf:a aac_adtstoasc "${indexmu38link[1].replace(/[\/\\:*?"<>]/g, '')}.mp4"`;
        });
        var downloadfilecommands = downloadfilecommands.join('\n');
        const cmdCommand = `cd "${filepath}"\n${downloadfilecommands}\nexit`
        fs.writeFileSync(`${filepath}\\hls-download.bat`, cmdCommand);
        resolve("Rewriting Powershell Code was succesfull");
    })
}

function executedownlaodfilescommand(videoLinkArray, filepath) {
    return new Promise (async resolve => {
        const response = await downloadfiles(videoLinkArray, filepath);
        console.log(response)
        child_process.execSync(`start cmd.exe /K "${filepath}\\hls-download.bat"`);
        resolve('Episoden fertig gedownloadet');
    })
}