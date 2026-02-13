let export_button = document.getElementById("export-button");
let overlay = document.getElementById("overlay");

const render_dimension = 1000;

export_button.addEventListener("pointerup", async () => {
    overlay.classList.add("showing");
    requestAnimationFrame(() => {
        requestAnimationFrame(() => {
            renderToGif();
            overlay.classList.remove("showing");
        });
    });
});

function renderToGif() {
    const big = document.createElement("canvas");
    big.width = render_dimension;
    big.height = render_dimension;

    const bigCtx = big.getContext("2d");

    bigCtx.imageSmoothingEnabled = false;

    const encoder = new GIFEncoder(render_dimension, render_dimension);
    encoder.setDelay(100);
    encoder.start(); 
    for (let i = 0; i < getFrameCount(); i++) {
        let prev_canvas = getCanvasAt(i);

        bigCtx.clearRect(0, 0, render_dimension, render_dimension);
        bigCtx.drawImage(prev_canvas, 0, 0, render_dimension, render_dimension);
        encoder.addFrame(bigCtx);
    }
    encoder.finish();

    const buffer = encoder.out.getData();
    writeFile('animation.gif', buffer, error => {
        error ? console.log(error) : null;
    });
}

function writeFile(filename, buffer, callback) {
    try {
        const blob = new Blob([buffer], { type: 'image/gif' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
        callback(null);
    } catch (error) {
        callback(error);
    }
}