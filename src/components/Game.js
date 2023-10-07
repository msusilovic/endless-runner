import React, {Component} from 'react';
import "./Game.css";
import * as Const from "./constants"

class Game extends Component {
    state = {
        player: {
            x: Const.PLAYER_X,
            y: Const.PLAYER_MIN_Y,
            dimension: Const.PLAYER_DIM,
            jumping: false,
            up: true,
            maxHeight: Const.PLAYER_MAX_Y,
            minHeight: Const.PLAYER_MIN_Y,
            velocity: Const.PLAYER_VELOCITY
        },
        obstacle: {
            x: Const.CANVAS_WIDTH,
            y: Const.OBSTACLE_Y,
            dimension: Const.OBSTACLE_DIM,
            velocity: Const.OBSTACLE_VELOCITY
        },
        started: false,
        lives: Const.MAX_LIVES,
        hearts: Array(Const.MAX_LIVES).fill({src: Const.RED_HEART_SRC}),
        score: 0,
        frame: true,
        highScore: 0
    };

    time = 0;

    updateHearts() {
        const hs = [];
        const lives = this.state.lives;
        for (let i = 0; i < lives; i++) {
            hs.push({src: Const.RED_HEART_SRC});
        }
        for (let i = lives; i < 5; i++) {
            hs.push({src: Const.WHITE_HEART_SRC});
        }
        this.setState({hearts: hs})
    }

    update = () => {
        this.time += 1;
        if (this.time % 50 === 0) {
            const score = this.state.score + 10;
            this.setState({score: score});
        }

        if (this.time % 4 === 0) {
            this.setState({frame: !this.state.frame})
        }

        const obstacle = this.state.obstacle;
        let lives = this.state.lives;
        const player = this.state.player;

        obstacle.x += this.state.obstacle.velocity;
        if (this.time % 50 === 0) {
            obstacle.velocity -= 1;
            if (player.velocity >= -15) {
                player.velocity -= 1;
            }
        }
        // check for collision
        if (obstacle.x < player.x + player.dimension - 30 &&
            obstacle.x + obstacle.x + obstacle.dimension > player.x &&
            player.y + player.dimension > obstacle.y + 10) {
            obstacle.x = 1200;
            lives = lives - 1;
            this.setState({lives: lives});
            if (lives === 0) {
                this.setState({started: false});
                if (this.state.highScore < this.state.score) {
                    this.setState({highScore: this.state.score});
                }
            }
        }
        if (obstacle.x < 0) {
            obstacle.x = 1200;
        }
        this.setState({obstacle: obstacle});

        // jump
        if (player.jumping) {
            if (player.up) {
                player.y += player.velocity;
            } else {
                player.y -= player.velocity;
            }

            if (player.y >= player.minHeight) {
                player.jumping = false;
                player.up = true;
            }
        }
        if (player.y <= player.maxHeight) {
            player.up = false;
        }
        this.setState({player: player});

        this.updateHearts();
    };

    onKeyPress = () => {
        let player = this.state.player;
        if (player.jumping) {
            return;
        }
        player.jumping = true;
        player.y += player.velocity;
        player.up = true;
        this.setState({player: player})
    };

    componentDidMount() {
        document.addEventListener('keydown', (e) => {
            if (e.code === "Space") {
                this.onKeyPress();
            }
        });
        setInterval(() => {
            if (this.state.started) {
                this.update();
                this.draw();
            }

        }, 2000 / 60);
    }

    draw = () => {
        const ctx = this.refs.canvas.getContext("2d");

        //load clouds
        const clouds = new Image();
        clouds.src = Const.CLOUDS_SRC;

        //load obstacle
        const obstacle = new Image();
        obstacle.src = Const.SNAKE_SRC;

        // load player
        const player = new Image();
        player.src = (this.state.frame || this.state.player.jumping) ? Const.RUNNER1_SRC : Const.RUNNER2_SRC;

        // reset canvas
        ctx.clearRect(0, 0, Const.CANVAS_WIDTH, Const.CANVAS_HEIGHT);

        // sky
        ctx.rect(0, 0, Const.CANVAS_WIDTH, Const.CANVAS_HEIGHT);
        ctx.fillStyle = Const.SKY_COLOR;
        ctx.fill();

        // ground
        ctx.beginPath();
        ctx.rect(0, 570, Const.CANVAS_WIDTH, 130);
        ctx.fillStyle = Const.GROUND_COLOR;
        ctx.closePath();
        ctx.fill();

        // grass
        ctx.beginPath();
        ctx.rect(0, 550, this.refs.canvas.width, 20);
        ctx.fillStyle = Const.GRASS_COLOR;
        ctx.closePath();
        ctx.fill();

        // clouds
        clouds.onload = function () {
            ctx.drawImage(clouds, 300, 50, 900, 400);
        };

        // obstacle
        const o_x = this.state.obstacle.x;
        const o_y = this.state.obstacle.y;
        const o_w = this.state.obstacle.dimension;
        const o_h = this.state.obstacle.dimension;
        obstacle.onload = function () {
            ctx.drawImage(obstacle, o_x, o_y, o_w, o_h);
        };

        // player
        const p_x = this.state.player.x;
        const p_y = this.state.player.y;
        const p_w = this.state.player.dimension;
        const p_h = this.state.player.dimension;
        player.onload = function () {
            ctx.drawImage(player, p_x, p_y, p_w, p_h);
        };
    };

    onStartButton = () => {
        const player = this.state.player;
        player.jumping = false;
        player.velocity = Const.PLAYER_VELOCITY;
        player.y = Const.PLAYER_MIN_Y;
        const obstacle = this.state.obstacle;
        obstacle.velocity = Const.OBSTACLE_VELOCITY;
        this.setState({
            score: 0,
            started: true,
            lives: Const.MAX_LIVES,
            hearts: Array(Const.MAX_LIVES).fill({src: Const.RED_HEART_SRC}),
            obstacle: obstacle,
            player: player
        });
    };

    render() {
        return (
            <div className="game">
                {this.state.started ?
                    <canvas className="canvas" ref="canvas" width={Const.CANVAS_WIDTH} height={Const.CANVAS_HEIGHT}/>
                    :
                    <div className="start-screen">
                        {this.state.score > 0 &&
                        <div className="final-scoreboard">
                            <span className="final-score">Score: {this.state.score}</span>
                            <span className="high-score">High score: {this.state.highScore}</span>
                        </div>
                        }
                        <button className="start-button" onClick={this.onStartButton}>
                            <img className="start-button-image"
                                 src={Const.BUTTON_SRC}
                                 alt="start button"/>
                        </button>
                        <img className="runner"
                             src={Const.RUNNER_GIF_SRC}
                             alt="runner"/>
                    </div>}
                {this.state.started &&
                <div className="scoreboard">
                    {this.state.hearts.map((image, index) =>
                        <img className="heart" alt="heart" src={image.src} key={image.index}/>)}
                    <span className="score">Score: {this.state.score}</span>
                </div>}
            </div>
        );
    }
}

export default Game;
