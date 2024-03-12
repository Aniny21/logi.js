import { Converter } from '../src/converter';

test('Converter', () => {
    const converter = new Converter();

    let truthTable = [
        { A: 0, B: 0, result: 0 },
        { A: 0, B: 1, result: 1 },
        { A: 1, B: 0, result: 1 },
        { A: 1, B: 1, result: 0 }
    ];

    let binaryValues = converter.getTrueBinaries(truthTable);
    let expectedBinaries = ["01", "10"];
    expect(binaryValues).toEqual(expectedBinaries);

    binaryValues = converter.getFalseBinaries(truthTable);
    expectedBinaries = ["00", "11"];
    expect(binaryValues).toEqual(expectedBinaries);

    let decimalValues = converter.getTrueDecimals(truthTable);
    let expectedDecimals = [1, 2];
    expect(decimalValues).toEqual(expectedDecimals);

    decimalValues = converter.getFalseDecimals(truthTable);
    expectedDecimals = [0, 3];
    expect(decimalValues).toEqual(expectedDecimals);


    let binaryString = "0101";
    let decimalValue = converter.binToDec(binaryString);
    let expectedDecimal = 5;
    expect(decimalValue).toEqual(expectedDecimal);

    let decimalString = "5";
    let binaryValue = converter.decToBin(decimalString);
    let expectedBinary = "101";
    expect(binaryValue).toEqual(expectedBinary);
});