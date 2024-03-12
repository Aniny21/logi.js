import { Tokenizer } from './tokenizer';
import { NumBoolean, Token, Value, VAR, AND, OR, NOT, XOR, TRUE, FALSE, Operation } from './operations';
import { andToken, orToken, notToken, xorToken, leftParenthesisToken, rightParenthesisToken } from './defaultTokens';

class Parser {
    private variables: Record<string, Value>;
    private variableNames: string[];
    private tokens: string[];
    private OperateTable: Record<string, any>;
    constructor(expression: string, variables: Record<string, Value> = {}) {
        // variablesがなければexpressionから変数を取得
        if (Object.keys(variables).length === 0) {
            const tokenizer = new Tokenizer(expression);
            this.variableNames = tokenizer.getVariables();
            const newVariables: Record<string, Value> = {};
            for (const variable of this.variableNames) {
                newVariables[variable] = new VAR(variable);
            }
            this.variables = newVariables;
        } else {
            this.variables = variables;
            this.variableNames = Object.keys(variables).map(key => variables[key].toString());
        }

        // 式をトークンに分割
        this.tokens = new Tokenizer(expression).getTokens();
        // 演算子の優先順位と結合法則を定義
        this.OperateTable = {
            [leftParenthesisToken]: {
                Order: 20, Type: "state", Arity: 0, AssocLow: "",
                fn: function () { }
            },
            [rightParenthesisToken]: {
                Order: 20, Type: "state", Arity: 0, AssocLow: "",
                fn: function () { }
            },
            [notToken]: {
                Order: 15, Type: "op", Arity: 1, AssocLow: "R",
                fn: function (_L: NumBoolean) { return ~_L; }
            },
            [andToken]: {
                Order: 8, Type: "op", Arity: 2, AssocLow: "L",
                fn: function (_L: NumBoolean, _R: NumBoolean) { return _L & _R; }
            },
            [xorToken]: {
                Order: 7, Type: "op", Arity: 2, AssocLow: "L",
                fn: function (_L: NumBoolean, _R: NumBoolean) { return _L ^ _R; }
            },
            [orToken]: {
                Order: 6, Type: "op", Arity: 2, AssocLow: "L",
                fn: function (_L: NumBoolean, _R: NumBoolean) { return _L | _R; }
            }
        };
    }

    public parse() {
        const rpn = this.generateRPN(this.tokens.join(' '))!;
        const stack: Token[] = [];
        for (const token of rpn.split(' ')) {
            if (this.variableNames.includes(token)) {
                stack.push(this.getVariableByName(token)!);
            } else {
                switch (token) {
                    case notToken:
                        stack.push(new NOT(stack.pop()!));
                        break;
                    case andToken:
                        {
                            const right = stack.pop();
                            const left = stack.pop();
                            if (left instanceof AND ||
                                left instanceof NOT &&
                                left.getInner() instanceof AND
                            ) {
                                left.push(right!);
                                stack.push(left);
                            } else {
                                stack.push(new AND(left!, right!));
                            }
                        }
                        break;
                    case orToken:
                        {
                            const right = stack.pop();
                            const left = stack.pop();
                            if (left instanceof OR ||
                                left instanceof NOT &&
                                left.getInner() instanceof OR
                            ) {
                                left.push(right!);
                                stack.push(left);
                            } else {
                                stack.push(new OR(left!, right!));
                            }
                        }
                        break;
                    case xorToken:
                        {
                            const right = stack.pop();
                            const left = stack.pop();
                            if (left instanceof XOR ||
                                left instanceof NOT &&
                                left.getInner() instanceof XOR
                            ) {
                                left.push(right!);
                                stack.push(left);
                            } else {
                                stack.push(new XOR(left!, right!));
                            }
                        }
                        break;
                    case '1':
                        stack.push(new TRUE());
                        break;
                    case '0':
                        stack.push(new FALSE());
                        break;
                    default:
                        throw new Error(`Unknown token: ${token}`);
                }
            }
        }
        return stack.pop() as Operation;
    }

    private getVariableByName(name: string) {
        let variable: Value | undefined;
        Object.keys(this.variables).forEach(key => {
            if (this.variables[key].toString() === name) {
                variable = this.variables[key];
            }
        });
        return variable;
    }

    // Original: https://github.com/spica-git/ReversePolishNotation (MIT License)
    // Reference: https://qiita.com/spica/items/6babc851c8d02a5cec7d
    private generateRPN(exp: string) {
        const Polish: string[] = []; ///parse結果格納用
        const ope_stack: string[][] = [[]]; ///演算子スタック
        let depth = 0; ///括弧のネスト深度
        let unary = true; //単項演算子チェック（正負符号等）

        do {
            //先頭の空白文字とカンマを消去
            exp = exp.replace(/^(\s|,)+/, "");
            if (exp.length === 0) { break; }

            //演算子スタック
            ope_stack[depth] = ope_stack[depth] || [];

            //変数抽出
            const g = exp.match(/^[A-Z0-1]/i);
            if (g != null) {
                Polish.push(g[0]);
                exp = exp.substring(g[0].length);
                unary = false;
                continue;
            }

            //演算子抽出
            let op: string | null = null;
            for (const key in this.OperateTable) {
                if (exp.indexOf(key) === 0) {
                    op = key;
                    exp = exp.substring(key.length);
                    break;
                }
            }

            if (op == null) {
                throw new Error("illegal expression:" + exp.substring(0, 10) + " ...");
            }

            ///スタック構築
            ///・各演算子の優先順位
            ///・符合の単項演算子化
            switch (op) {
                default:
                    //演算子スタックの先頭に格納
                    //・演算子がまだスタックにない
                    //・演算子スタックの先頭にある演算子より優先度が高い
                    //・演算子スタックの先頭にある演算子と優先度が同じでかつ結合法則がright to left
                    if (ope_stack[depth].length === 0 ||
                        this.OperateTable[op].Order > this.OperateTable[ope_stack[depth][0]].Order ||
                        (this.OperateTable[op].Order === this.OperateTable[ope_stack[depth][0]].Order
                            && this.OperateTable[op].AssocLow === "R")
                    ) {
                        ope_stack[depth].unshift(op);
                    }
                    //式のスタックに演算子を積む
                    else {
                        //演算子スタックの先頭から、優先順位が同じか高いものを全て抽出して式に積む
                        //※優先順位が同じなのは結合法則がright to leftのものだけスタックに積んである
                        while (ope_stack[depth].length > 0) {
                            const ope = ope_stack[depth].shift()!;
                            //演算優先度が、スタック先頭の演算子以上ならば、続けて式に演算子を積む
                            if (this.OperateTable[ope].Order >= this.OperateTable[op].Order) {
                                Polish.push(ope);
                                continue;
                            }
                            else {
                                //演算優先度が、スタック先頭の演算子より小さければ、スタックに戻す
                                ope_stack[depth].unshift(ope);
                                break;
                            }
                        }
                        ope_stack[depth].unshift(op);
                    }
                    unary = true;
                    break;

                //括弧はネストにするので特別
                case "(":
                    depth++;
                    unary = true;
                    break;

                case ")":
                    while (ope_stack[depth].length > 0) { ///演算子スタックを全て処理
                        Polish.push(ope_stack[depth].shift()!);
                    }
                    if (--depth < 0) {
                        //括弧閉じ多すぎてエラー
                        throw new Error("too much ')'");
                    }
                    unary = false; ///括弧を閉じた直後は符号（単項演算子）ではない
                    break;
            }
        } while (exp.length > 0)

        if (depth > 0) {
            console.warn({ message: "too much '('", rest_exp: exp });
        }
        else if (exp.length > 0) {
            console.warn({ message: "generate unifinished", rest_exp: exp });
        }
        else {
            while (ope_stack[depth].length > 0) {
                Polish.push(ope_stack[depth].shift()!);
            }
            return Polish.join(" ");
        }
        return null;
    }
}

export { Parser };