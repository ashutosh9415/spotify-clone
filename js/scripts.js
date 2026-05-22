let currentSong = new Audio();
let songs = [];
let currFolder = "";
let currentTrack = "";

const songsByFolder = {
    ncs: [
        "Aari Aari.mp3",
        "Hum.mp3",
        "Ishq.mp3",
        "Jaan.mp3",
        "Ranjhe.mp3",
        "Sanam.mp3",
        "Sitaare.mp3",
        "songs.mp3",
        "songs10.mp3",
        "songs11.mp3",
        "songs12.mp3",
        "songs2.mp3",
        "songs3.mp3",
        "songs4.mp3",
        "songs5.mp3",
        "songs6.mp3",
        "songs7.mp3",
        "songs8.mp3",
        "songs9.mp3"
    ],
    cs: [
        "songs11.mp3",
        "songs12.mp3"
    ],
    "Bright_(mood)": [
        "Sanam Beraham Nooran Sisters 128 Kbps.mp3",
        "songs6.mp3"
    ],
    "Chill_(mood)": [
        "Hum Dono Tu Meri Main Tera Main Tera Tu Meri 128 Kbps.mp3",
        "songs5.mp3",
        "songs7.mp3"
    ],
    "Dark_(mood)": [
        "Hum Dono Tu Meri Main Tera Main Tera Tu Meri 128 Kbps (1).mp3"
    ],
    Diljit: [
        "Sanam Beraham Nooran Sisters 128 Kbps (1).mp3"
    ],
    "Funky_(mood)": [
        "Aari Aari Dhurandhar The Revenge 128 Kbps.mp3"
    ],
    "karan aujla": [
        "songs12.mp3"
    ],
    "Love_(mood)": [
        "songs10.mp3",
        "songs11.mp3",
        "songs9.mp3"
    ],
    "Uplifting_(mood)": [
        "songs4.mp3",
        "songs8.mp3"
    ],
    "Angry_(mood)": [
        "Ranjhe Nu Heer Kis Kisko Pyaar Karoon 2 128 Kbps.mp3"
    ]
};

const albumFolders = [
    "cs",
    "ncs",
    "Bright_(mood)",
    "Chill_(mood)",
    "Dark_(mood)",
    "Diljit",
    "Funky_(mood)",
    "karan aujla",
    "Love_(mood)",
    "Uplifting_(mood)",
    "Angry_(mood)"
];

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
    songs = songsByFolder[folder] ? [...songsByFolder[folder]] : [];

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
    currentTrack = track;
    currentSong.src = encodeURI(`/Songs/${currFolder}/${track}`);

    if (!pause) {
        currentSong.play();
        play.src = "pause.svg";
    }

    document.querySelector(".songinfo").innerText = track;
    document.querySelector(".songtime").innerText = "00:00 / 00:00";
}

// ✅ Display albums
async function displayAlbums() {
    let cardContainer = document.querySelector(".cardContainer");
    cardContainer.innerHTML = ""; // clear old cards

    for (let folder of albumFolders) {
        try {
            let jsonRes = await fetch(encodeURI(`/Songs/${folder}/info.json`));
            if (!jsonRes.ok) continue;

            let data = await jsonRes.json();

            cardContainer.innerHTML += `
                <div data-folder="${folder}" class="card">
                    <div class="play">
                        <img src="playbutton.svg">
                    </div>
                    <img src="${encodeURI(`/Songs/${folder}/cover.jpg`)}">
                    <h2>${data.title}</h2>
                    <p>${data.description}</p>
                </div>`;
        } catch (err) {
            console.log("Skipping folder:", folder);
        }
    }

    document.querySelectorAll(".card").forEach(card => {
        card.addEventListener("click", async () => {
            let folder = card.dataset.folder;
            songs = await getSongs(folder);
            if (songs.length) playMusic(songs[0]);
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
        let index = songs.indexOf(currentTrack);
        if (index >= 0 && index < songs.length - 1) {
            playMusic(songs[index + 1]);
        }
    });

    // Previous
    previous.addEventListener("click", () => {
        let index = songs.indexOf(currentTrack);
        if (index > 0) {
            playMusic(songs[index - 1]);
        }
    });

    // Volume
    document.querySelector(".range input").addEventListener("input", e => {
        currentSong.volume = e.target.value / 100;
    });
}

main();