import { Operation, VAR } from './operations';

class TruthTable {
    private expression: Operation;
    private variables: Record<string, VAR>;
    private variableList: string[];
    constructor(expression: Operation, variables: Record<string, VAR>) {
        this.expression = expression;
        this.variables = variables;
        this.variableList = Object.keys(variables);
    }

    private numberToNumBoolean(num: number) {
        return num !== 0 ? 1 : 0;
    }

    // 入力された変数の真理値表を生成する
    private createTruthTablePatterns() {
        return [...Array(2 ** this.variableList.length).keys()].map((i) =>
            i
                .toString(2)
                .padStart(this.variableList.length, '0')
                .split('')
                .map((bool, j) => [this.variableList[j], parseInt(bool)])
        );
    }

    public get() {
        const patterns = this.createTruthTablePatterns();
        const results = patterns.map((pattern) => {
            for (let [name, value] of pattern) {
                this.variables[name].setValue(this.numberToNumBoolean(Number(value)));
            }
            return {
                ...Object.fromEntries(pattern),
                result: this.expression.calculate()
            }
        });
        return results;
    }

}

export { TruthTable };
