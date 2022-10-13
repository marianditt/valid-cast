import { ConstantKey, ConstantValidator } from "./constant-validator"

describe("ConstantValidator#isNan", () => {
  it("should return NaN", () => {
    const callbackMock = jest.fn()
    const input: number = NaN
    const result = ConstantValidator.isNaN(input, callbackMock)
    expect(result).toBe(NaN)
    expect(callbackMock).toHaveBeenCalledTimes(0)
  })

  it.each([0, Infinity, -Infinity])("should report findings for %d", (input: number) => {
    const callbackMock = jest.fn()
    const result = ConstantValidator.isNaN(input, callbackMock)
    expect(result).toBe(NaN)
    expect(callbackMock).toHaveBeenCalledTimes(1)
    expect(callbackMock.mock.calls[0].length).toBe(1)
    expect(callbackMock.mock.calls[0][0]).toStrictEqual({
      key: "ConstantValidationFinding",
      path: [],
      details: {
        expectedValue: ConstantKey.NAN,
      },
    })
  })
})
