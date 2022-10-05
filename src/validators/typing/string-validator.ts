import { validate as validateUuid } from "uuid"
import { FindingCallback, ValidationError, ValidationFinding } from "../../lib/validator"

export enum StringErrorEnum {
  INVALID_JSON = "INVALID_JSON",
  INVALID_UUID = "INVALID_UUID",
  INVALID_INTEGER = "INVALID_INTEGER",
  INVALID_FLOAT = "INVALID_FLOAT",
}

export interface StringValidationDetails {
  error: StringErrorEnum
}

export interface StringValidationFinding
  extends ValidationFinding<"StringValidationFinding", StringValidationDetails> {}

/**
 * Validate if a value of type string is valid json.
 *
 * The validator returns the parsed json value if the input is valid.
 * The returned type is unknown, because Valid Cast tries hard not to make any assumptions.
 *
 * @param value the value to validate.
 * @param callback the callback used to report findings of type {@link StringValidationFinding}.
 * @returns the input value parsed as json object and type `unknown`.
 * @throws ValidationError if the input value cannot be parsed as json.
 */
export function isValidJson(value: string, callback: FindingCallback<StringValidationFinding>): unknown {
  try {
    return JSON.parse(value)
  } catch {
    callback(createStringValidationFinding(StringErrorEnum.INVALID_JSON))
    throw new ValidationError()
  }
}

/**
 * Validate if a value of type string is a valid uuid.
 *
 * The validator does not throw a {@link ValidationError}.
 * Instead, a validation finding is reported and the invalid value is passed to successor validators.
 *
 * @param value the value to validate.
 * @param callback the callback used to report findings of type {@link StringValidationFinding}.
 * @returns the input value.
 */
export function isValidUuid(value: string, callback: FindingCallback<StringValidationFinding>): string {
  if (!validateUuid(value)) {
    callback(createStringValidationFinding(StringErrorEnum.INVALID_UUID))
  }
  return value
}

/**
 * Validate if a value of type string is a valid integer.
 *
 * A value is considered invalid if {@link parseInt} returns {@link NaN}.
 * The validator does not throw a {@link ValidationError}.
 * Instead, a validation finding is reported and `NaN` is passed to successor validators.
 *
 * @param value the value to validate.
 * @param callback the callback used to report findings of type {@link StringValidationFinding}.
 * @returns the input value parsed as integer or `NaN`.
 */
export function isValidIntegerString(value: string, callback: FindingCallback<StringValidationFinding>): number {
  const result = parseInt(value, 10)
  if (isNaN(result)) {
    callback(createStringValidationFinding(StringErrorEnum.INVALID_INTEGER))
  }
  return result
}

/**
 * Validate if a value of type string is a valid float.
 *
 * A value is considered invalid if {@link parseFloat} returns {@link NaN}.
 * The validator does not throw a {@link ValidationError}.
 * Instead, a validation finding is reported and `NaN` is passed to successor validators.
 *
 * @param value the value to validate.
 * @param callback the callback used to report findings of type {@link StringValidationFinding}.
 * @returns the input value parsed as integer or `NaN`.
 */
export function isValidFloatString(value: string, callback: FindingCallback<StringValidationFinding>): number {
  const result = parseFloat(value)
  if (isNaN(result)) {
    callback(createStringValidationFinding(StringErrorEnum.INVALID_FLOAT))
  }
  return result
}

export function createStringValidationFinding(error: StringErrorEnum): StringValidationFinding {
  return { key: "StringValidationFinding", path: [], details: { error } }
}
