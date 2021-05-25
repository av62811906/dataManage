const sum = require('./add');

test('sum方法; 输入参数:(1, 2); 期待返回值:3', () => {
    expect(sum(1, 2)).toBe(3);
});

test('sum方法; 输入参数:(2, 3); 期待返回值:5', () => {
    expect(sum(2, 3)).toBe(5);
});