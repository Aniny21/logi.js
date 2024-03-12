import { QMC } from '../src/qmc';

test('QMC', () => {
    const qmc = new QMC();

    // 通常（Essential Prime Implicantsと他のPrime Implicantsがある場合）
    let mt = [4, 8, 10, 11, 12, 15];
    let dc = [9, 14];
    let result = qmc.solve(mt, dc).map((r) => r.toString());
    let expected = ["A * ~B + A * C + B * ~C * ~D", "A * C + A * ~D + B * ~C * ~D"];
    expect(result).toEqual(expected);

    // Essential Prime Implicantsがない場合
    mt = [1, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 14];
    dc = [];
    result = qmc.solve(mt, dc).map((r) => r.toString());
    expected = ["A * ~B + ~A * D + B * ~D", "~A * B + A * ~D + ~B * D"];
    expect(result).toEqual(expected);

    // 様々なテスト
    mt = [0, 1, 2, 5, 6, 7];
    dc = [];
    result = qmc.solve(mt, dc).map((r) => r.toString());
    expected = ["~A * ~B + A * C + B * ~C", "A * B + ~A * ~C + ~B * C"];
    expect(result).toEqual(expected);

    // 式から直接解く
    let exp = "A ^ B";
    result = qmc.solveFromExp(exp).map((r) => r.toString());
    expected = ["~A * B + A * ~B"];
    expect(result).toEqual(expected);

    // 最終結果が1のみの場合
    exp = "A*B + A*!B + !A*B + !A*!B";
    result = qmc.solveFromExp(exp).map((r) => r.toString());
    expected = ["1"];
    expect(result).toEqual(expected);

    // 変数が途中から始まる場合
    exp = "BC + EF";
    result = qmc.solveFromExp(exp).map((r) => r.toString());
    expected = ["B * C + E * F"];
    expect(result).toEqual(expected);

    // 文字列で取得する場合
    exp = "B ^ D";
    let stringResult = qmc.solveFromExp(exp, false);
    expected = ["B'D + BD'"];
    expect(stringResult).toEqual(expected);
});