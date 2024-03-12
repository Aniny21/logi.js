type Table = {
    [key: string]: number;
    result: number;
}

class Converter {
    constructor() {
    }
    // 真理値表のTrue部分を2進数で取得
    getTrueBinaries(truthTable: Table[]) {
        let binaryValues: string[] = [];
        truthTable.filter((row) => row.result === 1).map((row) => {
            let binaryValue = '';
            for (let [key, value] of Object.entries(row)) {
                if (key !== 'result') {
                    binaryValue += value;
                }
            }
            binaryValues.push(binaryValue);
        });
        return binaryValues;
    }
    // 真理値表のFalse部分を2進数で取得
    getFalseBinaries(truthTable: Table[]) {
        let binaryValues: string[] = [];
        truthTable.filter((row) => row.result === 0).map((row) => {
            let binaryValue = '';
            for (let [key, value] of Object.entries(row)) {
                if (key !== 'result') {
                    binaryValue += value;
                }
            }
            binaryValues.push(binaryValue);
        });
        return binaryValues;
    }
    // 真理値表のTrue部分を10進数で取得
    getTrueDecimals(truthTable: Table[]) {
        return this.getTrueBinaries(truthTable).map((binary) => this.binToDec(binary));
    }
    // 真理値表のFalse部分を10進数で取得
    getFalseDecimals(truthTable: Table[]) {
        return this.getFalseBinaries(truthTable).map((binary) => this.binToDec(binary));
    }
    // 二進数を10進数に変換
    binToDec(binaryString: string) {
        return parseInt(binaryString, 2);
    }
    // 10進数のテキストを2進数に変換
    decToBin(decimalString: string) {
        return parseInt(decimalString, 10).toString(2);
    }
}

export { Converter };