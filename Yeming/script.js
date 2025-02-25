// Team Tetris
/* Members:
  Chih-Yin Chen
  Debora Correa Batista Bastos
  Mackenzie Sawyer
  Yeming Hu */

// Set the initial score to 0
let score = 0;
let scoreBox = document.querySelector(".score");
const again = document.querySelector(".again");

// Declare sound variables
const removeSound = new Audio("audio/remove.mp3");
const gameoverSound = new Audio("audio/gameover.mp3");
const rotateSound = new Audio("audio/rotate.wav");

// distance per step
const step = 20;
// 30 rows,20 columns
const rows = 30;
const cols = 20;

//colors
const colors = ["#f5821f", "#fa1e1e", "#d838cb", "#42c6f0", "#4bd838"];
let color;

// create data source for each model, position relative to 16 squares
let models = [
  // the first model object(L)
  {
    0: {
      row: 2,
      col: 0,
    },
    1: {
      row: 2,
      col: 1,
    },
    2: {
      row: 2,
      col: 2,
    },
    3: {
      row: 1,
      col: 2,
    },
  },

  // the second model object(T)
  {
    0: {
      row: 1,
      col: 2,
    },
    1: {
      row: 0,
      col: 1,
    },
    2: {
      row: 1,
      col: 1,
    },
    3: {
      row: 2,
      col: 1,
    },
  },

  // the third model object(o)
  {
    0: {
      row: 1,
      col: 1,
    },
    1: {
      row: 2,
      col: 1,
    },
    2: {
      row: 1,
      col: 2,
    },
    3: {
      row: 2,
      col: 2,
    },
  },

  // the forth model object(I)
  {
    0: {
      row: 1,
      col: 0,
    },
    1: {
      row: 1,
      col: 1,
    },
    2: {
      row: 1,
      col: 2,
    },
    3: {
      row: 1,
      col: 3,
    },
  },

  // the fifth model object(Z)
  {
    0: {
      row: 1,
      col: 1,
    },
    1: {
      row: 1,
      col: 2,
    },
    2: {
      row: 2,
      col: 2,
    },
    3: {
      row: 2,
      col: 3,
    },
  },
];

//currently used model
let currentModel = {};

//next model
let nextModel = {};

//the position of 16 squares
let currentX = 0,
  currentY = 0;

// Record the position of all block elements
// k = row_col : v = block element
let fixedElements = {};

//timer
let timer = null;

// init function
function init() {
  createModel();
  controlKey();
}

//onload event
window.onload = () => {
  init();
  // Get maxScore data from local storage
  let maxData = localStorage.getItem("maxScore");
  // If there is no maxScore data in local storage,
  // then maxScore is 0. else set maxScore to the value of this data
  maxData = maxData === null ? 0 : parseInt(maxData);
  document.querySelector(".maxScore").innerHTML = maxData;
};

// Create block elements based on the model's data source
function createModel() {
  //Determine if the game is over
  if (isGameOver()) {
    gameOver();
    return;
  }

  // Check if the nextModel object is empty
  if (Object.keys(nextModel).length === 0) {
    nextModel = models[Math.trunc(Math.random() * models.length)];
    currentModel = nextModel;
    // console.log(currentModel);
    nextModel = models[Math.trunc(Math.random() * models.length)];
    // console.log(nextModel);
    color = colors[Math.trunc(Math.random() * colors.length)];
  } else {
    currentModel = nextModel;
    nextModel = models[Math.trunc(Math.random() * models.length)];
    // console.log(nextModel);
  }
  // reset the position of the 16-square
  currentX = 0;
  currentY = 0;

  // If the new model appears, it will collide with the fixed model,
  // then there is no need to generate it and end the game
  if (isTouch(currentX, currentY, currentModel)) {
    gameOver();
    return;
  }

  //generate block elements
  for (let key in currentModel) {
    const divEle = document.createElement("div");
    divEle.classList.add("activeModel");
    divEle.style.background = color;
    document.querySelector(".container").appendChild(divEle);
  }

  // Locating the position of block element
  locationBlocks();
  // let the model drop automatically
  autoDrop();

  // Clear the content of nextOne
  document.querySelector(".nextOne").innerHTML = "";
  // generate a random color
  color = colors[Math.trunc(Math.random() * colors.length)];
  // generate block elements
  for (let key in nextModel) {
    const divEle1 = document.createElement("div");
    divEle1.classList.add("nextModel");
    divEle1.style.background = color;
    document.querySelector(".nextOne").appendChild(divEle1);
  }
  // Locating the position of next block element
  locationNext();
}

// Locating the position of block elements according to the data source
function locationBlocks() {
  checkBound();

  // get all the block elements
  let eles = document.querySelectorAll(".activeModel");
  for (let i = 0; i < eles.length; i++) {
    let activeModelEle = eles[i];
    //data of each block element(row,column), array-like objects are accessed by index
    let blockModel = currentModel[i];

    // Specify the corresponding position of the block element according to the data of each block element
    // the position of 16 squares +  the relative position of block element in 16 square
    activeModelEle.style.top = (currentY + blockModel.row) * step + "px";
    activeModelEle.style.left = (currentX + blockModel.col) * step + "px";
  }
}

// Locating the position of next block elements according to the data source
function locationNext() {
  // get all the next block elements
  let elesNext = document.querySelectorAll(".nextModel");
  for (let i = 0; i < elesNext.length; i++) {
    let nextModelEle = elesNext[i];
    //data of each block element(row,column), array-like objects are accessed by index
    let blockNext = nextModel[i];
    // Specify the corresponding position of the block element according to the data of each block element
    nextModelEle.style.top = blockNext.row * step + "px";
    nextModelEle.style.left = blockNext.col * step + "px";
  }
}

//use keyboard event to control the move
function controlKey() {
  document.addEventListener("keydown", (e) => {
    if (!bPause) {
      return;
    }
    // console.log(e.key);
    switch (e.key) {
      case "ArrowUp":
        // console.log("up");
        rotate();
        break;
      case "ArrowDown":
        // console.log("down");
        move(0, 1);
        break;
      case "ArrowLeft":
        // console.log("left");
        move(-1, 0);
        break;
      case "ArrowRight":
        // console.log("right");
        move(1, 0);
        break;
    }
  });
}

//move
// control the move of the position of the 16-square grid
function move(x, y) {
  //if the position to be moved will be touched, it will not move
  if (isTouch(currentX + x, currentY + y, currentModel)) {
    // The touch on the bottom occurs when moving 16 squares, and is caused by the change of the position of y
    if (y !== 0) {
      fixBottom();
    }
    return;
  }
  // Control the move of the 16-squares
  currentX += x;
  currentY += y;
  //Repositioning of block element according to the position of the 16-squares
  locationBlocks();
}

// rotate function
// algorithm:
// Rows after rotation are equal to columns before rotation
// Column after rotation is equal to 3 minus row before rotation
function rotate() {
  // use deep copy to clone a new object of currentModel,
  // so changes to the new object will not affect the current one.
  const cloneCurrentModel = JSON.parse(JSON.stringify(currentModel));
  // iterate over the model data source
  for (let key in cloneCurrentModel) {
    // block element data
    let blockModel = cloneCurrentModel[key];
    // implement the algorithm
    let temp = blockModel.row;
    blockModel.row = blockModel.col;
    blockModel.col = 3 - temp;
  }

  // If the touch will occur after the rotation, then there is no need to rotate
  if (isTouch(currentX, currentY, cloneCurrentModel)) {
    return;
  }
  // else accept the rotate
  currentModel = cloneCurrentModel;
  locationBlocks();
  rotateSound.play();
}

//Let the model only move in the container
function checkBound() {
  // Defines the range in which the model can move
  const leftBound = 0;
  const rightBound = cols;
  const bottomBound = rows;
  //When the block element exceeds the scope of the container, let the 16-square take a step back
  for (let key in currentModel) {
    let blockModel = currentModel[key];
    // left bound
    if (blockModel.col + currentX < leftBound) {
      currentX++;
    }
    //right bound
    if (blockModel.col + currentX >= rightBound) {
      currentX--;
    }
    //bottom bound
    if (blockModel.row + currentY >= bottomBound) {
      currentY--;
      // fix the model at the bottom
      fixBottom();
    }
  }
}

//fix the model at the bottom
function fixBottom() {
  // change the style of the model
  let activeModelEles = document.querySelectorAll(".activeModel");
  // Because of js effects, it is necessary to traverse from the back to the front
  for (let i = activeModelEles.length - 1; i >= 0; i--) {
    let activeModelEle = activeModelEles[i];
    // Change the className of block element in the model,so the locationBlocks() won't work for it.
    activeModelEle.className = "fixedModel";
    // activeModelEle.classList.remove(".activeModel");
    //put the element into the fixedElements
    const blockModel = currentModel[i];
    fixedElements[
      currentY + blockModel.row + "_" + (currentX + blockModel.col)
    ] = activeModelEle;
  }

  //Determine whether the row should be removed
  isRemoveRow();

  // create a new model
  createModel();
}

// isTouch function
// Determine whether the model in the activity would touch the fixed block element
// x,y :the position where the 16th grid will move to
// model: Changes to be made on the currently active model
function isTouch(x, y, model) {
  for (let key in model) {
    const blockModel = model[key];
    //Whether there is already a block element at this position
    if (fixedElements[y + blockModel.row + "_" + (x + blockModel.col)]) {
      return true;
    }
  }
  return false;
}

// Determine whether a row is need to be removed
function isRemoveRow() {
  // iterate over all columns in all rows
  for (let i = 0; i < rows; i++) {
    // Assuming the current row is full,set flag = true
    let flag = true;
    //iterate over all columns in current row
    for (let j = 0; j < cols; j++) {
      // If there is no data in a column in the current row, it means that this row is not full
      if (!fixedElements[i + "_" + j]) {
        flag = false;
        break;
      }
    }
    // when this row is full
    if (flag) {
      removeRow(i);
    }
  }
}

//remove the row which is full
function removeRow(row) {
  // play a sound that remove a line.
  removeSound.play();
  for (let i = 0; i < cols; i++) {
    // remove all the block elements of this row
    document
      .querySelector(".container")
      .removeChild(fixedElements[row + "_" + i]);
    // remove the data source of these block elements
    fixedElements[row + "_" + i] = null;
  }

  dropElements(row);
  //add the scores
  score += 100;
  scoreBox.innerHTML = `${score}`;
}

//Make block elements above the removed row drop
function dropElements(row) {
  //Let the row where the block elements above the removed row add one.
  // Iterate over all rows above the removed row
  for (let i = row - 1; i >= 0; i--) {
    // all the cols on this row
    for (let j = 0; j < cols; j++) {
      // if data does not exist
      if (!fixedElements[i + "_" + j]) {
        continue;
      }
      //data exists
      //rows+1
      fixedElements[i + 1 + "_" + j] = fixedElements[i + "_" + j];
      // Let the position of the block element drop
      fixedElements[i + 1 + "_" + j].style.top = (i + 1) * step + "px";
      //Set the previous block element to null
      fixedElements[i + "_" + j] = null;
    }
  }
}

// let the model drop automatically
function autoDrop() {
  if (timer) {
    clearInterval(timer);
  }
  timer = setInterval(function () {
    move(0, 1);
  }, 800);
}

//Determine if the game is over
function isGameOver() {
  for (let i = 0; i < cols; i++) {
    //When there is block elements at row 0
    if (fixedElements["0_" + i]) {
      return true;
    }
  }
  return false;
}

// gameOver function
function gameOver() {
  // Play the game over sound
  gameoverSound.play();
  // stop the timer
  if (timer) {
    clearInterval(timer);
  }
  // reset the maxScore
  let maxData = localStorage.getItem("maxScore");
  let maxScore = Math.max(maxData, score);
  //when the maxScore in the local storage is less than the current maxScore,
  // the display value of maxScore will be changed, and the value in the local storage will also be changed
  if (parseInt(maxData) < maxScore || maxData === null) {
    localStorage.setItem("maxScore", maxScore);
  }
  document.querySelector(".maxScore").innerHTML = maxScore;
  // console.log(localStorage.getItem("maxScore"));
  alert(`Game Over! Your score is ${maxScore}`);
}

//restart the game
again.addEventListener("click", () => {
  location.reload(true);
});

// pause click event
const pause = document.querySelector(".pause");
let bPause = true;
pause.addEventListener("click", function () {
  if (bPause) {
    clearInterval(timer);
    bPause = !bPause;
    this.innerHTML = "Start";
    this.style.backgroundColor = "red";
  } else {
    timer = setInterval(function () {
      move(0, 1);
    }, 800);
    bPause = true;
    this.innerHTML = "Pause";
    this.style.backgroundColor = "";
  }
});




