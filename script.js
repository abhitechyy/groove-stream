let songs;
let currFolder;

function formatTime(seconds) {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);

    const formattedMins = String(mins).padStart(2, '0');
    const formattedSecs = String(secs).padStart(2, '0');

    return `${formattedMins}:${formattedSecs}`;
}
let currentsong = new Audio()
 play.addEventListener("click", () => {
        if (currentsong.paused) {
            currentsong.play()
            play.src = "images/pause.svg"
        }
        else {
            currentsong.pause()
            play.src = "images/play.svg"
        }
    })
// Get volume elements
const volumeSlider = document.querySelector(".range input");
const volumeIcon = document.querySelector(".volume > img");

// 1️⃣ Slider control: changes icon based on volume
volumeSlider.addEventListener("input", (e) => {
    const volumeValue = parseInt(e.target.value);
    currentsong.volume = volumeValue / 100;

    if (volumeValue === 0) {
        if (!volumeIcon.src.includes("mute.svg")) {
            volumeIcon.src = volumeIcon.src.replace("volume.svg", "mute.svg");
        }
    } else {
        if (!volumeIcon.src.includes("volume.svg")) {
            volumeIcon.src = volumeIcon.src.replace("mute.svg", "volume.svg");
        }
    }
});

// 2️⃣ Icon click: toggles mute/unmute
volumeIcon.addEventListener("click", () => {
    if (currentsong.volume > 0) {
        // Mute
        currentsong.volume = 0;
        volumeSlider.value = 0;
        volumeIcon.src = volumeIcon.src.replace("volume.svg", "mute.svg");
    } else {
        // Unmute to 10%
        currentsong.volume = 0.5;
        volumeSlider.value = 50;
        volumeIcon.src = volumeIcon.src.replace("mute.svg", "volume.svg");
    }
});
const playmusic = (track, pause = false) => {
    const fullPath = `/${currFolder}/${track}`;  // <-- NO ENCODING

    currentsong.src = fullPath;
    currentsong.load();

    currentsong.volume = 1;
    currentsong.muted = false;

    document.querySelector(".songinfo").innerHTML = decodeURIComponent(track);
    document.querySelector(".playtime").innerHTML = "00:00 / 00:00";

    currentsong.onloadedmetadata = () => {
        document.querySelector(".playtime").innerHTML =
            `00:00 / ${formatTime(currentsong.duration)}`;
    };

 if (!pause) {
    currentsong.play().then(() => {
        play.src = "images/pause.svg";
    }).catch(err => {
        console.error("Audio play error:", err);
    });
} else {
    play.src = "images/play.svg";
}
};



async function getsongs(folder) {
    currFolder = folder;
    let a = await fetch(`http://127.0.0.1:5500/${currFolder}/`)
    let response = await a.text();
    let div = document.createElement("div")
    div.innerHTML = response;
    let as = div.getElementsByTagName("a")
    songs = []
    for (let index = 0; index < as.length; index++) {
        const element = as[index];

        let href = element.getAttribute("href");
        //fix the preview issue
        if (href && href.includes(".mp3")) {
            href = href.replace(".preview", "");


            //ensure full url 
            if (!href.startsWith("http")) {
                href = "http://127.0.0.1:5500" + href;
            }
            songs.push(href.split(`/${currFolder}/`)[1])
        }
    }


    let songul = document.querySelector(".songlist").getElementsByTagName("ul")[0]
    songul.innerHTML = ""
    for (const song of songs) {
        songul.innerHTML = songul.innerHTML + `<li data-src="${song}">
    <img class="invert" src="images/music.svg" alt="">
    <div class="info">
        <div>${decodeURIComponent(song)}</div>                                  
    </div>
    <div class="playnow">
        <span>playnow</span>
        <img class="invert" src="images/play.svg" alt="">
    </div>
    </li>
    `;
    }
    if (songs.length > 0) {
        playmusic(songs[0]);  // 'true' means don't autoplay yet
    }

    //attach an event listener to each song
    Array.from(document.querySelector(".songlist").getElementsByTagName("li")).forEach(e => {
        e.addEventListener("click", element => {
            console.log(e.querySelector(".info").firstElementChild.innerHTML)
            playmusic(e.querySelector(".info").firstElementChild.innerHTML.trim())
        })
    })
   
 


    //listen for timeupdate
    currentsong.addEventListener("timeupdate", () => {
        console.log(currentsong.currentTime, currentsong.duration);
        document.querySelector(".playtime").innerHTML = `${formatTime(currentsong.currentTime)} / ${formatTime(currentsong.duration)}`
        document.querySelector(".circle").style.left = (currentsong.currentTime / currentsong.duration) * 100 + "%"
    })
    //add an eventlistener to seekbar
    document.querySelector(".seekbar").addEventListener("click", e => {
        let percent = (e.offsetX / e.target.getBoundingClientRect().width) * 100;
        document.querySelector(".circle").style.left = percent + "%";
        currentsong.currentTime = ((currentsong.duration) * percent) / 100
    })
    //Add an event listener to hamburger
    document.querySelector(".hamburger").addEventListener("click", () => {
        document.querySelector(".left").style.left = "0";
    })
    //Add an event listener to close button
    document.querySelector(".close").addEventListener("click", () => {
        document.querySelector(".left").style.left = "-120%";
    })

    //Add an eventlistener to previous 
    previous.addEventListener("click", () => {
        console.log("previous clicked")
        console.log(currentsong)
        let index = songs.indexOf(currentsong.src.split("/").slice(-1)[0])
        if ((index - 1) >= 0) {
            playmusic(songs[index - 1])
        }

    })

    //Add an eventlistener to next
    next.addEventListener("click", () => {
        console.log("next clicked")
        let index = songs.indexOf(currentsong.src.split("/").slice(-1)[0])
        if ((index + 1) < songs.length) {
            playmusic(songs[index + 1])
        }
    })

    //Add an event to volume
    document.querySelector(".range").getElementsByTagName("input")[0].addEventListener("change", (e) => {
        console.log("Setting volume to", e.target.value, "/ 100")
        currentsong.volume = parseInt(e.target.value) / 100
        if(currentsong.volume>0){
            document.querySelector(".volume>img").src=document.querySelector(".volume>img").src.replace("mute.svg","volume.svg")
        }
    })

    //Load the playlist whenever card is clicked
    Array.from(document.getElementsByClassName("card")).forEach(e => {
        e.addEventListener("click", item => {
            getsongs(`songs/${item.currentTarget.dataset.folder}`);
        })
    })

}


document.addEventListener("DOMContentLoaded", () => {
    getsongs("library/libraryplaylist");  // Load the default playlist
});
