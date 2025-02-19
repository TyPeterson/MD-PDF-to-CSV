const dropArea = document.getElementById('drop-area');
const fileElem = document.getElementById('fileElem');
const statusDiv = document.getElementById('status');
const downloadLink = document.getElementById('download-link');
const downloadLinkContainer = document.getElementById('download-link-container');
const fileSelectButton = document.getElementById('fileSelectButton');

// Prevent default drag behaviors
;['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
    dropArea.addEventListener(eventName, preventDefaults, false);
    document.body.addEventListener(eventName, preventDefaults, false);
});

;['dragenter', 'dragover'].forEach(eventName => {
    dropArea.addEventListener(eventName, highlight, false);
});

;['dragleave', 'drop'].forEach(eventName => {
    dropArea.addEventListener(eventName, unhighlight, false);
});

dropArea.addEventListener('drop', handleDrop, false);
fileSelectButton.addEventListener('click', () => {
    fileElem.click(); // Trigger the file input
});

function preventDefaults(e) {
    e.preventDefault();
    e.stopPropagation();
}

function highlight(e) {
    dropArea.classList.add('highlight');
}

function unhighlight(e) {
    dropArea.classList.remove('highlight');
}

function handleDrop(e) {
    const dt = e.dataTransfer;
    const files = dt.files;
    handleFiles(files);
}

function handleFiles(files) {
    if (files.length > 1) {
        statusDiv.textContent = 'Please upload only one file at a time.';
        return;
    }
    const file = files[0];
    if (file.type !== "application/pdf") {
        statusDiv.textContent = 'Invalid file type. Please upload a PDF file.';
        return;
    }
    uploadFile(file);
}

function uploadFile(file) {
    const url = 'http://localhost:5000/upload'; //  Backend endpoint
    const formData = new FormData();
    formData.append('file', file);

    statusDiv.textContent = 'Uploading...';

    fetch(url, {
        method: 'POST',
        body: formData
    })
    .then(response => {
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response.blob();
    })
    .then(blob => {
        const textFileUrl = URL.createObjectURL(blob);
        const fileNameWithoutExt = file.name.replace(/\.[^/.]+$/, ""); // Remove extension
        downloadLink.href = textFileUrl;
        downloadLink.download = fileNameWithoutExt + ".txt"; // Set desired filename
        downloadLinkContainer.style.display = "block"; // Show the link
        statusDiv.textContent = 'File uploaded and processed successfully!';
    })
    .catch(error => {
        console.error('Error:', error);
        statusDiv.textContent = `Upload failed: ${error.message}`;
    });
}