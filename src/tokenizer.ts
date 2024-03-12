import {
    andToken as defaultAndToken,
    orToken as defaultOrToken,
    notToken as defaultNotToken,
    xorToken as defaultXorToken,
    leftParenthesisToken as defaultLeftParenthesisToken,
    rightParenthesisToken as defaultRightParenthesisToken,
} from './defaultTokens';

// Parts of the code are from the following repository:
// https://github.com/jonathanjameswatson/truth-trick/ (MIT License)
class Tokenizer {
    private andToken: string;
    private orToken: string;
    private notToken: string;
    private notToken2: string;
    private xorToken: string;
    private leftParenthesisToken: string;
    private rightParenthesisToken: string;
    private spaceRegex: RegExp;
    private variableRegex: RegExp;
    private variableSplitRegex: RegExp;
    private tokenRegex: RegExp;
    private escapeRegex: RegExp;
    private aliases: object;
    private aliasMap: Record<string, string>;
    private aliasList: string[];
    private replaceRegex: RegExp;
    private variables: string[];
    private tokens: string[];
    constructor(
        expression: string,
        {
            andToken = defaultAndToken,
            orToken = defaultOrToken,
            notToken = defaultNotToken,
            xorToken = defaultXorToken,
            leftParenthesisToken = defaultLeftParenthesisToken,
            rightParenthesisToken = defaultRightParenthesisToken,
        } = {}) {
        this.andToken = andToken;
        this.orToken = orToken;
        this.notToken = notToken;
        this.notToken2 = "'";
        this.xorToken = xorToken;
        this.leftParenthesisToken = leftParenthesisToken;
        this.rightParenthesisToken = rightParenthesisToken;
        this.spaceRegex = /\s+/g;
        this.variableRegex = /[A-Z]/gi;
        this.variableSplitRegex = /[A-Z]{2,}/gi;
        this.tokenRegex = /[A-Z]|[01]|\W/gi;
        this.escapeRegex = /[-[\]{}()*+?.,\\^$|#\s]/g;
        this.aliases = {
            [andToken]: ['&', '&&', '*', '.', 'AND', 'and', '×', '∧', '⋂', '⋅'],
            [orToken]: ['+', 'OR', 'or', '|', '||', '∨', '⋃'],
            [notToken]: ['!', '-', 'NOT', 'not', '~', '¬'],
            [xorToken]: ['XOR', 'xor', '⊕', '⊻', '^'],
            [leftParenthesisToken]: ['(', '[', '{'],
            [rightParenthesisToken]: [')', ']', '}'],
            "1": ['TRUE', 'true', '1'],
            "0": ['FALSE', 'false', '0'],
        };
        this.aliasMap = Object.fromEntries(
            Object.entries(this.aliases).flatMap(([symbol, symbolAliases]) =>
                symbolAliases.map((symbolAlias: string) => [symbolAlias, symbol])
            )
        );
        this.aliasList = Object.values(this.aliases).flat();
        this.replaceRegex = new RegExp(
            this.aliasList.map((alias) => alias.replace(this.escapeRegex, '\\$&')).join('|'),
            'gi'
        );
        // 変数のリストthis.variablesはtokenize()の実行時に取得される
        this.variables = [];
        this.tokens = this.tokenize(expression);
    }

    public getTokens() {
        return this.tokens;
    }

    public getVariables() {
        return this.variables;
    }

    private tokenize(input: string) {
        const tokens = input
            // 後方のNOTトークン"'"を前方のNOTトークンに変換する
            .replace(new RegExp(`(${this.variableRegex.source})${this.notToken2}`, 'gi'), `${this.notToken}$1`)
            // 多数あるエイリアスを統一する
            .replace(this.replaceRegex, (match) => this.aliasMap[match.toUpperCase()])
            // 空白を削除する
            .replace(this.spaceRegex, '')
            // トークンに分割する
            .match(this.tokenRegex)!;

        // 変数のリストを取得し、this.variablesに格納する
        tokens.forEach((token, index) => {
            token.match(this.variableRegex)?.forEach((variable) => {
                this.variables.includes(variable) || this.variables.push(variable);
            });
        });

        // 「変数 | 閉じ括弧」の後に「変数 | 開き括弧 | NOTトークン」が続く場合、ANDトークンを挿入する 例: AB(C+D)~A -> A*B*(C+D)*~A
        const result: string[] = [];
        const first = [this.rightParenthesisToken].concat(this.variables);
        const last = [this.leftParenthesisToken, this.notToken].concat(this.variables);
        let specialTokenFound = false;
        for (const token of tokens) {
            if (specialTokenFound) {
                if (last.includes(token)) {

                    result.push(this.andToken);
                }
                specialTokenFound = false;
            }
            result.push(token);
            if (first.includes(token)) {
                specialTokenFound = true;
            }
        }

        return result;
    }
}

export { Tokenizer };