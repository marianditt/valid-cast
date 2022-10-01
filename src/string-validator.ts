import { validate as validateUuid } from "uuid"
import { FindingCallback, ValidationError, ValidationFinding } from "./validator"

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

export function isValidJson(value: string, callback: FindingCallback<StringValidationFinding>): unknown {
  try {
    return JSON.parse(value)
  } catch {
    callback(createStringValidationFinding(StringErrorEnum.INVALID_JSON))
    throw new ValidationError()
  }
}

export function isValidUuid(value: string, callback: FindingCallback<StringValidationFinding>): string {
  if (!validateUuid(value)) {
    callback(createStringValidationFinding(StringErrorEnum.INVALID_UUID))
  }
  return value
}

export function isValidIntegerString(value: string, callback: FindingCallback<StringValidationFinding>): number {
  const result = parseInt(value, 10)
  if (isNaN(result)) {
    callback(createStringValidationFinding(StringErrorEnum.INVALID_INTEGER))
  }
  return result
}

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
