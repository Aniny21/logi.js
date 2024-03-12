import { Tokenizer } from "../src/tokenizer";

test('Tokenizer', () => {
    let expression = "AB + EF";
    let tokenizer = new Tokenizer(expression);
    let variables = tokenizer.getVariables();
    let expected = ["A", "B", "E", "F"];
    expect(variables).toEqual(expected);
    let tokens = tokenizer.getTokens();
    expected = ["A", "*", "B", "+", "E", "*", "F"];
    expect(tokens).toEqual(expected);

    expression = "~A ^ B'";
    tokenizer = new Tokenizer(expression);
    tokens = tokenizer.getTokens();
    expected = ["~", "A", "^", "~", "B"];
    expect(tokens).toEqual(expected);

    expression = "A ^ (~B + C)D";
    tokenizer = new Tokenizer(
        expression,
        { andToken: "&", orToken: "|", notToken: "!", xorToken: "⊕", leftParenthesisToken: "{", rightParenthesisToken: "}" }
    );
    tokens = tokenizer.getTokens();
    expected = ["A", "⊕", "{", "!", "B", "|", "C", "}", "&", "D"];
    expect(tokens).toEqual(expected);
});