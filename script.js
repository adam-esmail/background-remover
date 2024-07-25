document.getElementById('uploadForm').addEventListener('submit', function (event) {
    event.preventDefault();
    const formData = new FormData(this);

    fetch('/upload', {
        method: 'POST',
        body: formData
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            const downloadLink = document.getElementById('downloadLink');
            const link = document.getElementById('link');
            link.href = data.filepath;
            downloadLink.style.display = 'block';
        }
    })
    .catch(error => console.error('Error:', error));
});
