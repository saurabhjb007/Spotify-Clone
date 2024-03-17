console.log("lets write javascript");

let currentSong = new Audio();
let songs;
let currFolder;

// Function for convert seconds to minutes:seconds
function secondsToMinutesSeconds(seconds) {
  if (isNaN(seconds) || seconds < 0) {
    return "00:00";
  }
  const totalSeconds = Math.floor(seconds);
  const minutes = Math.floor(totalSeconds / 60);
  const remainingSeconds = totalSeconds % 60;
  const formattedMinutes = String(minutes).padStart(2, "0");
  const formattedSeconds = String(remainingSeconds).padStart(2, "0");
  return `${formattedMinutes}:${formattedSeconds}`;
}

// Function for Fetching Songs
async function getSongs(folder) {
  currFolder = folder;
  let a = await fetch(`/${folder}/`);
  let response = await a.text();
  let div = document.createElement("div");
  div.innerHTML = response;
  let as = div.getElementsByTagName("a");
  songs = [];
  for (let index = 0; index < as.length; index++) {
    const element = as[index];
    if (element.href.endsWith(".mp3")) {
      songs.push(element.href.split(`/${currFolder}/`)[1]);
    }
  }

  // Show all Song in Library
  let songUL = document
    .querySelector(".songList")
    .getElementsByTagName("ul")[0];
  songUL.innerHTML = "";
  for (const song of songs) {
    songUL.innerHTML =
      songUL.innerHTML +
      `<li>
        <img class="invert" width="34" src="/image/music.svg" alt="" />
        <div class="info">
          <div>${song.replaceAll("%20", " ")}</div>
        </div>
        <div class="playnow">
          <span>Play Now</span>
          <img class="invert" src="/image/play.svg" alt="" />
        </div>
      </li>`;
  }

  // Eventlistener for each song in Library
  Array.from(
    document.querySelector(".songList").getElementsByTagName("li")
  ).forEach((e) => {
    e.addEventListener("click", (element) => {
      playMusic(e.querySelector(".info").firstElementChild.innerHTML.trim());
    });
  });
  return songs;
}

// Eventlistner for Playbar
const playMusic = (track, pause = "true") => {
  currentSong.src = `/${currFolder}/` + track;
  if (pause) {
    currentSong.play();
    play.src = "/image/pause.svg";
  }
  document.querySelector(".songinfo").innerHTML = decodeURI(track);
  document.querySelector(".songtime").innerHTML = "00:00/ 00:00";
};

async function displayAlbums() {
  let a = await fetch(`/songs/`);
  let response = await a.text();
  let div = document.createElement("div");
  div.innerHTML = response;
  let anchors = div.getElementsByTagName("a");

  let cardContainer = document.querySelector(".cardContainer");

  let array = Array.from(anchors);
  for (let index = 0; index < array.length; index++) {
    const e = array[index];
    if (e.href.includes("/songs/") && !e.href.includes(".htaccess")) {
      let folder = e.href.split("/")[4];
      //  get the Metadata of folder
      let a = await fetch(`/songs/${folder}/info.json`);
      let response = await a.json();
      cardContainer.innerHTML =
        cardContainer.innerHTML +
        `<div data-folder="${folder}" class="card">
      <div class="play">
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M5 20V4L19 12L5 20Z"
            stroke="#141834"
            stroke-width="1.5"
            stroke-linejoin="round"
            fill="#000"
          />
        </svg>
      </div>
      <img
        src="/songs/${folder}/cover.jpg"
        alt=""
      />
      <h2>${response.title}</h2>
      <p>
        ${response.description}
      </p>
    </div>`;
    }
  }

  // Eventlistener for Album Load when Card Clicked
  Array.from(document.getElementsByClassName("card")).forEach((e) => {
    e.addEventListener("click", async (item) => {
      songs = await getSongs(`songs/${item.currentTarget.dataset.folder}`);
      playMusic(songs[0]);
    });
  });
}

async function main() {
  // Get list of all Songs
  await getSongs("songs/ArijitSingh");
  playMusic(songs[0], false);

  // Display All Albums
  await displayAlbums();

  // Eventlistener for Play and Pause
  play.addEventListener("click", () => {
    if (currentSong.paused) {
      currentSong.play();
      play.src = "/image/pause.svg";
    } else {
      currentSong.pause();
      play.src = "/image/play.svg";
    }
  });

  // Eventlistener for Time Duration
  currentSong.addEventListener("timeupdate", () => {
    document.querySelector(".songtime").innerHTML = `${secondsToMinutesSeconds(
      currentSong.currentTime
    )} / ${secondsToMinutesSeconds(currentSong.duration)}`;
    document.querySelector(".circle").style.left =
      (currentSong.currentTime / currentSong.duration) * 100 + "%";
  });

  // Eventlistener for Seekbar
  document.querySelector(".seekbar").addEventListener("click", (e) => {
    let percent = (e.offsetX / e.target.getBoundingClientRect().width) * 100;
    document.querySelector(".circle").style.left = percent + "%";
    currentSong.currentTime = (currentSong.duration * percent) / 100;
  });

  // Eventlistener for Hamburger
  document.querySelector(".hamburger").addEventListener("click", (e) => {
    document.querySelector(".left").style.left = "0";
  });

  // Eventlistener for Close
  document.querySelector(".close").addEventListener("click", (e) => {
    document.querySelector(".left").style.left = "-120%";
  });

  // Eventlistener for Previous
  previous.addEventListener("click", () => {
    // currentSong.pause();
    let index = songs.indexOf(currentSong.src.split("/")[4]);
    if (index - 1 >= 0) {
      playMusic(songs[index - 1]);
    }
  });

  // Eventlistener for Next
  next.addEventListener("click", () => {
    // currentSong.pause();
    let index = songs.indexOf(currentSong.src.split("/")[4]);
    if (index + 1 < songs.length) {
      playMusic(songs[index + 1]);
    }
  });

  // Eventlistener for Range
  document
    .querySelector(".range")
    .getElementsByTagName("input")[0]
    .addEventListener("change", (e) => {
      currentSong.volume = parseInt(e.target.value) / 100;
      if (currentSong.volume > 0) {
        document.querySelector(".volume>img").src = document
          .querySelector(".volume>img")
          .src.replace("mute.svg", "volume.svg");
      }
    });

  // Eventlistener for Mute
  document.querySelector(".volume>img").addEventListener("click", (e) => {
    if (e.target.src.includes("volume.svg")) {
      e.target.src = e.target.src.replace("volume.svg", "mute.svg");
      currentSong.volume = 0;
      document
        .querySelector(".range")
        .getElementsByTagName("input")[0].value = 0;
    } else {
      e.target.src = e.target.src.replace("mute.svg", "volume.svg");
      currentSong.volume = 0.1;
      document
        .querySelector(".range")
        .getElementsByTagName("input")[0].value = 10;
    }
  });
}
main();
