// Initialize Phaser, and creates a 400x490px game
var game = new Phaser.Game(400, 490, Phaser.AUTO, 'game_div');

// Creates a new 'main' state that wil contain the game
var main_state = {

    preload: function() { 
		// Function called first to load all the assets
		
		// Change the background color of the game
		this.game.stage.backgroundColor = '#71c5cf';

		// Load the bird sprite
		this.game.load.image('bird', 'assets/bird.png');

		// Load the pipe sprite
		this.game.load.image('pipe', 'assets/pipe.png');

        // Load the jump sound
        this.game.load.audio('jump', 'assets/jump.wav');  
    },

    create: function() { 
    	// Fuction called after 'preload' to setup the game
    	// Display the bird on the screen
    	this.bird = this.game.add.sprite(100, 245, 'bird');

    	// Add gravity to the bird to make it fall
    	this.bird.body.gravity.y = 1000;

        // Change the center or rotation of the bird
        this.bird.anchor.setTo(-0.2, 0.5);  

    	// Call the 'jump' function when the spacebar is hit
    	var space_key = this.game.input.keyboard.addKey(Phaser.Keyboard.SPACEBAR);
    	space_key.onDown.add(this.jump, this);

        // Call the 'jump' function on tap
        this.game.input.onTap.add(this.jump, this);

    	// Create a group of pipe sprites
    	this.pipes = game.add.group();
    	this.pipes.createMultiple(20, 'pipe');

    	// To actually add pipes in the game, we need to call the add_row_of_pipes() function every 1.5 seconds.
    	this.timer = this.game.time.events.loop(1500, this.add_row_of_pipes, this);

    	// Add a score label to the top left
    	this.score = 0;
    	var style = { font: "30px Arial", fill: "#ffffff" };
    	this.label_score = this.game.add.text(20, 20, "0", style);

        this.jump_sound = this.game.add.audio('jump');  

    },
    
    update: function() {
		// Function called 60 times per second
		
		// If the bird flies too high or too low, restart the game.
		if(this.bird.inWorld == false) {
			this.restart_game();
		}

        // Always slowly rotate the bird downward, up to a certain point.
        if(this.bird.angle < 20) {
            this.bird.angle += 1;
        }

        this.game.physics.overlap(this.bird, this.pipes, this.hit_pipe, null, this);
    },

    //Make the bird jump
    jump: function() {
        // If bird is dead, don't allow  it to jump
        if(this.bird.alive == false) {
            return;
        } 
        
    	// Add a vertical velocity to the bird
    	this.bird.body.velocity.y = -350;

        // create an animation on the bird 
        // Set the animation to change the angle of the sprite to -20 in 100 milliseconds
        // // And start the animation
        this.game.add.tween(this.bird).to({angle: -20}, 100).start();

        this.jump_sound.play(); 

    },

    restart_game: function() {
    	// Remove any existing timer
    	this.game.time.events.remove(this.timer);  

    	// Start the 'main' state, which restarts the game
    	this.game.state.start('main');
    },

    // Displays one pipe
    add_one_pipe: function(x, y) {
    	// Get the first dead pipe of our group
    	var pipe = this.pipes.getFirstDead();

    	// Set the new position of the pipe
    	pipe.reset(x, y);

    	// Add velocity to the pipe to make it move left
    	pipe.body.velocity.x = -200;

    	// Kill the pipe when it is no longer visible
    	pipe.outOfBoundsKill = true;
    },

    // Display 6 pipes in a row with a hole somewhere in the middle
    add_row_of_pipes: function() {
    	var hole = Math.floor(Math.random() * 5) +1;

    	for(var i = 0; i < 8; i++) {
    		if(i != hole && i != hole + 1) {
    			this.add_one_pipe(400, i * 60 + 10);
    		}
    	}

    	//  to increase the score by 1 each time new pipes are created.
    	this.score += 1;
    	this.label_score.content = this.score;
    },

    hit_pipe: function() {
        // Set the 'alive' property of the bird to false
        this.bird.alive = false;

        // Prevent new pipes from appearing
        this.game.time.events.remove(this.timer);

        // Go through all the pipes, and stop their movement
        this.pipes.forEachAlive(function(p){
            p.body.velocity.x = 0;
        }, this);
    },
};

// Add and start the 'main' state to start the game
game.state.add('main', main_state);  
game.state.start('main'); 