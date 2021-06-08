/*
Doge selection.
*/

document.addEventListener("DOMContentLoaded", run);        

// Container to store state of balls
var DOGE_PROFILE = [];

var NUM_GENES = 250;

var NUM_DOGE = 50;

var MUTATION_RATE = 0.01;

var VEL = 50;

var AVERAGE_FITNESS = 0;
var GENERATION_COUNTER = 0;

var DOGE_POSITION_X = 600
var DOGE_POSITION_Y = 20

var DOGE_WIDTH = 250
var DOGE_HEIGHT = 150

var TREAT_POSITION_X = 0
var TREAT_POSITION_Y = 690
var TREAT_WIDTH = 140
var TREAT_HEIGHT = 110

class Doge {
    /* Doge class to hold ball characteristics and properties */
    constructor(x, y, id) {
        /**
         * Positions
         */
        this.x = x;
        this.y = y;
        this.index = 0;
        this.fitness = 0;
        this.done = false;
        this.name = "Doge " + id;
    }

    draw() {
        /**
         * Draw the balls with its styles
         */
        
        var canvas = document.getElementById('canvas');
        this.ctx = canvas.getContext('2d');
        const image = document.getElementById('doge');

        this.ctx.fillStyle = 'rgb(173, 216, 230)';
        if (this.done) {
            this.ctx.fillStyle = 'rgb(32, 171, 56)';
        }
        this.ctx.beginPath();
        this.ctx.drawImage(image, this.x, this.y, DOGE_WIDTH, DOGE_HEIGHT)
        this.ctx.fill();
    }

    update() {
        if (TREAT_POSITION_X  < this.x && TREAT_POSITION_X + TREAT_WIDTH  > this.x 
            && 
            TREAT_POSITION_Y < this.y && TREAT_POSITION_Y + TREAT_HEIGHT > this.y) {
            this.done = true;
            this.index++;
        }
        // Continue
        else if (this.index < NUM_GENES) {
            this.x += VEL * this.genes[this.index][0];
            this.y += VEL * this.genes[this.index][1];
            this.index++;
        }
    }

    setGenes(genes) {
        /**
         * Input array of genes
         */
        this.genes = genes;
    }

    randomiseFirstGenerationGenes() {
        /*Randomised vectors of each doge.*/
        this.genes = [];
        for (let i = 0; i < NUM_GENES; i++) {
            this.genes[i] = [Math.random()-0.5, Math.random()-0.5] // random x,y vector
        }
    }

    calculateFitness() {
        var average_x = (TREAT_POSITION_X + TREAT_POSITION_X + TREAT_WIDTH) / 2;
        var average_y = (TREAT_POSITION_Y + TREAT_POSITION_Y + TREAT_HEIGHT) / 2;
        var d = Math.sqrt((this.x - average_x) ** 2 + (this.y - average_y) ** 2);
        this.fitness = Math.max(0, 1 - d/800);
    }

}
function run() {
    /**
     * Run 
     */

    // Initialise first generation - randomised genes
    for (let i = 0; i < NUM_DOGE; i++) {
        var b = new Doge(DOGE_POSITION_X, DOGE_POSITION_Y, i);
        b.randomiseFirstGenerationGenes();
        DOGE_PROFILE.push(b);
    }

    // Begin generation loop
    animateLoop();    


}

async function animateLoop() {
    /**
     * Loops the generation
     */
    var canvas = document.getElementById('canvas');
    var ctx = canvas.getContext('2d');

    // Clear the canvas to restart
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Update doge movements
    for (let i = 0; i < NUM_DOGE; i++) {
        var b = DOGE_PROFILE[i];
        b.update();
        b.draw();
    }
    
    // The Food!
    ctx.fillStyle = 'rgb(173, 216, 230)';
    const dogeTreat = document.getElementById('dogeTreat');
    ctx.drawImage(dogeTreat, TREAT_POSITION_X, TREAT_POSITION_Y, TREAT_WIDTH, TREAT_HEIGHT)

    // Generation UI
    ctx.fillStyle = 'rgb(0,0,0)';
    ctx.font = "25px Arial";
    ctx.fillText("Doge Generation: " + GENERATION_COUNTER.toString(), 15, 45);
    ctx.fillText("Average Population Fitness: " + AVERAGE_FITNESS.toFixed(2).toString(), 415, 775);

    let last = DOGE_PROFILE.slice(-1)[0];

    // First ball genes have 
    if (last.index == NUM_GENES) {
        nextGen();
    }

    requestAnimationFrame(animateLoop);

}


  
function nextGen() {
    /*Reproduction function*/

    // Update generation count
    GENERATION_COUNTER++;
    console.log("Generation", GENERATION_COUNTER);

    // Alpha doges
    var candidates = [];
    var total_fitness = 0;
    
    for (let i = 0; i < NUM_DOGE; i++) {
        var b = DOGE_PROFILE[i];
        b.calculateFitness();
        total_fitness += b.fitness;
        // Selection
        for (let j = 0; j < (2 ** (b.fitness * 10)); j++) {
            candidates.push(b);
        }
    }
    console.log(candidates.length);

    // Update average fitness
    AVERAGE_FITNESS = total_fitness / NUM_DOGE;
    console.log("Average fitness", AVERAGE_FITNESS);

    var DOGE_PROFILE_NEXT_GEN = [];

    for (let i = 0; i < NUM_DOGE; i++) {
        var dad = candidates[Math.floor(Math.random() * candidates.length)];
        var mum = candidates[Math.floor(Math.random() * candidates.length)];
        var genes = [];
        for (let j = 0; j < NUM_GENES; j++) {
            // Implement mutation rate to provide some variation
            if (Math.random() < MUTATION_RATE) {
                genes.push([Math.random()-0.5, Math.random()-0.5]);
            }
            // Even genes are assigned to dad
            else if (j % 2) { 
                genes.push(dad.genes[j]);
            }
            // Odd genes are assigned to mum
            else { 
                genes.push(mum.genes[j]);
            }
        }
        var baby = new Doge(DOGE_POSITION_X, DOGE_POSITION_Y, i);
        baby.setGenes(genes);
        DOGE_PROFILE_NEXT_GEN.push(baby)
    }

    console.log("Reproduction complete.")

    // Replace previous generation with new generation
    DOGE_PROFILE = DOGE_PROFILE_NEXT_GEN;
}
