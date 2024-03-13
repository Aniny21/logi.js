type NumBoolean = 0 | 1;

class Token {
    // toStringをする際に括弧をつけるかどうかを判定するために使う
    public priority = 0;
    constructor() {
    }
    toString(priority: number = this.priority) {
        return "TokenToString"
    }
    toObjectString() {
        return "TokenToObjectString"
    }
    toTex(priority: number = this.priority) {
        return "TokenToTeX"
    }
    calculate() {
        return 0;
    }
}

class Operation extends Token {
    public args: Token[];
    constructor(...args: Token[]) {
        super();
        this.args = args;
    }
    push(token: Token) {
        this.args.push(token);
    }
    pop() {
        return this.args.pop();
    }
    getDepth() {
        let max = 0;
        for (let arg of this.args) {
            if (arg instanceof Operation) {
                max = Math.max(max, arg.getDepth());
            }
        }
        return max + 1;
    }
    getWidth() {
        let width = 0;
        for (let arg of this.args) {
            if (arg instanceof Operation) {
                width += arg.getWidth();
            } else if (arg instanceof Value) {
                width += 1;
            }
        }
        return width;
    }
}

class Value extends Token {
    constructor() {
        super();
    }
}

class NOT extends Operation {
    public priority = 15;
    constructor(arg: Token) {
        super(arg);
    }
    // 内部の値を取得
    getInner() {
        return this.args[0];
    }
    toString(priority: number = this.priority) {
        return `~${this.args[0].toString(this.priority)}`;
    }
    toObjectString() {
        return `new NOT(${this.args[0].toObjectString()})`;
    }
    toTex(priority: number = this.priority) {
        return `\\overline{${this.args[0].toTex(this.priority)}}`;
    }
    calculate() {
        return this.args[0].calculate() ? 0 : 1;
    }
}

class AND extends Operation {
    public priority = 8;
    constructor(...args: Token[]) {
        super(...args);
    }
    toString(priority: number = this.priority) {
        if (priority > this.priority) {
            return `( ${this.args.map(arg => arg.toString(this.priority)).join(' * ')} )`;
        } else {
            return this.args.map(arg => arg.toString(this.priority)).join(' * ');
        }
    }
    toObjectString() {
        return `new AND(${this.args.map(arg => arg.toObjectString()).join(', ')})`;
    }
    toTex(priority: number = this.priority) {
        if (priority > this.priority) {
            return `( ${this.args.map(arg => arg.toTex(this.priority)).join(' \\cdot ')} )`;
        } else {
            return this.args.map(arg => arg.toTex(this.priority)).join(' \\cdot ');
        }
    }
    calculate() {
        let result = 1;
        for (let arg of this.args) {
            result = result & arg.calculate();
        }
        return result;
    }
}

class OR extends Operation {
    priority = 6;
    constructor(...args: Token[]) {
        super(...args);
    }
    toString(priority: number = this.priority) {
        if (priority > this.priority) {
            return `( ${this.args.map(arg => arg.toString(this.priority)).join(' + ')} )`;
        } else {
            return this.args.map(arg => arg.toString(this.priority)).join(' + ');
        }
    }
    toObjectString() {
        return `new OR(${this.args.map(arg => arg.toObjectString()).join(', ')})`;
    }
    toTex(priority: number = this.priority) {
        if (priority > this.priority) {
            return `( ${this.args.map(arg => arg.toTex(this.priority)).join(' + ')} )`;
        } else {
            return this.args.map(arg => arg.toTex(this.priority)).join(' + ');
        }
    }
    calculate() {
        let result = 0;
        for (let arg of this.args) {
            result = result | arg.calculate();
        }
        return result;
    }
}

class XOR extends Operation {
    priority = 7;
    constructor(...args: Token[]) {
        super(...args);
    }
    toString(priority: number = this.priority) {
        if (priority > this.priority) {
            return `(${this.args.map(arg => arg.toString(this.priority)).join(' ^ ')})`;
        } else {
            return this.args.map(arg => arg.toString(this.priority)).join(' ^ ');
        }
    }
    toObjectString() {
        return `new XOR(${this.args.map(arg => arg.toObjectString()).join(', ')})`;
    }
    toTex(priority: number = this.priority) {
        if (priority > this.priority) {
            return `(${this.args.map(arg => arg.toTex(this.priority)).join(' \\oplus ')})`;
        } else {
            return this.args.map(arg => arg.toTex(this.priority)).join(' \\oplus ');
        }
    }
    calculate() {
        let result = 0;
        for (let arg of this.args) {
            result = result ^ arg.calculate();
        }
        return result;
    }
}

class VAR extends Value {
    private name: string;
    private value: NumBoolean;
    constructor(name: string, value: NumBoolean = 0) {
        super();
        this.name = name;
        this.value = value;
    }
    toString(priority: number = this.priority) {
        return this.name;
    }
    toObjectString() {
        return this.name;
    }
    toTex(priority: number = this.priority) {
        return this.name;
    }
    setValue(value: NumBoolean) {
        this.value = value;
    }
    getValue() {
        return this.value;
    }
    calculate() {
        return this.value;
    }
}

class TRUE extends Value {
    private value: NumBoolean;
    constructor() {
        super();
        this.value = 1;
    }
    toString(priority: number = this.priority) {
        return "1"
    }
    toObjectString() {
        return "new TRUE()";
    }
    toTex(priority: number = this.priority) {
        return "1";
    }
    calculate() {
        return this.value;
    }
}

class FALSE extends Value {
    private value: NumBoolean;
    constructor() {
        super();
        this.value = 0;
    }
    toString(priority: number = this.priority) {
        return "0"
    }
    toObjectString() {
        return "new FALSE()";
    }
    toTex(priority: number = this.priority) {
        return "0";
    }
    calculate() {
        return this.value;
    }
}

export { Token, Operation, Value, NOT, AND, OR, XOR, VAR, TRUE, FALSE, NumBoolean };