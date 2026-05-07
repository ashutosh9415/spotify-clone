let currentSong = new Audio();
let songs = [];
let currFolder = "";

// IMPORTANT: match your HTML id
let play = document.getElementById("playbutton");
let previous = document.getElementById("previous");
let next = document.getElementById("next");

// Convert seconds → mm:ss
function secondsToMinutesSeconds(seconds) {
    if (isNaN(seconds) || seconds < 0) return "00:00";

    let minutes = Math.floor(seconds / 60);
    let secondsLeft = Math.floor(seconds % 60);

    return `${String(minutes).padStart(2, '0')}:${String(secondsLeft).padStart(2, '0')}`;
}

// ✅ Get songs
async function getSongs(folder) {
    currFolder = folder;

    let res = await fetch(`http://127.0.0.1:5500/songs/${folder}/`);
    let text = await res.text();

    let div = document.createElement("div");
    div.innerHTML = text;

    let links = div.getElementsByTagName("a");
    songs = [];

    for (let link of links) {
        if (link.href.endsWith(".mp3")) {
            songs.push(link.href.split(`/songs/${folder}/`)[1]);
        }
    }

    // Show songs
    let ul = document.querySelector(".songList ul");
    ul.innerHTML = "";

    songs.forEach(song => {
        ul.innerHTML += `
        <li>
            <img class="invert" width="34" src="music.svg">
            <div class="info">
                <div>${decodeURI(song)}</div>
                <div>Artist</div>
            </div>
            <div class="playnow">
                <span>Play Now</span>
                <img class="invert" src="playbutton.svg">
            </div>
        </li>`;
    });

    // Click play
    document.querySelectorAll(".songList li").forEach(li => {
        li.addEventListener("click", () => {
            let track = li.querySelector(".info div").innerText.trim();
            playMusic(track);
        });
    });

    return songs;
}

// ✅ Play music
function playMusic(track, pause = false) {
    currentSong.src = `/songs/${currFolder}/${track}`;

    if (!pause) {
        currentSong.play();
        play.src = "pause.svg";
    }

    document.querySelector(".songinfo").innerText = track;
    document.querySelector(".songtime").innerText = "00:00 / 00:00";
}

// ✅ Display albums
async function displayAlbums() {
    let res = await fetch(`http://127.0.0.1:5500/songs/`);
    let text = await res.text();

    let div = document.createElement("div");
    div.innerHTML = text;

    let anchors = div.getElementsByTagName("a");
    let cardContainer = document.querySelector(".cardContainer");

    cardContainer.innerHTML = ""; // clear old cards

    for (let a of anchors) {
        if (a.href.includes("/songs/")) {

            let parts = a.href.split("/").filter(p => p !== "");
            let folder = parts[parts.length - 1];

            if (folder === "songs") continue;

            try {
                let jsonRes = await fetch(`/songs/${folder}/info.json`);

                if (!jsonRes.ok) continue;

                let data = await jsonRes.json();

                cardContainer.innerHTML += `
                <div data-folder="${folder}" class="card">
                    <div class="play">
                        <img src="playbutton.svg">
                    </div>
                    <img src="/songs/${folder}/cover.jpg">
                    <h2>${data.title}</h2>
                    <p>${data.description}</p>
                </div>`;
            } catch (err) {
                console.log("Skipping folder:", folder);
            }
        }
    }

    // Click event
    document.querySelectorAll(".card").forEach(card => {
        card.addEventListener("click", async () => {
            let folder = card.dataset.folder;
            songs = await getSongs(folder);
            playMusic(songs[0]);
        });
    });
}

// ✅ Main
async function main() {
    await getSongs("ncs"); // ✅ FIXED
    playMusic(songs[0], true);

    await displayAlbums();

    // Play/Pause
    play.addEventListener("click", () => {
        if (currentSong.paused) {
            currentSong.play();
            play.src = "pause.svg";
        } else {
            currentSong.pause();
            play.src = "playbutton.svg";
        }
    });

    // Time update
    currentSong.addEventListener("timeupdate", () => {
        document.querySelector(".songtime").innerText =
            `${secondsToMinutesSeconds(currentSong.currentTime)} / ${secondsToMinutesSeconds(currentSong.duration)}`;

        document.querySelector(".circle").style.left =
            (currentSong.currentTime / currentSong.duration) * 100 + "%";
    });

    // Seekbar
    document.querySelector(".seekbar").addEventListener("click", e => {
        let percent = (e.offsetX / e.target.clientWidth) * 100;
        currentSong.currentTime = (currentSong.duration * percent) / 100;
    });

    // Sidebar
    document.querySelector(".hamburger").addEventListener("click", () => {
        document.querySelector(".left").style.left = "0";
    });

    document.querySelector(".close").addEventListener("click", () => {
        document.querySelector(".left").style.left = "-120%";
    });

    // Next
    next.addEventListener("click", () => {
        let index = songs.indexOf(currentSong.src.split("/").pop());
        if (index < songs.length - 1) playMusic(songs[index + 1]);
    });

    // Previous
    previous.addEventListener("click", () => {
        let index = songs.indexOf(currentSong.src.split("/").pop());
        if (index > 0) playMusic(songs[index - 1]);
    });

    // Volume
    document.querySelector(".range input").addEventListener("input", e => {
        currentSong.volume = e.target.value / 100;
    });
}

main();