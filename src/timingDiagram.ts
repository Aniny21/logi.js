type TruthTableType = {
    [key: string]: number;
    result: number;
}[];

class TimingDiagram {
    private truthTable: TruthTableType = [];
    private timingData: number[][] = [];
    constructor() { }
    public setData(truthTable: TruthTableType, ...timingData: number[][]) {
        this.truthTable = truthTable;
        this.timingData = timingData;
    }
    public getOutput() {
        let result: (number | undefined)[] = [];
        const dataLength = this.timingData[0].length;
        for (const data of this.timingData) {
            if (data.length !== dataLength) {
                throw new Error('Data length must be the same');
            }
        }
        if (this.timingData.length !== Object.keys(this.truthTable[0]).length - 1) {
            throw new Error('The number of variables does not match');
        }
        for (let i = 0; i < dataLength; i++) {
            const data = this.timingData.map((row) => row[i]);
            result.push(this.getResultFromTruthTable(...data));
        }
        return result;
    }
    public draw() {
        const output = this.getOutput();
        const variables = Object.keys(this.truthTable[0]).filter((key) => key !== 'result');
        console.log(`Time |  @  |  ${variables.reverse().join('  |  ')}  |`);
        console.log('-'.repeat(12 + 6 * variables.length));

        for (let i = 0; i < this.timingData[0].length; i++) {
            const data = this.timingData.map((row) => row[i]);
            process.stdout.write(`  ${i}  |`);
            const prev = output[i - 1]
            const changed = (prev !== undefined) && (prev !== output[i])
            if (output[i]) {
                process.stdout.write(`  ${changed ? '‾' : ' '}┃ |`);
            } else {
                process.stdout.write(` ┃${changed ? '‾' : ' '}  |`);
            }
            for (let j = data.length - 1; j >= 0; j--) {
                const prev = this.timingData.map((row) => row[i - 1])[j];
                const changed = (prev !== undefined) && (prev !== data[j])
                if (data[j]) {
                    process.stdout.write(`  ${changed ? '‾' : ' '}┃ |`);
                } else {
                    process.stdout.write(` ┃${changed ? '‾' : ' '}  |`);
                }

            }
            console.log();
        }
    }
    private getResultFromTruthTable(...data: number[]) {
        const result = this.truthTable.find((row) => {
            for (let i = 0; i < data.length; i++) {
                if (row[Object.keys(row)[i]] !== data[i]) {
                    return false;
                }
            }
            return true;
        });
        return result?.result;
    }
}

export { TimingDiagram };