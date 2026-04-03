let export_button = document.getElementById("export-button");
let overlay = document.getElementById("overlay");

const render_dimension = 1000;

// 192.168.1.133

// Export button: renders animation as GIF and downloads it
export_button.addEventListener("pointerup", async () => {
    overlay.classList.add("showing");
    requestAnimationFrame(() => {
        requestAnimationFrame(() => {
            let res = "{dur:100,fade:50}" + renderToString();
            let socket = new WebSocket("ws://192.168.1.133:81/ws");
            socket.onopen = () => {
                socket.send(res);
                socket.close();
            };
            overlay.classList.remove("showing");
        });
    });
});

// Renders all frames as a GIF animation and initiates download
function renderToString() {
    let result = "";
    for (let i = 0; i < getFrameCount(); i++) {
        let prev_canvas = getCanvasAt(i).getContext('2d');
        result += canvasToString(prev_canvas);
    }
    console.log("sending via socket: " + result);
    return result;
}

function canvasToString(context) {
    const imageData = context.getImageData(0, 0, 10, 10);
    const data = imageData.data;
    let str = "[";
    for (let i = 0; i < data.length; i += 4) {
        let x = (i / 4) % 10;
        let y = Math.floor((i / 4) / 10);
        //let led = i / 4;
        let r = data[i];
        let g = data[i + 1];
        let b = data[i + 2];
        //str+=`CRGB(${r},${g},${b}),`;
        if (r + g + b === 0) {
            continue;
        }

        let alpha = data[i + 3] / 255.0;
        r = alpha * r;
        g = alpha * g;
        b = alpha * b;

        let hex = ("0" + parseInt(r, 10).toString(16)).slice(-2) +
            ("0" + parseInt(g, 10).toString(16)).slice(-2) +
            ("0" + parseInt(b, 10).toString(16)).slice(-2);
        str += `${x}.${y}:${hex},`;
        //str+=`${led}:${hex},`;
    }
    if (str.endsWith(",")) {
        str = str.slice(0, -1);
    }
    str += "]";
    return str;
}
