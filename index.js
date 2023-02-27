// Global variables
var ogile;
var oldSize;
var newSize;

// Compressor Class
// Utilises the canvas element to convert an image to jpeg
// and allows for scaling
class Comprerssor {
    constructor(file, options) {
        this.file = file;
        this.newSize = newSize;
        this.image = new Image();
        this.image.onload = () => this.imLoaded();
        this.options = options;
        this.result;
        this.init();
    }

    init() {
        const {file, options} = this;

        if (!file) {
            this.fail();
        }

        if (!options) {
            this.fail();
        }

        const imSrc = URL.createObjectURL(file);
        this.image.src = imSrc;
    }

    imLoaded() {
        const {options} = this;

        const initWidth = this.image.naturalWidth;
        const initHeight = this.image.naturalHeight;

        const canvas = document.createElement('canvas');
        const canvas2 = document.createElement('canvas');
        canvas.width = initWidth;
        canvas.height = initHeight;
        const ctx = canvas.getContext('2d');
        const ctx2 = canvas2.getContext('2d');

        ctx2.clearRect(0, 0, canvas2.width, canvas2.height);

        // Scale the image based on selected options
        ctx.scale(options.scale, options.scale);
        ctx.drawImage(this.image, 0, 0);
        canvas2.width = initWidth * options.scale;
        canvas2.height = initHeight * options.scale;

        // Set the alpha fill colour
        const fillStyle = document.querySelector('input[name="transparency"]:checked').value;
        ctx2.fillStyle = fillStyle;
        ctx2.fillRect(0, 0, canvas2.width, canvas2.height);

        ctx2.drawImage(canvas, 0, 0);

        // Create a dataURL of the scaled image (while also setting the image type as jpeg) for 
        // displaying on the page
        const output = canvas2.toDataURL("image/jpeg", options.compressFactor);
        canvas2.toBlob((blob) => {
            newSize = blob.size; 
            document.getElementById("im-preview").src = output;
        });
       
    }

    fail(error) {
        // todo
    }

    success() {
        // todo
    }
}

document.getElementById("start-btn").addEventListener('click', () => {
    const fileInput = document.getElementById("im-inpt");
    const urlInput = document.getElementById("url-inpt");
    // Check to see if the image is to be upscaled
    const upscaleChoice = document.querySelector('input[name="upscale"]:checked').value;
    if (upscaleChoice == 0 && fileInput.files.length === 1) {
        file = fileInput.files[0];
        chooseOptions(file);
    } else {
        // Will take priority to any text in the url input
        if (urlInput.value && isValidUrl(urlInput.value)) {
            fetch("http://192.168.20.11:8080/image-proxy?url=" + urlInput.value + "&scale=" + upscaleChoice).then((response) => {
                response.blob().then((imBlob) => {
                    const fileName = urlInput.value.substring(urlInput.value.lastIndexOf('/') + 1, urlInput.value.length);
                    file = new File([imBlob], fileName);
                    chooseOptions(file);
                });       
            });
        } else {
            // If nothing in url input, check for files uploaded
            if (fileInput.files.length === 1) {
                file = fileInput.files[0];
                const reader = new FileReader();
                reader.readAsDataURL(file);
                reader.onload = () => {
                    fetch("http://192.168.20.11:8080/image-upload", {
                        method: "POST",
                        headers: {
                            "Content-Type": 'application/json'
                        },
                        body: JSON.stringify({base64image: reader.result, scale: upscaleChoice, type: file.type})
                    }).then((response) => {
                        response.blob().then((imBlob) => {
                            console.log(file, file.name);
                            const newFile = new File([imBlob], file.name);
                            chooseOptions(newFile);
                        });       
                    });
                }
            }
        }
    }
});

document.getElementById("im-preview").addEventListener('load', (e) => {
    document.getElementById("download").style.display = "block";
    document.getElementById("download").href = document.getElementById("im-preview").src;
    document.getElementById("res").innerText = (getSize(document.getElementById("im-preview").src)/(1e6)).toFixed(2) + 
        "MB -- " + e.target.naturalWidth + " x " + e.target.naturalHeight + " px";
});

document.getElementById("name-input").addEventListener("keyup", (e) => {
    document.getElementById("download").download = e.target.value + ".jpeg";
});

/**
 * Function to change the html to show the 'choose options' box
 * @param {File} file The image file object
 */
function chooseOptions(file) {
    // Hide select file div
    document.getElementById("sel-file-div").style.display = "none";
    // Show options div
    document.getElementById("preview-div").style.display = "flex";
    // Show image in preview pane
    drawImage(file);

    // Autofill the file name into the name input (and download file name)
    const fileName = file.name.substring(0, file.name.lastIndexOf('.'));
    document.getElementById("name-input").value = fileName;
    document.getElementById("download").download = fileName + ".jpeg";

    document.getElementById("im-scale").addEventListener('change', () => drawImage(file));
    document.getElementById("compress-scale").addEventListener('change', () => drawImage(file));
    document.querySelectorAll('input[name="transparency"]')[0].addEventListener('change', () => drawImage(file));
    document.querySelectorAll('input[name="transparency"]')[1].addEventListener('change', () => drawImage(file));
}

/**
 * 
 */
function drawImage(file) {
    const test = new Comprerssor(file, {
        scale: document.getElementById("im-scale").value * 0.01, 
        compressFactor: document.getElementById("compress-scale").value * 0.01
    });
}

/**
 * Function to validate the given string is a URL
 * @param {String} urlString A string containing the URL to be validated
 * @returns {Bool} Returns a true or false validation result
 */
function isValidUrl(urlString) {
    let url;

    try {
        url = new URL(urlString);
    } catch (e) {
        return false;
    }

    return true;
}

/**
 * Function that computes the size of a dataURL image and returns the size in bytes
 * @param {String} dataUrl The dataURL of the image
 * @returns {Int} The size of the image 
 */
function getSize(dataUrl) {
    // Remove the image header properties
    const base64 = dataUrl.split(",")[1];
    // Decode the raw image data and get its length (in bytes)
    const byteSize = window.atob(base64).length;

    return byteSize;
}