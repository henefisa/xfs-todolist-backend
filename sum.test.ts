import sum from "./sum";

test("Add 1 + 2 to equals 3", () => {
  expect(sum(1, 2)).toBe(3);
});

test("Add 3 + 2 to equals 5", () => {
  expect(sum(3, 2)).toBe(5);
});

test("This is failed test", () => {
  expect(sum(1, 1)).toBe(10);
});
