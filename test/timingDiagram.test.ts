import { TimingDiagram } from '../src/timingDiagram';

test('TimingDiagram', () => {
    const table = [
        { A: 0, B: 0, result: 0 },
        { A: 0, B: 1, result: 1 },
        { A: 1, B: 0, result: 1 },
        { A: 1, B: 1, result: 0 },
    ];
    const aData = [0, 0, 1, 1, 0, 0, 1, 1];
    const bData = [0, 0, 0, 0, 1, 1, 1, 1];

    const timingDiagram = new TimingDiagram();
    timingDiagram.setData(table, aData, bData);

    const output = timingDiagram.getOutput();
    expect(output).toEqual([0, 0, 1, 1, 1, 1, 0, 0]);
});
