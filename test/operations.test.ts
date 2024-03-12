import { NOT, AND, OR,  XOR, VAR, TRUE, FALSE } from '../src/operations';

test('TRUE', () => {
    const t = new TRUE();
    expect(t.toString()).toBe("1");
    expect(t.toObjectString()).toBe("new TRUE()");
    expect(t.toTex()).toBe("1");
    expect(t.calculate()).toBe(1);
});

test('FALSE', () => {
    const f = new FALSE();
    expect(f.toString()).toBe("0");
    expect(f.toObjectString()).toBe("new FALSE()");
    expect(f.toTex()).toBe("0");
    expect(f.calculate()).toBe(0);
});

test('VAR', () => {
    const v = new VAR("A", 1);
    expect(v.toString()).toBe("A");
    expect(v.toObjectString()).toBe("A");
    expect(v.toTex()).toBe("A");
    expect(v.calculate()).toBe(1);
});

test('NOT', () => {
    const t = new TRUE();
    const f = new FALSE();
    const n1 = new NOT(t);
    const n2 = new NOT(f);
    expect(n1.toString()).toBe("~1");
    expect(n2.toString()).toBe("~0");
    expect(n1.toObjectString()).toBe("new NOT(new TRUE())");
    expect(n2.toObjectString()).toBe("new NOT(new FALSE())");
    expect(n1.toTex()).toBe("\\overline{1}");
    expect(n2.toTex()).toBe("\\overline{0}");
    expect(n1.calculate()).toBe(0);
    expect(n2.calculate()).toBe(1);
});

test('AND', () => {
    const t = new TRUE();
    const f = new FALSE();
    const a1 = new AND(t, t);
    const a2 = new AND(t, f);
    const a3 = new AND(f, t);
    const a4 = new AND(f, f);
    expect(a1.toString()).toBe("1 * 1");
    expect(a2.toString()).toBe("1 * 0");
    expect(a3.toString()).toBe("0 * 1");
    expect(a4.toString()).toBe("0 * 0");
    expect(a1.toObjectString()).toBe("new AND(new TRUE(), new TRUE())");
    expect(a2.toObjectString()).toBe("new AND(new TRUE(), new FALSE())");
    expect(a3.toObjectString()).toBe("new AND(new FALSE(), new TRUE())");
    expect(a4.toObjectString()).toBe("new AND(new FALSE(), new FALSE())");
    expect(a1.toTex()).toBe("1 \\cdot 1");
    expect(a2.toTex()).toBe("1 \\cdot 0");
    expect(a3.toTex()).toBe("0 \\cdot 1");
    expect(a4.toTex()).toBe("0 \\cdot 0");
    expect(a1.calculate()).toBe(1);
    expect(a2.calculate()).toBe(0);
    expect(a3.calculate()).toBe(0);
    expect(a4.calculate()).toBe(0);
});

test('OR', () => {
    const t = new TRUE();
    const f = new FALSE();
    const o1 = new OR(t, t);
    const o2 = new OR(t, f);
    const o3 = new OR(f, t);
    const o4 = new OR(f, f);
    expect(o1.toString()).toBe("1 + 1");
    expect(o2.toString()).toBe("1 + 0");
    expect(o3.toString()).toBe("0 + 1");
    expect(o4.toString()).toBe("0 + 0");
    expect(o1.toObjectString()).toBe("new OR(new TRUE(), new TRUE())");
    expect(o2.toObjectString()).toBe("new OR(new TRUE(), new FALSE())");
    expect(o3.toObjectString()).toBe("new OR(new FALSE(), new TRUE())");
    expect(o4.toObjectString()).toBe("new OR(new FALSE(), new FALSE())");
    expect(o1.toTex()).toBe("1 + 1");
    expect(o2.toTex()).toBe("1 + 0");
    expect(o3.toTex()).toBe("0 + 1");
    expect(o4.toTex()).toBe("0 + 0");
    expect(o1.calculate()).toBe(1);
    expect(o2.calculate()).toBe(1);
    expect(o3.calculate()).toBe(1);
    expect(o4.calculate()).toBe(0);
});

test('XOR', () => {
    const t = new TRUE();
    const f = new FALSE();
    const x1 = new XOR(t, t);
    const x2 = new XOR(t, f);
    const x3 = new XOR(f, t);
    const x4 = new XOR(f, f);
    expect(x1.toString()).toBe("1 ^ 1");
    expect(x2.toString()).toBe("1 ^ 0");
    expect(x3.toString()).toBe("0 ^ 1");
    expect(x4.toString()).toBe("0 ^ 0");
    expect(x1.toObjectString()).toBe("new XOR(new TRUE(), new TRUE())");
    expect(x2.toObjectString()).toBe("new XOR(new TRUE(), new FALSE())");
    expect(x3.toObjectString()).toBe("new XOR(new FALSE(), new TRUE())");
    expect(x4.toObjectString()).toBe("new XOR(new FALSE(), new FALSE())");
    expect(x1.toTex()).toBe("1 \\oplus 1");
    expect(x2.toTex()).toBe("1 \\oplus 0");
    expect(x3.toTex()).toBe("0 \\oplus 1");
    expect(x4.toTex()).toBe("0 \\oplus 0");
    expect(x1.calculate()).toBe(0);
    expect(x2.calculate()).toBe(1);
    expect(x3.calculate()).toBe(1);
    expect(x4.calculate()).toBe(0);
});



test('ALL', () => {
    const A = new VAR('A', 1);
    const B = new VAR('B', 0);
    const C = new VAR('C', 1);
    const D = new VAR('D', 0);

    let exp = new AND(A, new OR(B, new NOT(new AND(C, D))));
    expect(exp.toString()).toBe("A * ( B + ~( C * D ) )");
    expect(exp.toObjectString()).toBe("new AND(A, new OR(B, new NOT(new AND(C, D))))");
    expect(exp.toTex()).toBe("A \\cdot ( B + \\overline{( C \\cdot D )} )");
    expect(exp.calculate()).toBe(1);

    exp = new XOR(A, B, C, D);
    expect(exp.toString()).toBe("A ^ B ^ C ^ D");
    expect(exp.toObjectString()).toBe("new XOR(A, B, C, D)");
    expect(exp.toTex()).toBe("A \\oplus B \\oplus C \\oplus D");
    expect(exp.calculate()).toBe(0);
});