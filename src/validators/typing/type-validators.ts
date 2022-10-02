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

export function hasTypeBoolean(value: unknown, callback: FindingCallback<TypeValidationFinding>): boolean {
  if (typeof value === "boolean") {
    return value
  } else {
    callback(createCriticalViolationResult(ExpectedTypeEnum.BOOLEAN))
    throw new ValidationError()
  }
}

export function hasTypeNumber(value: unknown, callback: FindingCallback<TypeValidationFinding>): number {
  if (typeof value === "number" && !isNaN(value)) {
    return value
  } else {
    callback(createCriticalViolationResult(ExpectedTypeEnum.NUMBER))
    throw new ValidationError()
  }
}

export function hasTypeString(value: unknown, callback: FindingCallback<TypeValidationFinding>): string {
  if (typeof value === "string") {
    return value
  } else {
    callback(createCriticalViolationResult(ExpectedTypeEnum.STRING))
    throw new ValidationError()
  }
}

export type JsonObject = { [key: string]: unknown }

export function hasTypeObject(value: unknown, callback: FindingCallback<TypeValidationFinding>): JsonObject {
  if (typeof value === "object" && value !== null && !Array.isArray(value)) {
    return { ...value }
  } else {
    callback(createCriticalViolationResult(ExpectedTypeEnum.OBJECT))
    throw new ValidationError()
  }
}

export type JsonArray = { [key: number]: unknown }

export function hasTypeArray(value: unknown, callback: FindingCallback<TypeValidationFinding>): JsonArray {
  if (Array.isArray(value)) {
    return value
  } else {
    callback(createCriticalViolationResult(ExpectedTypeEnum.ARRAY))
    throw new ValidationError()
  }
}

function createCriticalViolationResult(expectedType: ExpectedTypeEnum): TypeValidationFinding {
  return {
    key: "TypeValidationFinding",
    path: [],
    details: { expectedType },
  }
}
