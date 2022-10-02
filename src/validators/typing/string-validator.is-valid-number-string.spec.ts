import { isValidFloatString, isValidIntegerString, StringErrorEnum } from "./string-validator"

interface ValidInput {
  value: string
  result: number
}

const validInputs: ValidInput[] = [
  { value: "0", result: 0 },
  { value: "123", result: 123 },
  { value: "-762", result: -762 },
  { value: "-0.1", result: -0.1 },
  { value: "3.1415", result: 3.1415 },
  { value: "99999999999999999999", result: 99999999999999999999 },
  { value: "+00815", result: 815 },
  { value: "+41-.3f", result: 41 },
  { value: "0x13", result: 0 },
]

const validIntegerInputs: ValidInput[] = [
  ...validInputs,
  { value: "-2.6977E3", result: -2 },
  { value: "-2.6977e-3", result: -2 },
]

const validFloatInputs: ValidInput[] = [
  ...validInputs,
  { value: "-2.6977E3", result: -2697.7 },
  { value: "-2.6977e-3", result: -0.0026977 },
  { value: "-.3", result: -0.3 },
]

const invalidInputs: string[] = ["", "--.3", "b1101", ",43", "deaf", "true", "zero"]

describe("NumberValidator", () => {
  describe("given integer string inputs", () => {
    it.each(validIntegerInputs)("should return valid integer for %p", (input) => {
      const mockCallback = jest.fn()
      const result = isValidIntegerString(input.value, mockCallback)
      expect(result).toBe(Math.trunc(input.result))
      expect(mockCallback).toHaveBeenCalledTimes(0)
    })

    it.each(invalidInputs)("should throw and propagate finding for %p", (input) => {
      const mockCallback = jest.fn()
      expect(isValidIntegerString(input, mockCallback)).toBeNaN()
      expect(mockCallback).toHaveBeenCalledTimes(1)
      expect(mockCallback.mock.calls[0].length).toBe(1)
      expect(mockCallback.mock.calls[0][0]).toStrictEqual({
        key: "StringValidationFinding",
        path: [],
        details: { error: StringErrorEnum.INVALID_INTEGER },
      })
    })
  })

  describe("given float string inputs", () => {
    it.each(validFloatInputs)("should return valid float for %p", (input) => {
      const mockCallback = jest.fn()
      const result = isValidFloatString(input.value, mockCallback)
      expect(result).toBe(input.result)
      expect(mockCallback).toHaveBeenCalledTimes(0)
    })

    it.each(invalidInputs)("should throw and propagate finding for %p", (input) => {
      const mockCallback = jest.fn()
      expect(isValidFloatString(input, mockCallback)).toBeNaN()
      expect(mockCallback).toHaveBeenCalledTimes(1)
      expect(mockCallback.mock.calls[0].length).toBe(1)
      expect(mockCallback.mock.calls[0][0]).toStrictEqual({
        key: "StringValidationFinding",
        path: [],
        details: { error: StringErrorEnum.INVALID_FLOAT },
      })
    })
  })
})
