import { FindingCallback, ValidationError } from "../../lib/validator"
import {
  ExpectedTypeEnum,
  hasTypeArray,
  hasTypeBoolean,
  hasTypeNumber,
  hasTypeObject,
  hasTypeString,
  TypeValidationFinding,
} from "./type-validators"

interface TestCase {
  readonly expectedTypeKey: ExpectedTypeEnum
  readonly validator: (value: unknown, callback: FindingCallback<TypeValidationFinding>) => any
  readonly validInputs: unknown[]
  readonly invalidInputs: unknown[]
}

const testCases: TestCase[] = [
  {
    expectedTypeKey: ExpectedTypeEnum.BOOLEAN,
    validator: hasTypeBoolean,
    validInputs: [false, true],
    invalidInputs: [0, "true", {}, []],
  },
  {
    expectedTypeKey: ExpectedTypeEnum.NUMBER,
    validator: hasTypeNumber,
    validInputs: [0, 1, 0.5, -3.1415, Infinity],
    invalidInputs: [false, "0", NaN, {}, []],
  },
  {
    expectedTypeKey: ExpectedTypeEnum.STRING,
    validator: hasTypeString,
    validInputs: ["", " ", "abc", "NaN"],
    invalidInputs: [true, 42, {}, []],
  },
  {
    expectedTypeKey: ExpectedTypeEnum.OBJECT,
    validator: hasTypeObject,
    validInputs: [{}, { a: 0, b: "", c: true }, { 0: 42, 7: false }, { x: {} }],
    invalidInputs: [false, 1, "", [], () => 7, null, undefined],
  },
  {
    expectedTypeKey: ExpectedTypeEnum.ARRAY,
    validator: hasTypeArray,
    validInputs: [[[]], [[false]], [[0, true, ""]], [[[], {}]]], // each() internally maps [1, 2, 3] to [[1], [2], [3]]
    invalidInputs: [true, 0, "string", {}, { 0: 13, 1: "true", 2: false }, null, undefined],
  },
]

describe.each(testCases)("TypeValidators", (testCase) => {
  describe(`given valid ${testCase.expectedTypeKey} values`, () => {
    it.each(testCase.validInputs)("should return valid result for %p", (input) => {
      const mockCallback = jest.fn()
      const result = testCase.validator(input, mockCallback)
      expect(result).toStrictEqual(input)
      expect(mockCallback).toHaveBeenCalledTimes(0)
    })
  })

  describe(`given invalid ${testCase.expectedTypeKey} values`, () => {
    it.each(testCase.invalidInputs)("should return critical result for %p", (input) => {
      const mockCallback = jest.fn()
      expect(() => testCase.validator(input, mockCallback)).toThrow(ValidationError)
      expect(mockCallback).toHaveBeenCalledTimes(1)
      expect(mockCallback.mock.calls[0].length).toBe(1)
      expect(mockCallback.mock.calls[0][0]).toStrictEqual({
        key: "TypeValidationFinding",
        path: [],
        details: { expectedType: testCase.expectedTypeKey },
      })
    })
  })
})
