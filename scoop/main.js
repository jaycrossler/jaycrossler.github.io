import './style.css';
import Phaser from 'phaser';

const sizes={
  width: 518,
  height: 375,
  appleStartHeight: 100,
  catcherHeight: 10
}

const gameSettings = {
  speedDown: 240,
  playerSpeed: 350,
  // speedDownMod: 150,
  gravity: 100,
  gameLength: 20
}

const divs = {
  start : document.querySelector('#gameStartDiv'),
  startButton : document.querySelector('#gameStartButton'),
  end : document.querySelector('#gameEndDiv'),
  winlose : document.querySelector('#gameWinLoseSpan'),
  endscore : document.querySelector('#gameEndScoreSpan'),
}

class GameScene extends Phaser.Scene{
  constructor(){
    super("scene-game")
    this.player;
    this.cursor;
    this.playerSpeed = gameSettings.playerSpeed;
    this.playerScore = 0;
    this.target;
    this.textTimer;
    this.timedEvent;
    this.remainingTime;
    this.coinMusic;
    this.bgMusic;
    this.emitter;
  }

  preload(){
    // this.load.image("bg", "/assets/backgrounds/underground_arena_25x30_empty_grid.jpg")
    this.load.image("bg", "/assets/butts1.png")
    this.load.image("apple", "/assets/poop32.png")
    this.load.image("basket", "/assets/basket.png")
    this.load.image("money", "/assets/money.png")
    this.load.audio("coin", "/assets/coin.mp3")
    this.load.audio("bgMusic", "/assets/bgMusic.mp3")
  }

  create(){

    this.scene.pause('scene-game')

    this.coinMusic = this.sound.add("coin")
    this.bgMusic = this.sound.add("bgMusic").play(false);

    this.add.image(0,0, "bg").setOrigin(0,0)
    this.player = this.physics
      .add.image(sizes.width/4,sizes.height-sizes.catcherHeight, "basket")
    this.player.setImmovable(true);
    this.player.body.allowGravity = false;
    this.player.setCollideWorldBounds(true);
    this.player
      .setSize(this.player.width * .75, this.player.height * .17)
      .setOffset(this.player.width * .1, this.player.height * .5)

    this.target = this.physics
      .add.image(this.getRandomX(), sizes.appleStartHeight, "apple")
      .setOrigin(0, 0)
      .setMaxVelocity(0, gameSettings.speedDown);

    this.physics.add.overlap(this.target, this.player, this.targetHit, null, this)

    this.cursor = this.input.keyboard.createCursorKeys()

    this.textScore = this.add.text(sizes.width - 120, 10, "Score: 0", {
      font: "25px Arial", fill: "#e5d3b3"
    })
    this.textTimer = this.add.text(10, 10, "Time Left: 0", {
      font: "25px Arial", fill: "#e5d3b3"
    })

    this.timedEvent = this.time.delayedCall(gameSettings.gameLength*1000, this.gameOver, [], this)

    this.emitter=this.add.particles(0,0, "money", {
      speed: 100,
      gravityY: gameSettings.gravity,
      scale:0.04,
      duration:100,
      emitting:false
    });
    this.emitter.startFollow(this.player, 0, 0, true)
  }

  update(){
    this.remainingTime = this.timedEvent.getRemainingSeconds()
    this.textTimer.setText(`Time Left: ${Math.round(this.remainingTime).toString()}`)
    if (this.target.y >= sizes.height) {
      this.targetRandomStart();
    }

    const { left, right } = this.cursor;

    if (left.isDown) {
      this.player.setVelocityX(-this.playerSpeed)
    } else if (right.isDown) {
      this.player.setVelocityX(this.playerSpeed)
    } else {
      this.player.setVelocityX(0)
    }
  }

  getRandomX(){
    const buffer = 50;
    return Math.floor(Math.random() * (sizes.width - buffer)) + buffer/2;
  }

  targetHit() {
    this.coinMusic.play();
    this.emitter.start();
    this.targetRandomStart();
    this.playerScore++;
    this.textScore.setText(`Score: ${this.playerScore}`)    
  }

  targetRandomStart() {
    this.target
      .setY(sizes.appleStartHeight)
      .setX(this.getRandomX());
    // this.setGravityY(gameSettings.speedDown + (gameSettings.speedDownMod * Math.random()))    
  }

  gameOver() {
    this.sys.game.destroy(true);

    divs.endscore.textContent = this.playerScore;
    if (this.playerScore >= 10) {
      divs.winlose.textContent = "Win!"
    } else {
      divs.winlose.textContent = "Lose!"
    }
    divs.end.style.display='flex';
  }

}

const config = {
  type: Phaser.WEBGL,
  width: sizes.width,
  height: sizes.height,
  canvas: gameCanvas,
  physics:{
    default:"arcade",
    arcade:{
      gravity:{y:gameSettings.speedDown},
      debug:false
    }
  },
  scene:[GameScene]
}

const game = new Phaser.Game(config);

divs.startButton.addEventListener("click", ()=>{
  divs.start.style.display = "none";
  game.scene.resume('scene-game');
})