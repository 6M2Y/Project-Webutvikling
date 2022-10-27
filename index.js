const canvas = document.getElementById("canvas"); //canvas api
const ordText = document.getElementById("ord-text"); 
const hitList = document.getElementById("hit-letter-display");
const scoreEl = document.getElementById("scoreEl");
const livesText = document.getElementById("liveScore");
const levelText = document.getElementById("levelScore");
const startBtn = document.getElementById("startBtn");
const startWindow = document.getElementById('startGameWindow');
const pointStartgamePage = document.getElementById("point");




const c = canvas.getContext('2d'); // canvas context
//canvas dimension

canvas.width = 900,
canvas.height = 500;

//can be added in the start btn click
let level = 4;
let lives = 5;

let ord =[
    "HEI", "JA", "DU", "MEG", "HER", "VI", "HVIS", "NÅ",
     "JO", "DET", "KAN", "SNU", "DRA", "KØ", "SPØR", "PC",
    "FRA", "FLY", "SAK", "STI","SPA","HUS","TRO",
    "SNØ","SKI", "STA","LUE","IS", "FRU",
]

let alphabets = ['A','B','C','D','E','F','G','H','I','J','K','L','M','N','O','P','Q','R','S','T','U','V','W','X','Y','Z','Æ','Ø','Å'];

let text_holder = []; // must be included in init function
let randomSpawnPos = [];
let bokstaver =[];
let projectiles = [];
let particles = [];

class Player
{
    constructor()
    {
        this.velocity = {
            x:0,
            y:0 
        }
    //image or sprite
        const img = new Image(); // js obj
        img.src = './img/shooter.png'
        let image_scale = .25;
        //wait for the image to be ready
        img.onload = () => {
            this.width = img.width * image_scale;
            this.height = img.height * image_scale;
            this.position = {
                x: canvas.width/2 - this.width/2,
                y: canvas.height -this.height * 1.1
            }
            this.image = img;
        }
        
    }
    draw()
        {
            c.drawImage(this.image, this.position.x, this.position.y, this.width, this.height)
        }
    update()
        {
            if(this.image){
                this.draw();
                this.position.x += this.velocity.x; // every frame add the x axis
            }
        }
}
//projectile class
class Projectile{
 constructor({position, velocity})
 {
    this.position = position;
    this.velocity = velocity;
    this.radius = 7;
 }
 draw()
 {
    c.beginPath()
    c.arc(this.position.x, this.position.y, this.radius, 0, Math.PI * 2);
    c.fillStyle = 'red';
    c.fill()
    c.closePath();
 }

 update()
 {
    this.draw();
    this.position.x += this.velocity.x;
    this.position.y += this.velocity.y;
 }
}

class Particle{
    constructor({position, velocity, radius, color})
    {
       this.position = position;
       this.velocity = velocity;
       this.radius = radius;
       this.color = color;
       this.opcity = 1;
    }
   
    draw()
    {
       c.save();
       c.globalAlpha = this.opcity;
       c.beginPath();
       c.arc(this.position.x, this.position.y, this.radius, 0, Math.PI * 2);
       c.fillStyle = this.color;
       c.fill()
       c.closePath();
       c.restore();
    }
   
    update()
    {
       this.draw();
       this.position.x += this.velocity.x;
       this.position.y += this.velocity.y;

       this.opcity -= 0.02;
    }
   }

class Bokstav
{
    constructor({position, text})
    {
        this.velocity =
        {
            x:0,
            y:0
        }
        this.text = text;
        this.position = {
                x: position.x,
                y: position.y
            }
        
        this.height = 38;
        this.width = c.measureText(text).width;
        this.radius = 22;
        }
    draw()
        {
                c.font = "36px Arial";
                c.textAlign = "center"
                c.fillStyle = "#6c584c"
                c.textBaseline = "middle"
                c.fillText(this.text, this.position.x, this.position.y)
            }
    update({velocity})
    {
            this.draw();
            this.position.y += velocity.y; // every frame add the y axis
    }
}

function awake(level)
{
    ordText.innerHTML = ord[level]; // display the word at index level on the page
    livesText.innerHTML = lives; //assigning lives
    levelText.innerHTML = level +1; 

    text_holder = ord[level].split(''); // split the sting at ord[level] to array
    // console.log("letters "+text_holder);

    let uniq_characters = alphabets.filter((e)=> text_holder.indexOf(e) === -1); //characters otherthan ord[level]...dummy letters other than the letter in the selected word

    //how many dummy letters 
    let numberOfDummyletters = Math.floor(Math.random() * 5) + 2;

    for (let index = 0; index < numberOfDummyletters; index++) 
        {
            text_holder.push(
                uniq_characters[Math.floor(
                Math.random() * uniq_characters.length
                )])
        }
  
    //shuffle the letters position in the array, to make them appear randomly
    shuffleArray(text_holder); 
    generateRandomPosition();
    letterContainer();

    //test
// console.log("text_holder" + text_holder)
// for (let index = 0; index < randomSpawnPos.length; index++) {
// //     console.log( "level: " + level + " x: " +randomSpawnPos[index].x + "y : "+ randomSpawnPos[index].y)
// }
    // console.log("2 letters "+text_holder);
}

//  awake(level); // this can be called with start game btn

function shuffleArray(array) {
        for (var i = array.length - 1; i > 0; i--) {
            var j = Math.floor(Math.random() * (i + 1));
            var temp = array[i];
            array[i] = array[j];
            array[j] = temp;
        }
    }
//end function

// howl sound
let sfx = {
    //sfx sounds
    hitSound : new Howl({
        src:'./snd/explosion.wav',
    }),
    missSound : new Howl({
        src:'./snd/buzz.wav',
    }),
    shootSound : new Howl({
        src:'./snd/shoot.wav',
    })
}
let music = {
    //background sound when click start game
    bgSound : new Howl({
        src: './snd/bgsound.mp3'
    })
}


let player = new Player() //start game

function generateRandomPosition() {
    let xPos = 0, length = text_holder.length; //cache the length
    let xStartPos = 50, xConstant = canvas.width / length;
    let size = 0;

    while (size < length) {
        randomSpawnPos[size] = { x: xStartPos, y: Math.floor(Math.random() * -40) };
        size++;
        xStartPos += xConstant;
    }
}


function letterContainer() {
    text_holder.forEach((bokstav, index) => {
        bokstaver.push(new Bokstav(
            {
                position: { x: randomSpawnPos[index].x, y: randomSpawnPos[index].y },
                //position:{ x: randomSpawnPos[index], y: -10},
                text: bokstav
            }
        ));
        console.log("letter: " + bokstav +" , " + randomSpawnPos[index].x + " , " + randomSpawnPos[index].y);
    });
}

function init()
{
     bokstaver =[];
     player = new Player() //start game
     projectiles = [];
     text_holder = [];
     particles = [];
     randomSpawnPos = []; 
     awake(level);
     
     //to avoid stacking recursion of animate
     if(frameLoop)
     {
        cancelAnimationFrame(frameLoop)
     }
     animate();
}

//consider this in init()
//key states
const key = {
    righKey : { isPressed : false},
    leftKey : { isPressed : false},
    space : { isPressed : false}
}

let score = 0;
let frameLoop;

//bgsound.play();

function animate()
{
   frameLoop = requestAnimationFrame(animate)
    {
        //black screen
        c.fillStyle = '#e9edc9'
        c.fillRect(0,0, canvas.width,  canvas.height);

        // c.fillStyle = '#f0ead2';

        player.update()

        //partilces fading
        particles.forEach((particle, index) =>
            {
                if(particle.opcity <= 0)
                {
                    particles.splice(index, 1);
                }
                else
                {
                    particle.update();
                }
            })
        //projectile movement
        //garbage collection if out of screen
        projectiles.forEach((projectile, index) =>{
            //if out of y-axis
           
            if(projectile.position.y + projectile.radius <= 0)
            {
                setTimeout(() => {
                    projectiles.splice(index,1)
                }, 0);
            }
            else
            {
                projectile.update();
            }
        })

        //the bone of the game logic
        bokstaver.forEach((bokstav, bokstav_index) =>
        {
            bokstav.update({velocity:{ x:0, y: Math.random() * 1.2}}); //if we want to accelerate with level, it has to be done here
            
            //collision detection from msdn           
            let letterleft = bokstav.position.x,
                letterRight = bokstav.position.x + bokstav.width,
                letterTop = bokstav.position.y,
                letterBottom = bokstav.position.y + bokstav.height;

            projectiles.forEach((projectile, projectile_index) => {

                if(projectile.position.y - projectile.radius  < letterBottom  &&
                    projectile.position.y + projectile.radius > letterTop &&
                    projectile.position.x + projectile.radius > letterleft &&
                    projectile.position.x - projectile.radius  < letterRight)
                {   

                    console.log(bokstav.text)
                   // setTimeout(() => {
                        //before removing, display particle explosion
                        for(let particle_count = 0; particle_count <20; particle_count++)
                        {
                            particles.push(new Particle({
                                position:{//position of bokstav
                                    x: bokstav.position.x,
                                    y: bokstav.position.y 
                                },
                                velocity:{
                                    //randomize the velocity
                                    x : (Math.random() - .5) * 6,
                                    y: (Math.random() - .5) *6
                                },
                                radius: Math.random() * 3,
                                color: '#6c584c'
                        }))
                        }
                        //check the hit letter is included in the letters of ord[level]
                        let isHit = ord[level].includes(bokstav.text);
                        createHitLetterList(bokstav.text, isHit);

                        scoreEl.innerHTML = score;
                        //remove bokstav and projectile at their respective index
                        bokstaver.splice(bokstav_index, 1);
                        projectiles.splice(projectile_index,1);
                    //}, 0);
                }
            });

            // gameover condition 1. the 
            if(letterBottom > canvas.height || lives <= 0 )
            {
                console.log("gameover");
                cancelAnimationFrame(frameLoop); //pauses the game
                pointStartgamePage.innerHTML = score;
                startWindow.style.display = 'flex'; 
                
            }

        })
//displaying the hitted letters on the page
//hit.innerHTML += hitLetter;
        //sjekk om right key pressed og så lenge det er innen doc.width
        if(key.righKey.isPressed && (player.position.x + player.width <= canvas.width))
            {
                player.velocity.x = 5;
            }
        else if(key.leftKey.isPressed && (player.position.x >= 0))
            {
                player.velocity.x = -5;
            }
        else
        {
            player.velocity.x = 0;
        }
    }
}

// animate();

//creating list for hitted list
let countletter_hit = 0;//counts the correct letter hit
function createHitLetterList(letter, isIncluded)
{
    var li = document.createElement('li');
    li.appendChild(document.createTextNode(letter));
    if(isIncluded)
    { 
        li.style.color = 'green';
        sfx.hitSound.play();
        countletter_hit+=1;
        //if 
        if(countletter_hit === ord[level].length)
        {
            //deactivate the keys til the player image loads
            key.leftKey.isPressed = false;
            key.righKey.isPressed = false;

            level += 1; //increent the level
            init();
           // animate();
            countletter_hit = 0 //reset the number of hit counts
        }
        score +=10;
    }
    else
    { //wrong letter hit
        li.style.color = 'red';
        score -=5;
        lives--;
        livesText.innerHTML = lives;
        setTimeout(sfx.missSound.play(), 1000);
        
        // buzzSound.stop();
    }
    hitList.appendChild(li);
}
//her kontroller vi key state

addEventListener('keydown', (event) =>
{
    switch(event.key)
    {
        case 'ArrowLeft':
            key.leftKey.isPressed = true;
            break;
        case 'ArrowRight':
            key.righKey.isPressed = true;
            break;
        case ' ':
            projectiles.push(
                new Projectile({
                    //positioning the projectile to the player position + offset
                    position:{
                        x:player.position.x + player.width /2,
                        y:player.position.y
                    },
                    // going up
                    velocity :{
                        x: 0,
                        y:-10
                    }} 
                )
            )
            key.space.isPressed = true;
            //play shoot sound
            sfx.shootSound.play();
            break;
    }
})

addEventListener('keyup', (event) =>
{
    switch(event.key)
    {
        case 'ArrowLeft':
            key.leftKey.isPressed = false;
            break;
        case 'ArrowRight':
            key.righKey.isPressed = false;
            break;
        case ' ':
            key.space.isPressed = false;
            break;
    }
})

startBtn.addEventListener('click', () =>
{
    level = 4;
    lives = 5;
    score = 0;
    scoreEl.innerHTML = score;
    livesText.innerHTML = lives;
    init();
    startWindow.style.display = 'none';
})
