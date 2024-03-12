# logi.js

logi.js is a JavaScript library for working with Boolean algebra, logical expressions, truth tables, the Quine-McCluskey algorithm, timing diagrams, and more.  

## Installation
### NPM
```bash
$ npm install logi.js
```
### CDN
```html
<script src="https://cdn.jsdelivr.net/npm/logi.js/dist/logi.min.js"></script>
```

## Usage
### Parse a string
The most basic usage is to define a logical expression as a string and parse it to get an object.
```javascript
import { VAR, Parser } from 'logi.js';
// If you are using CDN
// const { VAR, Parser } = logi;

// Define the expression as a string
const exp = "(~A + B) * (C + D)"; // (!A | B), (A & B'), (A XOR B), etc.
// Define the variables
const A = new VAR('A');
const B = new VAR('B');
const C = new VAR('C');
const D = new VAR('D');
// Create a new parser
const parser = new Parser(exp, { A, B, C, D });
// Parse the expression
const tree = parser.parse();

console.log(tree); // AND(OR(NOT(A), B), OR(C, D))   <- Object
console.log(tree.toString()); // ( ~A + B ) * ( C + D )
console.log(tree.toObjectString()); // new AND(new OR(new NOT(A), B), new OR(C, D))
console.log(tree.toTex()); // ( \overline{A} + B ) \cdot ( C + D )
```
Alternatively, you can use the Parser without specifying variables. 

```javascript
import { Parser } from 'logi.js'; // const { Parser } = logi; (CDN)
const exp = "(A + B) * (C + D)";
const parser = new Parser(exp);
const tree = parser.parse();
console.log(tree.toString());
```

### Create a logical expression object directly
```javascript
import { VAR, NOT, AND, OR, XOR } from 'logi.js';
const exp = new AND(new XOR(new VAR('A'), new VAR('B')), new OR(new NOT(new VAR('C')), new VAR('D')));
console.log(exp.toString()); // (A ^ B) * ( ~C + D )
```

### Calculate the expression
```javascript
import { VAR, Parser } from 'logi.js';
// Calculate the expression
const exp = "(A OR B') & (~C | 1) ⋃ false"; // Support various formats
const variables = {
    A: new VAR('A', 1),
    B: new VAR('B', 0),
    C: new VAR('C', 1),
};
const parser = new Parser(exp, variables);
const tree = parser.parse();
console.log(tree.toString()); // ( ( A + ~B ) * ( ~C + 1 ) + 0 )
console.log(tree.calculate()); // 1
```

### Truth Table
You can generate a truth table from the parsed object.

```javascript
// Generate the truth table
const truthTable = new TruthTable(tree, { A, B, C, D });
const table = truthTable.get();
console.log(table);
// ↓ Output
// [
//   { A: 0, B: 0, C: 0, D: 0, result: 0 },
//   { A: 0, B: 0, C: 0, D: 1, result: 1 },
//   { A: 0, B: 0, C: 1, D: 0, result: 1 },
//   { A: 0, B: 0, C: 1, D: 1, result: 1 },
//   { A: 0, B: 1, C: 0, D: 0, result: 0 },
//   { A: 0, B: 1, C: 0, D: 1, result: 1 },
//   { A: 0, B: 1, C: 1, D: 0, result: 1 },
//   { A: 0, B: 1, C: 1, D: 1, result: 1 },
//   { A: 1, B: 0, C: 0, D: 0, result: 0 },
//   { A: 1, B: 0, C: 0, D: 1, result: 0 },
//   { A: 1, B: 0, C: 1, D: 0, result: 0 },
//   { A: 1, B: 0, C: 1, D: 1, result: 0 },
//   { A: 1, B: 1, C: 0, D: 0, result: 0 },
//   { A: 1, B: 1, C: 0, D: 1, result: 1 },
//   { A: 1, B: 1, C: 1, D: 0, result: 1 },
//   { A: 1, B: 1, C: 1, D: 1, result: 1 }
// ]
```

### Quine-McCluskey Algorithm
You can use the Quine-McCluskey algorithm to simplify the logical expression.
```javascript
import { QMC } from 'logi.js';

// Quine-McCluskey Algorithm
// Wikipedia: https://en.wikipedia.org/wiki/Quine–McCluskey_algorithm
const mt = [4, 8, 10, 11, 12, 15] // minterms
const dc = [9, 14] // don't care
const qmc = new QMC();
const result = qmc.solve(mt, dc); // Returns an array of strings

for (let i = 0; i < result.length; i++) {
  console.log(result[i].toString());
}
// ↓ Output
// A * ~B + A * C + B * ~C * ~D
// A * C + A * ~D + B * ~C * ~D
```
You can also simplify the expression directly from the string.
```javascript
const exp = '~AB + ~B + ~BD';
const qmc = new QMC();
const result = qmc.solveFromExp(exp)
console.log(result[0].toString()); // ~A + ~B
```

### Timing Diagram
You can create a timing diagram from a logical expression.
```javascript
import { TimingDiagram } from 'logi.js';

const table = [
    { A: 0, B: 0, result: 0 },
    { A: 0, B: 1, result: 1 },
    { A: 1, B: 0, result: 1 },
    { A: 1, B: 1, result: 0 },
];
const aData = [0, 0, 1, 1, 0, 0, 1, 1];
const bData = [0, 0, 0, 0, 1, 1, 1, 1];

const timingDiagram = new TimingDiagram();
timingDiagram.setData(table, aData, bData);

console.log(timingDiagram.getOutput()); // [ 0, 0, 1, 1, 1, 1, 0, 0 ]

timingDiagram.draw()
// ↓ Output
// Time |  @  |  B  |  A  |
// ------------------------
//   0  | ┃   | ┃   | ┃   |
//   1  | ┃   | ┃   | ┃   |
//   2  |  ‾┃ | ┃   |  ‾┃ |
//   3  |   ┃ | ┃   |   ┃ |
//   4  |   ┃ |  ‾┃ | ┃‾  |
//   5  |   ┃ |   ┃ | ┃   |
//   6  | ┃‾  |   ┃ |  ‾┃ |
//   7  | ┃   |   ┃ |   ┃ |

```

### Tokenizer
You can use the Tokenizer to get the tokens of a logical expression.
```javascript
import { Tokenizer } from 'logi.js';

// There are many useful functions
const tokenizer = new Tokenizer(
    "(A + B) * (~C ^ D)",
    {
        andToken: "&",
        orToken: "|",
        notToken: "!",
        xorToken: "⊕",
        leftParenthesisToken: '{',
        rightParenthesisToken: '}'
    }
);
const tokens = tokenizer.getTokens();
console.log(tokens);
// ↓ Output
// [
//     '{', 'A', '|', 'B',
//     '}', '&', '{', '!',
//     'C', '⊕', 'D', '}'
// ]
console.log(tokens.join(' ')); // { A | B } & { ! C ⊕ D }
```

### Converter
```javascript
import { VAR, Parser, TruthTable, Converter } from 'logi.js';

const exp = "A + B"
const A = new VAR('A');
const B = new VAR('B');
const parser = new Parser(exp, { A, B });
const tree = parser.parse();
const truthTable = new TruthTable(tree, { A, B });
const table = truthTable.get()
// Create a new instance of the Converter class
const converter = new Converter();
// Get the true values of the truth table in binary
const trueBinaries = converter.getTrueBinaries(table);
console.log(trueBinaries);
// Get the false values of the truth table in binary
const falseBinaries = converter.getFalseBinaries(table);
console.log(falseBinaries);
// Get the true values of the truth table in decimal
const trueDecimals = converter.getTrueDecimals(table);
console.log(trueDecimals);
// Get the false values of the truth table in decimal
const falseDecimals = converter.getFalseDecimals(table);
console.log(falseDecimals);
// Convert binary string to decimal
const decimal = converter.binToDec('1010');
console.log(decimal);
// Convert decimal string to binary
const binary = converter.decToBin('10');
console.log(binary);
```