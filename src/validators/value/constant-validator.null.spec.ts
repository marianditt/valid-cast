import { ConstantKey, ConstantValidator } from "./constant-validator"

describe("ConstantValidator#isNull", () => {
  it("should return null", () => {
    const callbackMock = jest.fn()
    const input: unknown = null
    const result = ConstantValidator.isNull(input, callbackMock)
    expect(result).toBe(null)
    expect(callbackMock).toHaveBeenCalledTimes(0)
  })

  it.each([undefined, NaN, false, 0, "", {}, []])("should report findings for %j", (input: unknown) => {
    const callbackMock = jest.fn()
    const result = ConstantValidator.isNull(input, callbackMock)
    expect(result).toBe(null)
    expect(callbackMock).toHaveBeenCalledTimes(1)
    expect(callbackMock.mock.calls[0].length).toBe(1)
    expect(callbackMock.mock.calls[0][0]).toStrictEqual({
      key: "ConstantValidationFinding",
      path: [],
      details: {
        expectedValue: ConstantKey.NULL,
      },
    })
  })
})
