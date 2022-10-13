import { ConstantKey, ConstantValidator } from "./constant-validator"

describe("ConstantValidator#isUndefined", () => {
  it("should return undefined", () => {
    const callbackMock = jest.fn()
    const input: unknown = undefined
    const result = ConstantValidator.isUndefined(input, callbackMock)
    expect(result).toBe(undefined)
    expect(callbackMock).toHaveBeenCalledTimes(0)
  })

  it.each([null, NaN, false, 0, "", {}, []])("should report findings for %j", (input: unknown) => {
    const callbackMock = jest.fn()
    const result = ConstantValidator.isUndefined(input, callbackMock)
    expect(result).toBe(undefined)
    expect(callbackMock).toHaveBeenCalledTimes(1)
    expect(callbackMock.mock.calls[0].length).toBe(1)
    expect(callbackMock.mock.calls[0][0]).toStrictEqual({
      key: "ConstantValidationFinding",
      path: [],
      details: {
        expectedValue: ConstantKey.UNDEFINED,
      },
    })
  })
})
