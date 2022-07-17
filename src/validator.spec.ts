import {validate} from "./validator";

describe("validate", () => {
  it('should return true', () => {
    expect(validate()).toBe(true)
  });
})
