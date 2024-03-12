import { VAR } from "../src/operations";
import { Parser } from '../src/parser';

test('Parser', () => {
    const A = new VAR("A");
    const B = new VAR("B");
    const C = new VAR("C");
    const D = new VAR("D");


    let exp = "(A + B) * (C + D)";
    let parser = new Parser(exp, { A, B, C, D });
    let result = parser.parse();
    expect(result.toString()).toBe("( A + B ) * ( C + D )");
    
    exp = "AB + BC + CD";
    parser = new Parser(exp, { A, B, C, D });
    result = parser.parse();
    expect(result.toString()).toBe("A * B + B * C + C * D");

    exp = "(A OR B') & (~C | 1) ⋃ false";
    parser = new Parser(exp, { A, B, C, D });
    result = parser.parse();
    expect(result.toString()).toBe("( A + ~B ) * ( ~C + 1 ) + 0");

    exp = "(A+~B)(A~C+~D)+~ABCD";
    parser = new Parser(exp, { A, B, C, D });
    result = parser.parse();
    expect(result.toString()).toBe("( A + ~B ) * ( A * ~C + ~D ) + ~A * B * C * D");
    expect(result.toObjectString()).toBe("new OR(new AND(new OR(A, new NOT(B)), new OR(new AND(A, new NOT(C)), new NOT(D))), new AND(new NOT(A), B, C, D))");
    expect(result.toTex()).toBe("( A + \\overline{B} ) \\cdot ( A \\cdot \\overline{C} + \\overline{D} ) + \\overline{A} \\cdot B \\cdot C \\cdot D");

    // 変数指定がない場合
    exp = "A ^ B";
    parser = new Parser(exp);
    result = parser.parse();
    expect(result.toString()).toBe("A ^ B");

    exp = "A*B + A*!B + !A*B + !A*!B";
    parser = new Parser(exp);
    result = parser.parse();
    expect(result.toString()).toBe("A * B + A * ~B + ~A * B + ~A * ~B");

    // 変数が途中から始まる場合
    exp = "BC + EF";
    parser = new Parser(exp);
    result = parser.parse();
    expect(result.toString()).toBe("B * C + E * F");
});