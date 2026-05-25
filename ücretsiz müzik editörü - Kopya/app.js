const audio = new Audio();
const player = document.getElementById('player');
const lyricsDiv = document.getElementById('lyrics');
let lyricsData = [];

// Sürükleme
player.onmousedown = (e) => {
    let shiftX = e.clientX - player.getBoundingClientRect().left;
    let shiftY = e.clientY - player.getBoundingClientRect().top;
    document.onmousemove = (e) => {
        player.style.left = e.clientX - shiftX + 'px';
        player.style.top = e.clientY - shiftY + 'px';
    };
    document.onmouseup = () => document.onmousemove = null;
};

document.getElementById('file').onchange = async (e) => {
    const file = e.target.files[0];
    audio.src = URL.createObjectURL(file);
    const name = file.name.replace(/\.[^/.]+$/, "");
    const res = await fetch(`https://lrclib.net/api/search?q=${encodeURIComponent(name)}`);
    const data = await res.json();
    if(data[0]?.syncedLyrics) {
        lyricsData = data[0].syncedLyrics.split('\n').map(l => {
            const m = l.match(/\[(\d+):(\d+\.\d+)\](.*)/);
            return m ? { t: parseInt(m[1])*60 + parseFloat(m[2]), text: m[3] } : null;
        }).filter(l => l);
    }
};

document.getElementById('play').onclick = () => audio.paused ? audio.play() : audio.pause();
document.getElementById('prev').onclick = () => audio.currentTime -= 10;
document.getElementById('next').onclick = () => audio.currentTime += 10;
document.getElementById('repeat').onclick = () => audio.loop = !audio.loop;

audio.ontimeupdate = () => {
    document.getElementById('bar').style.width = (audio.currentTime / audio.duration * 100) + '%';
    // Aktif satırı ve önceki 2 satırı göster
    const activeIdx = lyricsData.findIndex(l => l.t > audio.currentTime) - 1;
    const start = Math.max(0, activeIdx - 1);
    const display = lyricsData.slice(start, start + 3);
    
    lyricsDiv.innerHTML = display.map((l, i) => 
        `<div class="${i === 1 ? 'active' : ''}">${l.text}</div>`
    ).join('');
};