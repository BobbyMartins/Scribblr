// Get the canvas element and its context
const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
const parent = document.getElementById("canvas-parent");

canvas.height = 700;
canvas.width = parent.offsetWidth;
// Fill canvas with white background
ctx.fillStyle = '#FFFFFF';
ctx.fillRect(0, 0, canvas.width, canvas.height);

// Set the initial drawing color and thickness
let color = 'black';
let thickness = 35;
ctx.lineJoin = 'round';
ctx.lineCap = 'round';
ctx.strokeStyle = "#000";


// Initialize the starting point of the line
let isDrawing = false;

let startX = 0;
let startY = 0;

// Initialize erasing mode to false
let isErasing = false;

// Event listener for when the mouse is clicked down or touch screen is touched
function startDrawing(event) {
    event.preventDefault();
    let rect = canvas.getBoundingClientRect();
    isDrawing = true;
    if (event.type === 'mousedown') {
        startX = event.clientX - rect.left;
        startY = event.clientY - rect.top;
    } else if (event.type === 'touchstart') {
        startX = event.touches[0].clientX - rect.left;
        startY = event.touches[0].clientY - rect.top;
    }
}


// Event listener for when the mouse or finger is moved
function draw(event) {
    event.preventDefault();
    if (isDrawing) {
        let x, y;
        let rect = canvas.getBoundingClientRect();
        if (event.type === 'mousemove') {
            x = event.clientX - rect.left;
            y = event.clientY - rect.top;
        } else if (event.type === 'touchmove') {
            x = event.touches[0].clientX - rect.left;
            y = event.touches[0].clientY - rect.top;
        }

        // Draw or erase a line from the starting point to the current point
        ctx.beginPath();
        ctx.moveTo(startX, startY);
        ctx.lineTo(x, y);
        if (isErasing) {
            ctx.lineWidth = thickness + 5; // increase thickness for erasing
        } else {
            ctx.globalCompositeOperation = 'source-over'; // normal drawing mode
            ctx.strokeStyle = color;
            ctx.lineWidth = thickness;
        }
        ctx.stroke();

        // Update the starting point to be the current point
        startX = x;
        startY = y;
    }
}

// Event listener for when the mouse is released or finger is lifted
function endDrawing(event) {
    event.preventDefault();
    isDrawing = false;
}

// Event listener for when the mouse leaves the canvas or finger leaves the touch screen
function leaveCanvas(event) {
    event.preventDefault();
    isDrawing = false;
}

// Add event listeners for both mouse and touch events
canvas.addEventListener('mousedown', startDrawing);
canvas.addEventListener('mousemove', draw);
canvas.addEventListener('mouseup', endDrawing);
canvas.addEventListener('mouseleave', leaveCanvas);

canvas.addEventListener('touchstart', startDrawing);
canvas.addEventListener('touchmove', draw);
canvas.addEventListener('touchend', endDrawing);
canvas.addEventListener('touchcancel', leaveCanvas);

const clearButton = document.getElementById('clear');
clearButton.addEventListener('click', function() {
    ctx.fillRect(0, 0, canvas.width, canvas.height);
});

const eraseButton = document.getElementById('erase');
eraseButton.addEventListener('click', function() {
    isErasing = !isErasing; // toggle erasing mode
    if (isErasing) {
        eraseButton.classList.add('active');
        eraseButton.classList.add("button-erase-orange");
        ctx.strokeStyle = '#FFFFFF';
    } else {
        eraseButton.classList.remove('active');
        eraseButton.classList.remove("button-erase-orange");
    }
});

//write code to send whatever is on canvas to server
const submitButton = document.getElementById('submit');
submitButton.addEventListener('click', function() {
    const dataURL = canvas.toDataURL('image/png');
    $.ajax({
        type: 'POST',
        url: 'http://127.0.0.1:5000/predict',
        data: {
            'image': dataURL
        },
        success: function(response) {
            display_results(response.result)
        },
        error: function(error) {
            console.log(error);
        }
    });
});


// Get a picture from Unsplash based on a word
function display_results(results) {
    console.log(results)
    const div = document.getElementById('picture-res');
    div.innerHTML = '';
    for (var i = 0; i < results.length; i++) {
        const word = results[i].replace(/_/g, ' ');
        console.log(word);
        (function(i) {
            axios.get(`https://api.unsplash.com/search/photos?query=${word}&client_id=${accessKey}`)
                .then(response => {
                    // Pick a random picture from the results
                    const pictures = response.data.results;
                    const picture = pictures[0];
                    // Display the picture on the page
                    const pictureUrl = picture.urls.regular;
                    const pictureHtml = `<div class="col-3"><span>${word}</span><img class="speaker" src="speaker.png" alt="${word}-pronounce" onclick="playAudio('${word}')" height="28" width="28"><img src="${pictureUrl}" class="img-fluid" alt="${word}"><input type="radio" id="${word}" name="chosen_pic" value="${word}"> </div>`;
                    div.innerHTML += pictureHtml;
                })
                .catch(error => {
                    console.error(error);
                });
        })(i);
    }
    div.scrollIntoView({ behavior: 'smooth' });
}

async function playAudio(word) {
    const audioUrl = `https://translate.google.com/translate_tts?ie=UTF-8&q=${word}&tl=en&client=tw-ob`;
    const audio = new Audio(audioUrl);
    audio.type = 'audio/mp3';
    console.log(audio);
    try {
        await audio.play();
    } catch (err) {
        console.log(err);
    }
}
