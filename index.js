var file;

class Comprerssor {
    constructor(file, options) {
        this.file = file;
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
        const {file, options} = this;

        const initWidth = this.image.naturalWidth;
        const initHeight = this.image.naturalHeight;

        const canvas = document.createElement('canvas');
        const canvas2 = document.createElement('canvas');
        canvas.width = initWidth;
        canvas.height = initHeight;
        const ctx = canvas.getContext('2d');
        const ctx2 = canvas2.getContext('2d');

        ctx2.clearRect(0, 0, canvas2.width, canvas2.height);

        ctx.scale(options.scale, options.scale);
        ctx.drawImage(this.image, 0, 0);
        
        canvas2.width = initWidth * options.scale;
        canvas2.height = initHeight * options.scale;
        ctx2.drawImage(canvas, 0, 0);

        const output = canvas2.toDataURL("image/jpeg", options.compressFactor);

        document.getElementById("im-preview").src = output;
    }

    fail(error) {

    }

    success() {

    }
}

document.getElementById("start-btn").addEventListener('click', () => {
    const fileInput = document.getElementById("im-inpt");
    const urlInput = document.getElementById("url-inpt");
    if (fileInput.files.length === 1) {
        file = fileInput.files[0];
        chooseOptions(file);
    } else {
        if (urlInput.value) {
            fetch(urlInput.value).then((response) => {
                response.blob().then((imBlob) => {
                    const fileName = urlInput.value.substring(urlInput.value.lastIndexOf('/') + 1, urlInput.value.length);
                    file = new File([imBlob], fileName);
                    chooseOptions(file);
                });       
            });
        } else {

        }
    }
});

document.getElementById("im-preview").addEventListener('load', (e) => {
    const fileName = file.name.substring(0, file.name.lastIndexOf('.'));
    document.getElementById("download").href = document.getElementById("im-preview").src;
    document.getElementById("download").download = fileName;

    document.getElementById("res").innerText = e.target.naturalWidth + " x " + e.target.naturalHeight + " px";
});


function chooseOptions(file) {
    // hide select file div
    document.getElementById("sel-file-div").style.display = "none";
    // show options div
    document.getElementById("preview-div").style.display = "flex";
    // show image preview
    drawImage(file);
    document.getElementById("im-scale").addEventListener('change', () => drawImage(file));
    document.getElementById("compress-scale").addEventListener('change', () => drawImage(file));
    // const imSrc = URL.createObjectURL(file);
    // console.log(imSrc);
    // document.getElementById("im-preview-window").src = imSrc;
    // document.getElementById("download").href = document.getElementById("im-preview").src;
    // document.getElementById("download").download = file.name + ".jpeg";
}

function drawImage(file) {
    const test = new Comprerssor(file, {
            scale: document.getElementById("im-scale").value * 0.01, 
            compressFactor: document.getElementById("compress-scale").value * 0.01
        });
}
