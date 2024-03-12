// This is a wrapper of the following repository:
// https://github.com/int-main/Quine-McCluskey (MIT License)

import { Operation, VAR } from "./operations";
import { Tokenizer } from "./tokenizer";
import { Parser } from "./parser";
import { Converter } from "./converter";
import { TruthTable } from "./truthTable";

class Petrick {
    // Petrick's method
    // (1) substitution()
    // 変数のペアが同じ値の場合、新しい変数として扱う
    // 例えば、[[['A', 'B'], ['C', 'D']], [['A', 'B'], ['E', 'F']]] は [['A', 'B'], ['A', 'C']] として扱う
    // (2) distribute() in petrick()
    // 分配法則を用いて乗法形から加法形に変換する
    // (3) petrick()
    // すべての生成されたパターンの中で最小のもの（複数可）を選択する
    // (4) backSubstitution()
    // substitution() で新しい変数として扱ったものを元の変数に戻す
    private allocated: Record<string, string>;
    private p: string[][][];
    constructor(p: string[][][]) {
        this.allocated = {};
        this.p = p;
    }

    public get() {
        const substitutedPIs = this.substitution(this.p);
        const sop = this.petrick(substitutedPIs);
        const result = this.backSubstitution(sop);
        return result;
    }

    private petrick(p: string[][]) {
        while (p.length > 1) {
            p[0] = this.distribute(p[0], p[1]);
            p.splice(1, 1);
        }
        // 配列要素の文字列をソートし(例えば'ACB' -> 'ABC')、文字列の長さで全体の配列をソートする
        const all_patterns = p[0].map(s => [...s].sort().join('')).sort((a, b) => a.length - b.length);
        const min_length = all_patterns[0].length;
        return all_patterns.filter(s => s.length === min_length);
    }

    private distribute(a: string[], b: string[]) {
        const result: string[] = [];
        for (let i = 0; i < a.length; i++) {
            for (let j = 0; j < b.length; j++) {
                if (a[i].includes(b[j])) {
                    result.push(a[i]);
                } else {
                    result.push(`${a[i]}${b[j]}`);
                }
            }
        }
        return result;
    }

    private substitution(p: string[][][]) {
        const newP: string[][] = [];
        for (let i = 0; i < p.length; i++) {
            for (let j = 0; j < p[i].length; j++) {
                const t = p[i][j].join('');
                if (!this.allocated[t]) {
                    this.allocated[String.fromCharCode(65 + Object.keys(this.allocated).length)] = t;
                }
                if (!newP[i]) {
                    newP[i] = [];
                }
                newP[i][j] = Object.keys(this.allocated).find(k => this.allocated[k] === t) as string;
            }
        }
        return newP;
    }

    private backSubstitution(p: string[]) {
        const newP = Array.from({ length: p.length }, () => Array.from({ length: p[0].length }, () => '0'));
        for (let i = 0; i < p.length; i++) {
            for (let j = 0; j < p[i].length; j++) {
                newP[i][j] = this.allocated[p[i][j]];
            }
        }
        return newP;
    }
}

class QMC {
    constructor() {
    }
    // ドントケアを取り除く
    private refine(mtList: number[], dcList: number[]) {
        return mtList.filter(i => !dcList.includes(i));
    }

    // prime implicants chartから必要なprime implicantsを取り出す
    private findEPI(x: Record<string, string[]>) {
        const res: string[] = [];
        for (const i in x) {
            if (x[i].length === 1) {
                if (!res.includes(x[i][0])) {
                    res.push(x[i][0]);
                }
            }
        }
        return res;
    }

    // 与えられた二進数を変数リストに変換する (例えば、"1010" -> ["A", "B'", "C", "D'"])
    private findVariables(x: string) {
        const varList: string[] = [];
        for (let i = 0; i < x.length; i++) {
            if (x[i] === '0') {
                varList.push(String.fromCharCode(65 + i) + "'");
            } else if (x[i] === '1') {
                varList.push(String.fromCharCode(65 + i));
            }
        }
        return varList;
    }

    // 与えられたリストをフラット化する
    private flatten(x: any[]) {
        return [].concat(...x);
    }

    // どのmintermsがマージされたかを見つけるための関数 (例えば、10-1は9(1001)と11(1011)がマージされて得られる)
    private findminterms(a: string) {
        const gaps = a.split('').filter(i => i === '-').length;
        if (gaps === 0) {
            return [parseInt(a, 2)];
        }
        const x = Array.from({ length: Math.pow(2, gaps) }, (_, i) => i.toString(2).padStart(gaps, '0'));
        const temp: number[] = [];
        for (let i = 0; i < Math.pow(2, gaps); i++) {
            let temp2 = a;
            let ind = -1;
            for (const j of x[0]) {
                if (ind !== -1) {
                    ind = ind + temp2.slice(ind + 1).indexOf('-') + 1;
                } else {
                    ind = temp2.slice(ind + 1).indexOf('-');
                }
                temp2 = temp2.slice(0, ind) + j + temp2.slice(ind + 1);
            }
            temp.push(parseInt(temp2, 2));
            x.shift();
        }
        return temp;
    }

    // 2つのmintermsが1ビットだけ異なるかどうかをチェックする関数
    private compare(a: string, b: string): [boolean, number | null | undefined] {
        let c = 0;
        let mismatchIndex: number | null | undefined = undefined;
        for (let i = 0; i < a.length; i++) {
            if (a[i] !== b[i]) {
                mismatchIndex = i;
                c++;
                if (c > 1) {
                    return [false, null];
                }
            }
        }
        return [true, mismatchIndex];
    }

    // 既にカバーされているmintermsを削除する
    private removeTerms(chart: Record<string, string[]>, terms: string[]) {
        for (const i of terms) {
            for (const j of this.findminterms(i)) {
                if (chart[j] !== undefined) {
                    delete chart[j];
                }
            }
        }
    }

    // 数値でソートするための比較関数
    private sortNumber(a: number, b: number) {
        return a - b;
    }

    // 文字列をソートするための比較関数
    private sortString(a: string, b: string) {
        const newA = a.replace(/'/g, '');
        const newB = b.replace(/'/g, '');
        // 長さが異なる場合、短いほうが先
        if (newA.length > newB.length) {
            return 1;
        } else if (newA.length < newB.length) {
            return -1;
        } else {
            // 長さが同じ場合、辞書順
            if (newA > newB) {
                return 1;
            } else if (newA < newB) {
                return -1;
            } else {
                // 長さと文字が同じ場合、 文字列->2進数->10進数に変換のように変換して比較
                const variableRegex = /[A-Z]'?/gi;
                const aDec = parseInt(a.match(variableRegex)!.map((v) => {
                    if (v.includes("'")) { return 0 }
                    return 1;
                }).join(''), 2);
                const bDec = parseInt(b.match(variableRegex)!.map((v) => {
                    if (v.includes("'")) { return 0 }
                    return 1;
                }).join(''), 2);
                return aDec - bDec;
            }
        }
    }

    public solveFromExp(expression: string, isReturnObject = true) {
        const tokenizer = new Tokenizer(expression);
        const variableNames = tokenizer.getVariables();
        const variables: Record<string, VAR> = {};
        for (const v of variableNames) {
            variables[v] = new VAR(v);
        }
        const parser = new Parser(expression, variables);
        const tree = parser.parse();
        const truthTable = new TruthTable(tree, variables);
        const table = truthTable.get();
        const converter = new Converter();
        const trueDecimals = converter.getTrueDecimals(table);
        const result = this.solve(trueDecimals, [], false);

        const newResult: (string | Operation)[] = [];

        for (const r of result) {
            const newR = (r as string).replace(/[A-Z]/gi, (match) => {
                const num = match.charCodeAt(0) - 65;
                if (num < 0) {
                    throw new Error('Invalid variable: ' + match);
                }
                return variables[Object.keys(variables)[num]].toString();
            });
            if (isReturnObject) {
                const parser = new Parser(newR, variables);
                newResult.push(parser.parse());
            } else {
                newResult.push(newR);
            }
        }
        return newResult;
    }

    public solve(mt: number[], dc: number[] = [], isReturnObject = true) {
        mt.sort(this.sortNumber);
        const minterms = mt.concat(dc);
        minterms.sort(this.sortNumber);
        const size = (minterms[minterms.length - 1]).toString(2).length;
        let groups: Record<string, string[]> = {};
        const all_pi: Set<string> = new Set();

        // primary grouping starts
        for (const minterm of minterms) {
            if (groups[minterm.toString(2).split('1').length - 1]) {
                groups[minterm.toString(2).split('1').length - 1].push(minterm.toString(2).padStart(size, '0'));
            } else {
                groups[minterm.toString(2).split('1').length - 1] = [minterm.toString(2).padStart(size, '0')];
            }
        }

        while (true) {
            const tmp: Record<string, string[]> = { ...groups };
            groups = {};
            let m = 0;
            const marked = new Set();
            let should_stop = true;
            const l: string[] = Object.keys(tmp).sort();


            for (let i = 0; i < l.length - 1; i++) {
                for (const j of tmp[l[i]]) {
                    for (const k of tmp[l[i + 1]]) {
                        const res: [boolean, number | null | undefined] = this.compare(j, k);
                        if (res[0]) {
                            try {
                                if (!groups[m].includes(j.slice(0, res[1]!) + '-' + j.slice(res[1]! + 1))) {
                                    groups[m].push(j.slice(0, res[1]!) + '-' + j.slice(res[1]! + 1));
                                }
                            } catch (e) {
                                groups[m] = [j.slice(0, res[1]!) + '-' + j.slice(res[1]! + 1)];
                            }
                            should_stop = false;
                            marked.add(j);
                            marked.add(k);
                        }
                    }
                }
                m++;
            }

            const local_unmarked = new Set(this.flatten(Object.values(tmp)).filter(e => !marked.has(e)));

            for (const i of local_unmarked) {
                all_pi.add(i);
            }

            if (should_stop) {
                break;
            }
        }


        const chart: Record<string, string[]> = {};
        for (const i of all_pi) {
            const merged_minterms = this.findminterms(i);
            let y = 0;
            for (const j of this.refine(merged_minterms, dc)) {
                const x = mt.indexOf(j) * 3;
                y = x + 2;
                if (chart[j]) {
                    chart[j].push(i);
                } else {
                    chart[j] = [i];
                }
            }
        }

        const EPI = this.findEPI(chart);
        this.removeTerms(chart, EPI);

        const result: string[] = [];

        if (Object.keys(chart).length === 0) {
            const tmp = EPI.map(i => this.findVariables(i));
            const final_result = tmp.map(i => i.join('')).sort(this.sortString).join(' + ');
            if (!final_result.length) {
                result.push('1');
            } else {
                result.push(final_result);
            }
        } else {
            const pi = EPI.map(i => this.findVariables(i)).map(i => i.join(''));
            const P: Record<string, string[][]> = {};
            for (const i of Object.keys(chart)) {
                P[i] = chart[i].map(j => this.findVariables(j));
            }
            const newP = new Petrick(Object.values(P)).get();
            for (let i = 0; i < newP.length; i++) {
                // piとp[i]を結合し、空の要素を削除する（piがないこともあるため）
                result.push(pi.concat(newP[i]).filter(i => i.length > 0).sort(this.sortString).join(' + '));
            }
        }

        if (isReturnObject) {
            const newResult: Operation[] = [];
            for (const r of result) {
                const parser = new Parser(r);
                newResult.push(parser.parse());
            }
            return newResult;
        } else {
            return result;
        }
    }
}

export { QMC };