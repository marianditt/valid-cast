import { ValidationError } from "../../lib/validator"
import { isValidJson, StringErrorEnum } from "./string-validator"

interface ValidCase {
  readonly value: string
  readonly result: unknown
}

const validInputs: ValidCase[] = [
  { value: "true", result: true },
  { value: "23", result: 23 },
  { value: '"double quotes"', result: "double quotes" },
  { value: "{}", result: {} },
  { value: "[]", result: [] },
  { value: "[{}]", result: [{}] },
  { value: '{ "a": 42,  "b": true,\n"c":{"x":[2, "a"  ]}}', result: { a: 42, b: true, c: { x: [2, "a"] } } },
]

const invalidInputs: string[] = ["", "tru", "x42", "'single quotes'", "{", "]", "{]", '{"x: true}', "{'x': 42}"]

describe("JsonValidator", () => {
  describe(`given valid json inputs`, () => {
    it.each(validInputs)("should return valid result for %p", (input) => {
      const mockCallback = jest.fn()
      const result = isValidJson(input.value, mockCallback)
      expect(result).toStrictEqual(input.result)
      expect(mockCallback).toHaveBeenCalledTimes(0)
    })
  })

  describe(`given invalid json inputs`, () => {
    it.each(invalidInputs)("should return critical result for %p", (input) => {
      const mockCallback = jest.fn()
      expect(() => isValidJson(input, mockCallback)).toThrow(ValidationError)
      expect(mockCallback).toHaveBeenCalledTimes(1)
      expect(mockCallback.mock.calls[0].length).toBe(1)
      expect(mockCallback.mock.calls[0][0]).toStrictEqual({
        key: "StringValidationFinding",
        path: [],
        details: { error: StringErrorEnum.INVALID_JSON },
      })
    })
  })
})
