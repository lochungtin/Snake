<img src='./img/icon.png' width='150'>
<br />

# Snake

Simple game of snake coded in static HTML, JavaScript, and CSS

## Basics

- Press space to start, pause, and restart.
- Use the arrow keys and / or W A S D, to control directions.

## Intended use

Used for a Neural Expected Sarsa Reinforcement Learning Agent to train. But it is also coded so that the game itself is playable by humans as well.

More information and repo of the training agent can be accessed <a href='https://github.com/lochungtin/snakeAI'>here</a>.

### Dots bar

The line of dots above the main play grid is used for the AI agent to both calibrate the vision system and convey additional state information. 

#### Calibration

The leftmost dot is the calibration dot, all subsequent locations for pixel readings are based on the calibartion dot.

#### State Info

The middle 4 dots indicate the direction of the snake. From left to right, each dot indicated, up, down, left, and right respectively.

The rightmost dot indicates whether if on that exact frame, the snake comes in contact with the orb. If so, the dot will flash a brighter shade of red.

## Gallery

|          Dark Mode 11 x 11 Grid (default)           |                     9 x 9 Grid                     |
| :-------------------------------------------------: | :------------------------------------------------: |
| <img src='./img/screenshots/d11.png' width='400' /> | <img src='./img/screenshots/d9.png' width='400' /> |

|                     7 x 7 Grid                     |                     Setting Menu                      |
| :------------------------------------------------: | :---------------------------------------------------: |
| <img src='./img/screenshots/d7.png' width='400' /> | <img src='./img/screenshots/dMenu.png' width='400' /> |

|               Light Mode 11 x 11 Grid               |                     Setting Menu                      |
| :-------------------------------------------------: | :---------------------------------------------------: |
| <img src='./img/screenshots/l11.png' width='400' /> | <img src='./img/screenshots/lMenu.png' width='400' /> |


## Game Settings

### Game Speed
1. Easy Mode
   - Frame Speed: 500 ms per frame
   - Score Multiplier: x0
2. Normal Mode (default)
   - Frame Speed: 300 ms per frame
   - Score Multiplier: x1
3. Hard Mode
   - Frame Speed: 100 ms per frame
   - Score Multiplier: x2
4. Insane Mode (indented for AI Training)
   - Frame Speed: 50 ms per frame
   - Score Multiplier: x3

### Grid Size
1. 11 x 11 (default)
2. 9 x 9
3. 7 x 7

## Score Keeping

When the snake eats an orb, a value (depending on difficulty) will be added to the total score. Score calculation has to components, the base score and the multiplied score. The base score is 50 and the multiplied score depends on the selected speed of the game.

### Score Multipliers
The value of the score multiplier is 50, with a base score of 50, the multiplied speed of each difficulty is as follows
- Easy: 50
- Normal: 100
- Hard: 150
- Insane: 200

### High Scores
For each difficulty and grid size, a separate high score is kept and stored in the browser's local storage
