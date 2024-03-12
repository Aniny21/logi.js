import { VAR } from "../src/operations";
import { Parser } from '../src/parser';
import { TruthTable } from '../src/truthTable';

test('TruthTable', () => {
    const A = new VAR("A");
    const B = new VAR("B");
    const C = new VAR("C");
    const D = new VAR("D");

    let exp = "(A + B) * (C + D)";
    let parser = new Parser(exp, { A, B, C, D });
    let result = parser.parse();
    let table = new TruthTable(result, { A, B, C, D });
    let truthTable = table.get();
    let expected = [
        { A: 0, B: 0, C: 0, D: 0, result: 0 },
        { A: 0, B: 0, C: 0, D: 1, result: 0 },
        { A: 0, B: 0, C: 1, D: 0, result: 0 },
        { A: 0, B: 0, C: 1, D: 1, result: 0 },
        { A: 0, B: 1, C: 0, D: 0, result: 0 },
        { A: 0, B: 1, C: 0, D: 1, result: 1 },
        { A: 0, B: 1, C: 1, D: 0, result: 1 },
        { A: 0, B: 1, C: 1, D: 1, result: 1 },
        { A: 1, B: 0, C: 0, D: 0, result: 0 },
        { A: 1, B: 0, C: 0, D: 1, result: 1 },
        { A: 1, B: 0, C: 1, D: 0, result: 1 },
        { A: 1, B: 0, C: 1, D: 1, result: 1 },
        { A: 1, B: 1, C: 0, D: 0, result: 0 },
        { A: 1, B: 1, C: 0, D: 1, result: 1 },
        { A: 1, B: 1, C: 1, D: 0, result: 1 },
        { A: 1, B: 1, C: 1, D: 1, result: 1 }
    ];
    expect(truthTable).toEqual(expected);

    exp = "AB + BC + CD";
    parser = new Parser(exp, { A, B, C, D });
    result = parser.parse();
    table = new TruthTable(result, { A, B, C, D });
    truthTable = table.get();
    expected = [
        { A: 0, B: 0, C: 0, D: 0, result: 0 },
        { A: 0, B: 0, C: 0, D: 1, result: 0 },
        { A: 0, B: 0, C: 1, D: 0, result: 0 },
        { A: 0, B: 0, C: 1, D: 1, result: 1 },
        { A: 0, B: 1, C: 0, D: 0, result: 0 },
        { A: 0, B: 1, C: 0, D: 1, result: 0 },
        { A: 0, B: 1, C: 1, D: 0, result: 1 },
        { A: 0, B: 1, C: 1, D: 1, result: 1 },
        { A: 1, B: 0, C: 0, D: 0, result: 0 },
        { A: 1, B: 0, C: 0, D: 1, result: 0 },
        { A: 1, B: 0, C: 1, D: 0, result: 0 },
        { A: 1, B: 0, C: 1, D: 1, result: 1 },
        { A: 1, B: 1, C: 0, D: 0, result: 1 },
        { A: 1, B: 1, C: 0, D: 1, result: 1 },
        { A: 1, B: 1, C: 1, D: 0, result: 1 },
        { A: 1, B: 1, C: 1, D: 1, result: 1 }
    ];
    expect(truthTable).toEqual(expected);

    exp = "(A OR B') & (~C | 1) ⋃ false";
    parser = new Parser(exp, { A, B, C, D });
    result = parser.parse();
    table = new TruthTable(result, { A, B, C, D });
    truthTable = table.get();
    expected = [
        { A: 0, B: 0, C: 0, D: 0, result: 1 },
        { A: 0, B: 0, C: 0, D: 1, result: 1 },
        { A: 0, B: 0, C: 1, D: 0, result: 1 },
        { A: 0, B: 0, C: 1, D: 1, result: 1 },
        { A: 0, B: 1, C: 0, D: 0, result: 0 },
        { A: 0, B: 1, C: 0, D: 1, result: 0 },
        { A: 0, B: 1, C: 1, D: 0, result: 0 },
        { A: 0, B: 1, C: 1, D: 1, result: 0 },
        { A: 1, B: 0, C: 0, D: 0, result: 1 },
        { A: 1, B: 0, C: 0, D: 1, result: 1 },
        { A: 1, B: 0, C: 1, D: 0, result: 1 },
        { A: 1, B: 0, C: 1, D: 1, result: 1 },
        { A: 1, B: 1, C: 0, D: 0, result: 1 },
        { A: 1, B: 1, C: 0, D: 1, result: 1 },
        { A: 1, B: 1, C: 1, D: 0, result: 1 },
        { A: 1, B: 1, C: 1, D: 1, result: 1 }
    ];
    expect(truthTable).toEqual(expected);

    exp = "(A+~B)(A~C+~D)+~ABCD";
    parser = new Parser(exp, { A, B, C, D });
    result = parser.parse();
    table = new TruthTable(result, { A, B, C, D });
    truthTable = table.get();
    expected = [
        { A: 0, B: 0, C: 0, D: 0, result: 1 },
        { A: 0, B: 0, C: 0, D: 1, result: 0 },
        { A: 0, B: 0, C: 1, D: 0, result: 1 },
        { A: 0, B: 0, C: 1, D: 1, result: 0 },
        { A: 0, B: 1, C: 0, D: 0, result: 0 },
        { A: 0, B: 1, C: 0, D: 1, result: 0 },
        { A: 0, B: 1, C: 1, D: 0, result: 0 },
        { A: 0, B: 1, C: 1, D: 1, result: 1 },
        { A: 1, B: 0, C: 0, D: 0, result: 1 },
        { A: 1, B: 0, C: 0, D: 1, result: 1 },
        { A: 1, B: 0, C: 1, D: 0, result: 1 },
        { A: 1, B: 0, C: 1, D: 1, result: 0 },
        { A: 1, B: 1, C: 0, D: 0, result: 1 },
        { A: 1, B: 1, C: 0, D: 1, result: 1 },
        { A: 1, B: 1, C: 1, D: 0, result: 1 },
        { A: 1, B: 1, C: 1, D: 1, result: 0 }
    ];
    expect(truthTable).toEqual(expected);

    exp = "A ^ B ^ C ^ D";
    parser = new Parser(exp, { A, B, C, D });
    result = parser.parse();
    table = new TruthTable(result, { A, B, C, D });
    truthTable = table.get();
    expected = [
        { A: 0, B: 0, C: 0, D: 0, result: 0 },
        { A: 0, B: 0, C: 0, D: 1, result: 1 },
        { A: 0, B: 0, C: 1, D: 0, result: 1 },
        { A: 0, B: 0, C: 1, D: 1, result: 0 },
        { A: 0, B: 1, C: 0, D: 0, result: 1 },
        { A: 0, B: 1, C: 0, D: 1, result: 0 },
        { A: 0, B: 1, C: 1, D: 0, result: 0 },
        { A: 0, B: 1, C: 1, D: 1, result: 1 },
        { A: 1, B: 0, C: 0, D: 0, result: 1 },
        { A: 1, B: 0, C: 0, D: 1, result: 0 },
        { A: 1, B: 0, C: 1, D: 0, result: 0 },
        { A: 1, B: 0, C: 1, D: 1, result: 1 },
        { A: 1, B: 1, C: 0, D: 0, result: 0 },
        { A: 1, B: 1, C: 0, D: 1, result: 1 },
        { A: 1, B: 1, C: 1, D: 0, result: 1 },
        { A: 1, B: 1, C: 1, D: 1, result: 0 }
      ];
});