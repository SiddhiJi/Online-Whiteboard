let canvas = document.querySelector("canvas");
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

let pencilColor = document.querySelectorAll(".pencil-color");
let pencilWidthElem = document.querySelector(".pencil-width");
let eraserWifthElem = document.querySelector(".eraser-width");
let download = document.querySelector(".fa-download");
let redo = document.querySelector(".fa-rotate-right");
let undo = document.querySelector(".fa-rotate-left");

let pencolor = "red";
let pencilWidth = pencilWidthElem.value;
let eraserWidth = eraserWifthElem.value; 

let undoredoTracker = []; //data
let track = 0;  //track increases when undo , decreases when redo

let mousedown = false;

//drwaing path on canvas (code taken  google search-> draing graphics canvas mdn)
let tool = canvas.getContext("2d"); //all graphics performed can be acced by this tool onlu, its a API to draw graphics

tool.strokeStyle = pencolor; //changes color of path drawn defult is black
tool.lineWidth = pencilWidth;

//perform drawing on basis of mouse listener
//mouedown = start new Path , mousemove = path fill distance(graphics)
canvas.addEventListener("mousedown", (e)=>{
    mousedown = true;
    //pasing object as parameter
    // beginPath({
    //     x: e.clientX,
    //     y: e.clientY
    // })
    let data = {
        x: e.clientX - canvas.offsetLeft,
        y: e.clientY - canvas.offsetTop,
        }
    socket.emit("beginPath", data);//data goes to server, here beginPth is idntifier
})
canvas.addEventListener("mousemove", (e)=>{
    if(mousedown){
        let data = {
            x: e.clientX - canvas.offsetLeft,
            y: e.clientY - canvas.offsetTop,
            color: flag3? "white":pencolor,
            width: flag3? eraserWidth : pencilWidth
        }
        socket.emit("drawstroke", data)//send data to server  where drawstroke is identifier
    }
})
canvas.addEventListener("mouseup", (e)=>{
    mousedown = false;
    //undoredo functionality when a path is completed
    let url = canvas.toDataURL();
    undoredoTracker.push(url);
    track = undoredoTracker.length - 1; //points to last url
})

undo.addEventListener(("click"), (e)=>{
    if(track > 0){ //so that it not go to -ve in undoredo array
        track--;
    }
    //action
    let data = {
        trackValue: track,
        undoredoTracker
    }
    //sending data to server
    socket.emit("redoundo", data);
    // undoredoCanvas(trackObj);
})

function undoredoCanvas(trackObj){
    track = trackObj.trackValue;
    undoredoTracker = trackObj.undoredoTracker;
    let img = new Image(); //new image reference element
    img.src = undoredoTracker[track]; //src = url
    img.onload = (e)=>{ //when it loads for ms image put that on the canvas using tool API
        tool.drawImage(img, 0, 0, canvas.width, canvas.height);
    }
}

redo.addEventListener(("click"), (e)=>{
    if(track < undoredoTracker.length-1){
        track++;
    }
    //action
    let data = {
        trackValue: track,
        undoredoTracker
    }
    //sending data to server
    socket.emit("redoundo", data);
    // undoredoCanvas(trackObj);
})

function beginPath(strokeObj){
    tool.beginPath();
    tool.moveTo(strokeObj.x, strokeObj.y); //it gives x and y value of mouse pointing by user
}
function drawStroke(strokeObj)
{
    tool.strokeStyle = strokeObj.color;
    tool.lineWidth = strokeObj.width;
    tool.lineTo(strokeObj.x, strokeObj.y);
    tool.stroke();
}

pencilColor.forEach((colorElem)=>{
    colorElem.addEventListener("click", (e)=>{
        let color = colorElem.classList[1];
        pencolor = color;
        tool.strokeStyle = pencolor;
    })
})

pencilWidthElem.addEventListener("change", (e)=>{
    pencilWidth = pencilWidthElem.value;
    tool.lineWidth = pencilWidth;
})

eraserWifthElem.addEventListener("change", (e)=>{
    eraserWidth = eraserWifthElem.value;
    tool.lineWidth = eraserWidth;
})

eraser.addEventListener("click", (e)=>{

    if(flag3){
        tool.strokeStyle = "white";
        tool.lineWidth = eraserWidth;
    }
    else{
        //back to initial pen width and color if arser deactivated
        tool.strokeStyle = pencolor;
        tool.lineWidth = pencilWidth;
    }
})

download.addEventListener("click", (e)=>{
    let url = canvas.toDataURL(); //converts canvas with graphics into url which can be downloaded

    let a = document.createElement("a");
    a.href = url;
    a.download = "board.jpg";
    a.click();
})

// tool.beginPath(); //new path will generate
// tool.moveTo(10,10); //start point of path
// tool.lineTo(100,150); //end point of path
// tool.stroke(); //fill color(graphic)

// tool.lineTo(200,200); //continues from prev path end as beginPath() not done
// tool.stroke();

socket.on("beginPath", (data)=>{
    //data from server received to all system socket and display on their system
    beginPath(data);
})
socket.on("drawstroke", (data)=>{
    //data from server received to all system socket
    drawStroke(data);
})
socket.on("redoundo", (data)=>{
    undoredoCanvas(data);
})