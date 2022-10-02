import { FindingCallback, ValidationFinding } from "../../lib/validator"

export enum ConstantKey {
  UNDEFINED = "UNDEFINED",
  NULL = "NULL",
  NAN = "NAN",
}

export interface ConstantValidationDetails {
  expectedValue: ConstantKey
}

export interface ConstantValidationFinding extends ValidationFinding<"ConstantValidationFinding", {}> {}

export class ConstantValidator {
  static isUndefined(value: unknown, callback: FindingCallback<ConstantValidationFinding>): undefined {
    if (value !== undefined) {
      callback(createConstantValidationFinding(ConstantKey.UNDEFINED))
    }
    return undefined
  }

  static isNull(value: unknown, callback: FindingCallback<ConstantValidationFinding>): null {
    if (value !== null) {
      callback(createConstantValidationFinding(ConstantKey.NULL))
    }
    return null
  }

  static isNaN(value: number, callback: FindingCallback<ConstantValidationFinding>): number {
    if (!isNaN(value)) {
      callback(createConstantValidationFinding(ConstantKey.NAN))
    }
    return NaN
  }
}

function createConstantValidationFinding(key: ConstantKey): ConstantValidationFinding {
  return {
    key: "ConstantValidationFinding",
    path: [],
    details: { expectedValue: key },
  }
}
