import React, { useState, useEffect, useRef } from "react";
import { useInterval } from "./hooks/useInterval";
import {
  CANVAS_SIZE,
  SNAKE_START,
  APPLE_START,
  SCALE,
  SPEED,
  DIRECTIONS
} from "./constants";
import "./App.css";

const [canvasWidth, canvasHeight] = CANVAS_SIZE;

const App = () => {
  const canvasRef = useRef();
  const [snake, setSnake] = useState(SNAKE_START);
  const [apple, setApple] = useState(APPLE_START);
  const [dir, setDir] = useState([0, -1]);
  const [speed, setSpeed] = useState(null);
  const [gameOver, setGameOver] = useState(false);
  const [count, setCount] = useState(0);
  const maxWidth = canvasWidth / SCALE - 1;

  const startGame = () => {
    setSnake(SNAKE_START);
    let newApple = createApple();
    while (checkCollision(newApple, snake)) {
      newApple = createApple();
    }
    setCount(0);
    setApple(newApple);
    setDir([0, -1]);
    setGameOver(false);
    setSpeed(300);
  };

  const endGame = () => {
    setSpeed(SPEED);
    setGameOver(true);
  };

  const moveSnake = ({ keyCode }) => {
    if (
      keyCode >= 37 &&
      keyCode <= 40 &&
      DIRECTIONS[keyCode][0] !== dir[0] &&
      DIRECTIONS[keyCode][1] !== dir[1]
    ) {
      setDir(DIRECTIONS[keyCode]);
    }
  };

  const createApple = (body = snake) => {
    return apple.map((_, i) =>
      Math.floor((Math.random() * CANVAS_SIZE[i]) / SCALE)
    );
  };

  const checkCollision = (piece, body = snake) => {
    if (
      piece[0] >= maxWidth + 1 ||
      piece[0] < 0 ||
      piece[1] >= maxWidth + 1 ||
      piece[1] < 0
    )
      return true;

    for (const segment of body) {
      if (segment[0] === piece[0] && segment[1] === piece[1]) return true;
    }
  };

  const updateScore = () => {
    setCount(prev => prev + 1);
    if (count >= 4 && count < 9) setSpeed(200);
    if (count >= 9) setSpeed(100);
  };

  const checkAppleCollision = (head, body = snake) => {
    if (head[0] === apple[0] && head[1] === apple[1]) {
      let newApple = createApple();
      while (checkCollision(newApple, body)) {
        newApple = createApple();
      }
      setApple(newApple);
      updateScore();
      return true;
    }
    return false;
  };

  const gameLoop = () => {
    const snakeCopy = JSON.parse(JSON.stringify(snake));
    const newSnakeHead = [snakeCopy[0][0] + dir[0], snakeCopy[0][1] + dir[1]];

    if (checkCollision(newSnakeHead, snakeCopy)) return endGame();
    snakeCopy.unshift(newSnakeHead);
    if (!checkAppleCollision(newSnakeHead)) {
      snakeCopy.pop();
    }
    setSnake(snakeCopy);
  };

  useEffect(() => {
    const context = canvasRef.current.getContext("2d");
    context.setTransform(SCALE, 0, 0, SCALE, 0, 0);
    context.clearRect(0, 0, canvasWidth, canvasHeight);
    context.fillStyle = "pink";
    snake.forEach(([x, y]) => context.fillRect(x, y, 1, 1));
    context.fillStyle = "lightblue";
    context.fillRect(apple[0], apple[1], 1, 1);
  }, [snake, apple, gameOver]);

  useInterval(() => gameLoop(), speed);

  return (
    <div role="button" tabIndex="0" onKeyDown={e => moveSnake(e)}>
      <canvas
        style={{ border: "1px solid black" }}
        ref={canvasRef}
        width={`${canvasWidth}px`}
        height={`${canvasHeight}px`}
      />
      {gameOver && <div>GAME OVER!</div>}
      <button onClick={startGame}>Start Game</button>
    </div>
  );
};

export default App;
