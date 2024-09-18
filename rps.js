const crypto = require('crypto');
const readline = require('readline');

// Class to generate secure keys
class KeyGenerator {
    static generateKey() {
        return crypto.randomBytes(32).toString('hex'); // Generates a 256-bit key (64 hex chars)
    }
}

// Class to generate HMAC
class HMACGenerator {
    static generateHMAC(key, message) {
        return crypto.createHmac('sha3-256', key).update(message).digest('hex');
    }
}

// Class to determine game rules and winner
class GameRules {
    constructor(moves) {
        this.moves = moves;
        this.numMoves = moves.length;
    }

    determineWinner(userMove, computerMove) {
        const userIndex = this.moves.indexOf(userMove);
        const computerIndex = this.moves.indexOf(computerMove);
        const half = Math.floor(this.numMoves / 2);

        if (userIndex === computerIndex) {
            return "Draw";
        } else if ((computerIndex - userIndex + this.numMoves) % this.numMoves <= half) {
            return "Computer wins";
        } else {
            return "You win!";
        }
    }
}

// Class to display the help table
class HelpTable {
    static generateHelpTable(moves) {
        const header = ["Moves", ...moves];
        const table = [];

        moves.forEach((move1, i) => {
            const row = [move1];
            moves.forEach((move2, j) => {
                if (i === j) {
                    row.push("Draw");
                } else if ((j - i + moves.length) % moves.length <= Math.floor(moves.length / 2)) {
                    row.push("Win");
                } else {
                    row.push("Lose");
                }
            });
            table.push(row);
        });

        console.log("\n" + header.join('\t'));
        table.forEach(row => console.log(row.join('\t')));
    }
}

// Validate moves passed via command-line arguments
function validateMoves(moves) {
    if (moves.length < 3 || moves.length % 2 === 0) {
        console.error("Error: You must provide an odd number of moves (at least 3). Example: rock paper scissors");
        process.exit(1);
    }
    if (new Set(moves).size !== moves.length) {
        console.error("Error: Moves must be unique. Example: rock paper scissors");
        process.exit(1);
    }
}

// Function to handle game flow
async function gameFlow(moves) {
    validateMoves(moves);

    // Corrected usage of KeyGenerator class
    const key = KeyGenerator.generateKey();
    const computerMove = moves[Math.floor(Math.random() * moves.length)];
    const hmac = HMACGenerator.generateHMAC(key, computerMove);

    console.log(`HMAC: ${hmac}`);

    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
    });

    const askUser = () => {
        console.log("Available moves:");
        moves.forEach((move, index) => {
            console.log(`${index + 1} - ${move}`);
        });
        console.log("0 - Exit");
        console.log("? - Help");

        rl.question("Enter your move: ", (input) => {
            if (input === "0") {
                console.log("Exiting the game.");
                rl.close();
                process.exit(0);
            } else if (input === "?") {
                HelpTable.generateHelpTable(moves);
                askUser();
            } else {
                const userChoice = parseInt(input, 10);
                if (isNaN(userChoice) || userChoice < 1 || userChoice > moves.length) {
                    console.log("Invalid input, please try again.");
                    askUser();
                } else {
                    const userMove = moves[userChoice - 1];
                    console.log(`Your move: ${userMove}`);
                    console.log(`Computer move: ${computerMove}`);
                    const result = new GameRules(moves).determineWinner(userMove, computerMove);
                    console.log(result);
                    console.log(`HMAC key: ${key}`);
                    rl.close();
                }
            }
        });
    };

    askUser();
}

// Main function to start the game
function main() {
    const args = process.argv.slice(2);
    if (args.length < 3) {
        console.error("Error: You must provide at least 3 moves. Example: rock paper scissors");
        process.exit(1);
    }
    gameFlow(args);
}

main();
