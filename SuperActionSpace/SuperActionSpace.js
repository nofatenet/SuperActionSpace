const speedDash = document.querySelector(".speedDash");
const scoreDash = document.querySelector(".scoreDash");
const lifeDash = document.querySelector(".lifeDash");
const container = document.getElementById("container");
const btnStart = document.querySelector(".btnStart");
const title = document.querySelector(".title");

btnStart.addEventListener("click", startGame);
document.addEventListener("keydown", pressKeyOn);
document.addEventListener("keyup", pressKeyOff);

//const song = new Audio("MHZ.mp3");

console.info("Welcome to Super Action Space! A game by Andy Lösch. Enjoy. Reach the GOAL!");

let shifter = 0;
let combiner = 0;

let animationGame;
let gamePlay = false;
let player;
let keys = {
    ArrowUp: false,
    ArrowDown: false,
    ArrowLeft: false,
    ArrowRight: false,
}

let shooting = false;

function startGame(){
    //console.log(gamePlay);
    //song.play();
    btnStart.style.display="none";
    title.style.display="none";
    var gameDiv = document.createElement("div");
    gameDiv.setAttribute("class", "playerCar");
    gameDiv.x = 400;
    gameDiv.y = 500;
    container.appendChild(gameDiv);
    gamePlay = true;
    animationGame = requestAnimationFrame(playGame);
    player = {
        ele: gameDiv,
        speed: 9,
        lives: 3,
        gameScore: 0,
        enemsToPass: 50, //GOAL?
        score: 0,
        roadwidth: 250,
        gameOverCounter: 0
    }

    startBoard();
    setupEnemy(20);     //How many Enemies do you want to have in your life? Tell me.

    console.info("the GOAL is:", player.enemsToPass);

}

function randomColor() {
    function c() {
        let hex = Math.floor(Math.random()*256).toString(16);
        return ("0"+String(hex)).substr(-2);
    }
    return '#'+c()+c()+c();
}

function setupEnemy(num){
    for (let x = 0; x < num; x++) {
        let enemyId = "badGuy"+(x+1);
        let div = document.createElement("div");
        div.innerHTML = (x+1);
        div.setAttribute("class", "fckingEnemy");
        div.setAttribute("id", enemyId);
        makeEnemy(div);
        container.appendChild(div);
    }
}

function makeEnemy(e) {
    let tempRoad = document.querySelector(".road");
    e.style.left = tempRoad.offsetLeft + Math.ceil(Math.random()*tempRoad.offsetWidth)-30+"px";
    e.style.top = Math.ceil(Math.random()* -400) + "px";
    e.speed = Math.ceil(Math.random()* 17)+ 2;
    // e.style.backgroundColor = randomColor();
}

function startBoard() {
    for (let x = 0; x < 7; x++) {                   // Number of the "Road" Tiles
        let div = document.createElement("div");
        div.setAttribute("class", "road");
        div.style.top = (x * 80) + "px";            // Size of the "Road" Tiles
        div.style.width = player.roadwidth + "px";
        container.appendChild(div);
    }
}

function updateDash() {
    // console.log(player);
    scoreDash.innerHTML = player.score;
    lifeDash.innerHTML = player.lives;
    speedDash.innerHTML = Math.round(player.speed *18); // What Speed to Display (MPH)
}

function moveRoad() {
    let tempRoad = document.querySelectorAll(".road");

    // console.log(tempRoad);
    let previousRoad = tempRoad[0].offsetLeft;
    let previousWidth = tempRoad[0].offsetWidth;

    const tempSpeed = Math.floor(player.speed);

    for (let x = 0; x < tempRoad.length; x++) {
        let num = tempRoad[x].offsetTop + tempSpeed;
        if(num > 600){
            num = num - 650;                    // Set it back to the Top
            let mover = previousRoad + (Math.floor(Math.random()*6)-3);
            let roadWidth = (Math.floor(Math.random()*11)-5) + previousWidth;
            
            if(roadWidth < 600) roadWidth = 600;
            if(roadWidth > 600) roadWidth = 600;
            if(mover < 20) mover = 20;
            if(mover > 600) mover = 600;
            tempRoad[x].style.left = mover + "px";
            tempRoad[x].style.width = roadWidth + "px";

        }
        tempRoad[x].style.top = num + "px";
    }
    return {
            "width": previousWidth,
            "left": previousRoad
            };
}

function pressKeyOn() {
    //event.preventDefault();
    //console.log(keys);
    keys[event.key] = true;
}

function pressKeyOff() {
    event.preventDefault();
    keys[event.key] = false; 
    player.ele.setAttribute("class", "playerCar");
}

//Collision Detection (https://developer.mozilla.org/en-US/docs/Web/API/Element/getBoundingClientRect)
function isCollide(a,b) {
    let aRect = a.getBoundingClientRect();
    let bRect = b.getBoundingClientRect();
    
    return !(
        (aRect.bottom < bRect.top) || (aRect.top > bRect.bottom) ||
        (aRect.right < bRect.left) || (aRect.left > bRect.right)
    )
}

function moveEnemy(){
    let tempEnemy = document.querySelectorAll(".fckingEnemy");
    for (let i = 0; i < tempEnemy.length; i++) {
        for (let j = 0; j < tempEnemy.length; j++) {
            // Enemy and Enemy collide... pushing away each other.
            if (i != j && isCollide(tempEnemy[i],tempEnemy[j])) {
                tempEnemy[j].style.top = (tempEnemy[j].offsetTop + 4)+"px";
                tempEnemy[i].style.top = (tempEnemy[i].offsetTop - 4)+"px";
                tempEnemy[j].style.left = (tempEnemy[j].offsetLeft - 8)+"px";
                tempEnemy[i].style.left = (tempEnemy[i].offsetLeft + 8)+"px";
            }
        }


        let y = tempEnemy[i].offsetTop + player.speed - tempEnemy[i].speed;
        
        if (y > 1000 || y < -2000) {
            makeEnemy(tempEnemy[i]);    //reset enemy when leaving the screen

            if (y > 1000) {
                player.score++;         //passing Enemy to get Score
                if (player.score > player.enemsToPass) {
                    gameOverGoalReach();
                }
            }

        } else {
            tempEnemy[i].style.top = y + "px";

            let hitPlayer = isCollide(tempEnemy[i],player.ele);
            
            //console.log(hitPlayer);
            //Collision Detection
            if(hitPlayer){
                player.speed = 1;
                player.lives --;
                if (player.lives < 1) {
                    console.log("Game Over");
                    player.gameOverCounter = 1;
                    //song.pause();
                }
                makeEnemy(tempEnemy[i]);
                zzfx(...[1,,9,.03,,.11,3,.15,3.5,,,,.07,,,,.19,,.08,.23]);
            }
        }

    }
}

function gameOverGoalReach() {
    let div = document.createElement("div");
    div.setAttribute("class", "road");
    div.style.top = "0px";
    div.style.left = "200px";
    div.style.width = "250px";
    div.style.backgroundColor = "#999";
    div.innerHTML = "GOAL";
    div.style.fontSize = "3em";
    div.style.opacity = 1;
    container.appendChild(div);
    player.gameOverCounter = 12;
}

function playGame() {
    if (player.gameOverCounter > 0) {
        player.gameOverCounter--;
        player.y = (player.y > 60) ? player.y -30 : 60;
        if (player.gameOverCounter == 0) {
            gamePlay = false;
            // btnStart.style.display = "block"; //Replay Not working right. Better hit F5 for now.
        }
    }

    if (gamePlay) {
        updateDash();
        let roadParameters = moveRoad();
        moveEnemy();
        //console.log(roadParameters);

        //Moving Background:
        shifter++;
        if (shifter > 600) {
            shifter = 0;
        }
        combiner = shifter + (player.speed * 2); //Speeding BG. Use High Number = Use Motion Sickness
        container.style.backgroundPositionY = combiner + "px";
        //container.style.backgroundPositionY = (player.speed * 8) + "px";

        //Movement:
        if (keys.ArrowUp) {
            if(player.ele.y > 420) player.ele.y -= 1;           // Game Area Top-Border 320 to Top
            player.speed = player.speed < 20 ? (player.speed+0.05) : 20;
            player.ele.setAttribute("class", "playerCarUp");

            zzfx(...[.4,.3,65,.03,.03,0,4,1.32,1.3,.9,100,,,,,.777,.1,.1,.04]);

            // container.style.backgroundPositionY = (player.speed * 8) + "px";
        }

        // if(keys.Enter) { 
        // }

        if (keys.ArrowDown && player.speed > 2) {
            if(player.ele.y < 512) player.ele.y += 1;           // Game Area Bottom-Border 512 to Top
            player.speed = player.speed > 0 ? (player.speed-0.2) : 0;
        }
        if (keys.ArrowLeft) {
            player.ele.x -= (player.speed/4) + 3;
            player.ele.setAttribute("class", "playerCarLeft");
        }
        if (keys.ArrowRight) {
            player.ele.x += (player.speed/4) + 3;
            player.ele.setAttribute("class", "playerCarRight");
        }

        // if ((player.ele.x + 40) < roadParameters.left ||
        // (player.ele.x > (roadParameters.left + roadParameters.width))) {
        //     console.log("off track!");
        //     if(player.ele.y < 512) {
        //         player.ele.y += +1;
        //         }
        //     player.speed = player.speed > 0 ? (player.speed - 0.2) : 1;
        // }

        if (player.ele.x < 20) {
            player.ele.x += 20;     // Border Limit Left
        }
        if (player.ele.x > 680) {
            player.ele.x -= 20;     // Border Limit Right
        }

        //Move Player:
        player.ele.style.top = player.ele.y + "px";
        player.ele.style.left = player.ele.x + "px";
    }

    animationGame = requestAnimationFrame(playGame);
}
