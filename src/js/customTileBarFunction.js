// // titleBAr Buttons

const minimzeBtn = document.querySelector('.minimize');
const maxResBtn = document.querySelector('.maximize');
const closeBtn = document.querySelector('.close');

//// Minimize App

minimzeBtn.addEventListener('click', () => {
    window.api.send('minimizeApp toMain');
})

//// Close App

maxResBtn.addEventListener('click', () => {
    window.api.send('maximizeRestoreApp toMain');
})

//// Close App

closeBtn.addEventListener('click', () => {
    window.api.send('closeApp toMain');
})