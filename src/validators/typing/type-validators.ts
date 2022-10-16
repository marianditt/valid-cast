import { FindingCallback, ValidationError, ValidationFinding } from "../../lib/validator"

export enum ExpectedTypeEnum {
  BOOLEAN = "BOOLEAN",
  NUMBER = "NUMBER",
  STRING = "STRING",
  OBJECT = "OBJECT",
  ARRAY = "ARRAY",
}

export interface TypeValidationDetails {
  readonly expectedType: ExpectedTypeEnum
}

export interface TypeValidationFinding extends ValidationFinding<"TypeValidationFinding", TypeValidationDetails> {}

/**
 * Validates if a value of unknown type has type boolean.
 *
 * @example
 * const input: unknown = false
 * const result: boolean = Validation.validate(input, hasTypeBoolean).getValue()
 * // result -> false
 *
 * @example
 * const input: unknown = "false"
 * const findings = Validation.validate(input, hasTypeBoolean).getFindings()
 * // findings.length -> 1
 *
 * @param value the value to validate.
 * @param callback the callback used to report findings of type {@link TypeValidationFinding}.
 * @returns the input value as boolean.
 * @throws ValidationError if the input value is not of type boolean.
 * @see Validator
 */
export function hasTypeBoolean(value: unknown, callback: FindingCallback<TypeValidationFinding>): boolean {
  if (typeof value === "boolean") {
    return value
  } else {
    callback(createTypeValidationFinding(ExpectedTypeEnum.BOOLEAN))
    throw new ValidationError()
  }
}

/**
 * Validates if a value of unknown type has type number.
 *
 * @example
 * const input: unknown = 0
 * const result: number = Validation.validate(input, hasTypeNumber).getValue()
 * // result -> 0
 *
 * @example
 * const input: unknown = Infinity
 * const result: number = Validation.validate(input, hasTypeNumber).getValue()
 * // result -> Infinity
 *
 * @example
 * const input: unknown = NaN
 * const findings = Validation.validate(input, hasTypeNumber).getFindings()
 * // findings.length -> 1
 *
 * @param value the value to validate.
 * @param callback the callback used to report findings of type {@link TypeValidationFinding}.
 * @returns the input value as number.
 * @throws ValidationError if the input value is not of type number.
 * @see Validator
 */
export function hasTypeNumber(value: unknown, callback: FindingCallback<TypeValidationFinding>): number {
  if (typeof value === "number" && !isNaN(value)) {
    return value
  } else {
    callback(createTypeValidationFinding(ExpectedTypeEnum.NUMBER))
    throw new ValidationError()
  }
}

/**
 * Validates if a value of unknown type has type string.
 *
 * @example
 * const input: unknown = ""
 * const result: string = Validation.validate(input, hasTypeString).getValue()
 * // result -> ""
 *
 * @example
 * const input: unknown = null
 * const findings = Validation.validate(input, hasTypeString).getFindings()
 * // findings.length -> 1
 *
 * @param value the value to validate.
 * @param callback the callback used to report findings of type {@link TypeValidationFinding}.
 * @returns the input value as string.
 * @throws ValidationError if the input value is not of type string.
 * @see Validator
 */
export function hasTypeString(value: unknown, callback: FindingCallback<TypeValidationFinding>): string {
  if (typeof value === "string") {
    return value
  } else {
    callback(createTypeValidationFinding(ExpectedTypeEnum.STRING))
    throw new ValidationError()
  }
}

/**
 * Validates if a value of unknown type is of type object with string keys.
 *
 * @example
 * const input: unknown = {}
 * const result: {} = Validation.validate(input, hasTypeObject).getValue()
 * // result -> {}
 *
 * @example
 * const input: unknown = {key: "value"}
 * const result: {} = Validation.validate(input, hasTypeObject).getValue()
 * // result -> {key: "value"}
 *
 * @example
 * const input: unknown = {0: "value"}
 * const result: {} = Validation.validate(input, hasTypeObject).getValue()
 * // result -> {0: "value"}
 *
 * @example
 * const input: unknown = ["value 0", "value 1"]
 * const findings = Validation.validate(input, hasTypeObject).getFindings()
 * // findings.length -> 1
 *
 * @example
 * const input: unknown = null
 * const findings = Validation.validate(input, hasTypeObject).getFindings()
 * // findings.length -> 1
 *
 * @example
 * const input: unknown = undefined
 * const findings = Validation.validate(input, hasTypeObject).getFindings()
 * // findings.length -> 1
 *
 * @param value the value to validate.
 * @param callback the callback used to report findings of type {@link TypeValidationFinding}.
 * @returns the input value as an object type that extends the empty object.
 * @throws ValidationError if the input value is not of type object, is `null`, or of type array.
 * @see Validator
 */
export function hasTypeObject(value: unknown, callback: FindingCallback<TypeValidationFinding>): {} {
  if (typeof value === "object" && value !== null && !Array.isArray(value)) {
    return { ...value }
  } else {
    callback(createTypeValidationFinding(ExpectedTypeEnum.OBJECT))
    throw new ValidationError()
  }
}

/**
 * Validates if a value of unknown type is an array.
 *
 * @example
 * const input: unknown = []
 * const result: unknown[] = Validation.validate(input, hasTypeArray).getValue()
 * // result -> []
 *
 * @example
 * const input: unknown = ["value 0", "value 1"]
 * const result: unknown[] = Validation.validate(input, hasTypeArray).getValue()
 * // result -> ["value 0", "value 1"]
 *
 * @example
 * const input: unknown = {}
 * const findings = Validation.validate(input, hasTypeArray).getFindings()
 * // findings.length -> 1
 *
 * @example
 * const input: unknown = {0: "value"}
 * const findings = Validation.validate(input, hasTypeArray).getFindings()
 * // findings.length -> 1
 *
 * @example
 * const input: unknown = null
 * const findings = Validation.validate(input, hasTypeArray).getFindings()
 * // findings.length -> 1
 *
 * @example
 * const input: unknown = undefined
 * const findings = Validation.validate(input, hasTypeArray).getFindings()
 * // findings.length -> 1
 *
 * @param value the value to validate.
 * @param callback the callback used to report findings of type {@link TypeValidationFinding}.
 * @returns the input value as array of unknown item types.
 * @throws ValidationError if the input value is not an array.
 * @see Validator
 */
export function hasTypeArray(value: unknown, callback: FindingCallback<TypeValidationFinding>): unknown[] {
  if (Array.isArray(value)) {
    return value
  } else {
    callback(createTypeValidationFinding(ExpectedTypeEnum.ARRAY))
    throw new ValidationError()
  }
}

function createTypeValidationFinding(expectedType: ExpectedTypeEnum): TypeValidationFinding {
  return {
    key: "TypeValidationFinding",
    path: [],
    details: { expectedType },
  }
}
