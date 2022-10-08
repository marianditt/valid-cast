import { Validator } from "../../lib/validator"
import { ChainValidator } from "../combination/chain-validator"
import {
  ComparisonValidationFinding,
  isGreaterOrEqual,
  isLessOrEqual,
  isLessThan,
} from "../value/comparison-validators"
import { hasValidProperty, PropertyValidationFinding } from "../value/property-validator"
import { hasTypeNumber, hasTypeString, TypeValidationFinding } from "./type-validators"

export interface Interval {
  readonly minValue?: number
  readonly maxValue?: number
}

export function isValidNumberBetween(
  interval: Interval
): Validator<unknown, number, TypeValidationFinding | ComparisonValidationFinding> {
  const minValue = interval.minValue ?? -Infinity
  const maxValue = interval.maxValue ?? Infinity
  return ChainValidator.of(hasTypeNumber).and(isGreaterOrEqual(minValue)).and(isLessThan(maxValue)).validator
}

export function isValidStringBetween(
  interval: Interval
): Validator<unknown, string, TypeValidationFinding | PropertyValidationFinding<number, ComparisonValidationFinding>> {
  const minLength = interval.minValue ?? 0
  const maxLength = interval.maxValue ?? Infinity
  const lengthProvider = (value: string) => value.length
  return ChainValidator.of(hasTypeString)
    .and(hasValidProperty("length", lengthProvider, isGreaterOrEqual(minLength)))
    .and(hasValidProperty("length", lengthProvider, isLessOrEqual(maxLength))).validator
}
