let running = false;
let socket;

start();

function start() {
    socket = new WebSocket("ws://192.168.2.146:81/ws");
    socket.onopen = () => {
        running = true;
        socket.send("{dur: 100, crossfade: 80, keep: 1}");
        clock();
    };
    socket.onclose = () => {
        running = false;
    };
    socket.onerror = (error) => {
        console.error("WebSocket error:", error);
        running = false;
    };
}


function clock() {
    setTimeout(() => {
        transmitImageData();
        if(running) {
            clock();
        }
    }, 100);
}

function transmitImageData() {
    const imageData = context.getImageData(0, 0, 10, 10);
    //const imageData = context.getImageData(0,0,75,1);
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
        if(r+g+b === 0) {
           continue;
        }

        let alpha = data[i+3] / 255.0;
        r = alpha * r;
        g = alpha * g;
        b = alpha * b;

        let hex = ("0" + parseInt(r,10).toString(16)).slice(-2) +
		("0" + parseInt(g,10).toString(16)).slice(-2) +
		("0" + parseInt(b,10).toString(16)).slice(-2);
        str += `${x}.${y}:${hex},`;
        //str+=`${led}:${hex},`;
    }
    if(str.endsWith(",")) {
        str = str.slice(0, -1);
    }
    str += "]";
    console.log(str);
    if(socket.readyState === WebSocket.OPEN) {
        socket.send(str);
        //socket.send("[1.1:00ff00]\n");
    }
}
