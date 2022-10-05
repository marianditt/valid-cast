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
 * Validate if a value of unknown type has type boolean.
 *
 * @param value the value to validate.
 * @param callback the callback used to report findings of type {@link TypeValidationFinding}.
 * @returns the input value as boolean.
 * @throws ValidationError if the input value is not of type boolean.
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
 * Validate if a value of unknown type has type number.
 *
 * @param value the value to validate.
 * @param callback the callback used to report findings of type {@link TypeValidationFinding}.
 * @returns the input value as number.
 * @throws ValidationError if the input value is not of type number.
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
 * Validate if a value of unknown type has type string.
 *
 * @param value the value to validate.
 * @param callback the callback used to report findings of type {@link TypeValidationFinding}.
 * @returns the input value as string.
 * @throws ValidationError if the input value is not of type string.
 */
export function hasTypeString(value: unknown, callback: FindingCallback<TypeValidationFinding>): string {
  if (typeof value === "string") {
    return value
  } else {
    callback(createTypeValidationFinding(ExpectedTypeEnum.STRING))
    throw new ValidationError()
  }
}

export type JsonObject = { [key: string]: unknown }

/**
 * Validate if a value of unknown type is of type object with string keys.
 *
 * Examples:
 * - `{}` -> valid
 * - `{key: "value"}` -> valid
 * - `{0: value}` -> valid
 * - `["value 0", "value 1"]` -> invalid
 * - `null` -> invalid
 * - `undefined` -> invalid
 *
 * @param value the value to validate.
 * @param callback the callback used to report findings of type {@link TypeValidationFinding}.
 * @returns the input value as {@link JsonObject}.
 * @throws ValidationError if the input value is not of type object, is `null`, or of type array.
 */
export function hasTypeObject(value: unknown, callback: FindingCallback<TypeValidationFinding>): JsonObject {
  if (typeof value === "object" && value !== null && !Array.isArray(value)) {
    return { ...value }
  } else {
    callback(createTypeValidationFinding(ExpectedTypeEnum.OBJECT))
    throw new ValidationError()
  }
}

export type JsonArray = { [key: number]: unknown }

/**
 * Validate if a value of unknown type is an array.
 *
 * Examples:
 * - `[]` -> valid
 * - `["value 0", "value 1"]` -> valid
 * - `{}` -> invalid
 * - `{key: "value"}` -> invalid
 * - `{0: "value"}` -> invalid
 * - `null` -> invalid
 * - `undefined` -> invalid
 *
 * @param value the value to validate.
 * @param callback the callback used to report findings of type {@link TypeValidationFinding}.
 * @returns the input value as {@link JsonArray}.
 * @throws ValidationError if the input value is not an array.
 */
export function hasTypeArray(value: unknown, callback: FindingCallback<TypeValidationFinding>): JsonArray {
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
