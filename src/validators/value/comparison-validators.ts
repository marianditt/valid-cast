import { FindingCallback, ValidationFinding, Validator } from "../../lib/validator"

export type ComparatorKey = "===" | "!==" | "<" | "<=" | ">" | ">="

export interface ComparisonValidationDetails {
  readonly comparator: ComparatorKey
  readonly comparedValue: number
}

export interface ComparisonValidationFinding
  extends ValidationFinding<"ComparisonValidationFinding", ComparisonValidationDetails> {}

export function isEqualTo(otherValue: number): Validator<number, number, ComparisonValidationFinding> {
  const comparator: Comparator = (lhs, rhs) => lhs === rhs
  return createComparisonValidator(comparator, "===", otherValue)
}

export function isNotEqualTo(otherValue: number): Validator<number, number, ComparisonValidationFinding> {
  const comparator: Comparator = (lhs, rhs) => lhs !== rhs
  return createComparisonValidator(comparator, "!==", otherValue)
}

export function isLessThan(limit: number): Validator<number, number, ComparisonValidationFinding> {
  const comparator: Comparator = (lhs, rhs) => lhs < rhs
  return createComparisonValidator(comparator, "<", limit)
}

export function isLessOrEqual(limit: number): Validator<number, number, ComparisonValidationFinding> {
  const comparator: Comparator = (lhs, rhs) => lhs <= rhs
  return createComparisonValidator(comparator, "<=", limit)
}

export function isGreaterThan(limit: number): Validator<number, number, ComparisonValidationFinding> {
  const comparator: Comparator = (lhs, rhs) => lhs > rhs
  return createComparisonValidator(comparator, ">", limit)
}

export function isGreaterOrEqual(limit: number): Validator<number, number, ComparisonValidationFinding> {
  const comparator: Comparator = (lhs, rhs) => lhs >= rhs
  return createComparisonValidator(comparator, ">=", limit)
}

type Comparator = (lhs: number, rhs: number) => boolean

function createComparisonValidator(
  comparator: Comparator,
  comparatorKey: ComparatorKey,
  comparedValue: number
): Validator<number, number, ComparisonValidationFinding> {
  function validator(value: number, callback: FindingCallback<ComparisonValidationFinding>): number {
    if (!comparator(value, comparedValue)) {
      const finding: ComparisonValidationFinding = {
        key: "ComparisonValidationFinding",
        path: [],
        details: {
          comparator: comparatorKey,
          comparedValue,
        },
      }
      callback(finding)
    }
    return value
  }

  return validator
}
