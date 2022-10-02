import { Validator } from "../../lib/validator"
import {
  ComparatorKey,
  ComparisonValidationFinding,
  isEqualTo,
  isGreaterOrEqual,
  isGreaterThan,
  isLessOrEqual,
  isLessThan,
  isNotEqualTo,
} from "./comparison-validators"

interface Input {
  readonly key: ComparatorKey
  readonly lhs: number
  readonly rhs: number
}

const ltInputs: Input[] = [
  { key: "<", lhs: 0, rhs: 1 },
  { key: "<", lhs: 1, rhs: 2 },
  { key: "<", lhs: -1, rhs: 4 },
  { key: "<", lhs: 3, rhs: Math.PI },
  { key: "<", lhs: 999999999999, rhs: Infinity },
  { key: "<", lhs: -Infinity, rhs: Infinity },
]

const inputs: Input[] = [
  { key: "===", lhs: 0, rhs: 0 },
  { key: "===", lhs: 1, rhs: 1 },
  { key: "===", lhs: -7, rhs: -7 },
  { key: "===", lhs: 42, rhs: 42 },
  ...ltInputs,
  ...ltInputs.map((input: Input): Input => ({ key: "<", lhs: -input.rhs, rhs: -input.lhs })),
  ...ltInputs.map((input: Input): Input => ({ key: ">", lhs: input.rhs, rhs: input.lhs })),
  ...ltInputs.map((input: Input): Input => ({ key: ">", lhs: -input.lhs, rhs: -input.rhs })),
]

interface TestCase {
  readonly validatorProvider: (comparedValue: number) => Validator<number, number, ComparisonValidationFinding>
  readonly key: ComparatorKey
  readonly satisfies: ComparatorKey[]
}

const testCases: TestCase[] = [
  { validatorProvider: isEqualTo, key: "===", satisfies: ["==="] },
  { validatorProvider: isNotEqualTo, key: "!==", satisfies: ["<", ">"] },
  { validatorProvider: isLessThan, key: "<", satisfies: ["<"] },
  { validatorProvider: isLessOrEqual, key: "<=", satisfies: ["<", "==="] },
  { validatorProvider: isGreaterThan, key: ">", satisfies: [">"] },
  { validatorProvider: isGreaterOrEqual, key: ">=", satisfies: [">", "==="] },
]

describe("ComparisonValidator", () => {
  describe.each(testCases)("given validator $key", (testCase) => {
    const validInputs: Input[] = inputs.filter((input) => testCase.satisfies.includes(input.key))
    const invalidInputs: Input[] = inputs.filter((input) => !testCase.satisfies.includes(input.key))

    describe("given valid inputs", () => {
      it.each(validInputs)(`should return value $lhs for $lhs ${testCase.key} $rhs`, (input) => {
        const callbackMock = jest.fn()
        const validator = testCase.validatorProvider(input.rhs)
        const result = validator(input.lhs, callbackMock)
        expect(result).toBe(input.lhs)
        expect(callbackMock).toHaveBeenCalledTimes(0)
      })

      it.each(invalidInputs)(`should return value $lhs with findings for $lhs ${testCase.key} $rhs`, (input) => {
        const callbackMock = jest.fn()
        const validator = testCase.validatorProvider(input.rhs)
        const result = validator(input.lhs, callbackMock)
        expect(result).toBe(input.lhs)
        expect(callbackMock).toHaveBeenCalledTimes(1)
        expect(callbackMock.mock.calls[0].length).toBe(1)
        expect(callbackMock.mock.calls[0][0]).toStrictEqual({
          key: "ComparisonValidationFinding",
          path: [],
          details: {
            comparator: testCase.key,
            comparedValue: input.rhs,
          },
        })
      })
    })
  })
})
