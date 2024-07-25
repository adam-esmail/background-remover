document.getElementById('uploadForm').addEventListener('submit', function (event) {
    event.preventDefault();
    const formData = new FormData(this);

    const progressContainer = document.getElementById('progressContainer');
    const progressBar = document.getElementById('progressBar');
    const progressText = document.getElementById('progressText');
    progressContainer.style.display = 'block';

    const xhr = new XMLHttpRequest();
    xhr.open('POST', '/upload', true);

    xhr.upload.onprogress = function (event) {
        if (event.lengthComputable) {
            const percentComplete = (event.loaded / event.total) * 100;
            progressBar.value = percentComplete;
            progressText.textContent = Math.round(percentComplete) + '%';
        }
    };

    xhr.onload = function () {
        if (xhr.status === 200) {
            const data = JSON.parse(xhr.responseText);
            if (data.success) {
                const downloadLink = document.getElementById('downloadLink');
                const link = document.getElementById('link');
                const audioPlayer = document.getElementById('audioPlayer');
                const audioSource = document.getElementById('audioSource');

                link.href = data.filepath;
                audioSource.src = data.filepath;
                audioPlayer.load();
                
                progressContainer.style.display = 'none';
                downloadLink.style.display = 'block';
            }
        }
    };

    xhr.send(formData);
});

const audioPlayer = document.getElementById('audioPlayer');
const playPauseButton = document.getElementById('playPauseButton');
const currentTimeElement = document.getElementById('currentTime');
const durationElement = document.getElementById('duration');

playPauseButton.addEventListener('click', function () {
    if (audioPlayer.paused) {
        audioPlayer.play();
        playPauseButton.textContent = 'Pause';
    } else {
        audioPlayer.pause();
        playPauseButton.textContent = 'Play';
    }
});

audioPlayer.addEventListener('timeupdate', function () {
    const currentTime = formatTime(audioPlayer.currentTime);
    currentTimeElement.textContent = currentTime;
});

audioPlayer.addEventListener('loadedmetadata', function () {
    const duration = formatTime(audioPlayer.duration);
    durationElement.textContent = duration;
});

function formatTime(seconds) {
    const minutes = Math.floor(seconds / 60);
    const secondsPart = Math.floor(seconds % 60);
    return `${minutes.toString().padStart(2, '0')}:${secondsPart.toString().padStart(2, '0')}`;
}
