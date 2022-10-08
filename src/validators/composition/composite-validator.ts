import { AbstractFinding, FindingCallback, ValidationError, ValidationFinding } from "../../lib/validator"
import { Field, FieldValidator, PartialValidator } from "./composite-validator.types"

export interface StrictCompositeValidationDetails {
  readonly expectedKeys: string[]
  readonly actualKeys: string[]
}

export interface StrictCompositeValidationFinding
  extends ValidationFinding<"StrictCompositeValidationFinding", StrictCompositeValidationDetails> {}

export class CompositeValidator<T, R extends {}, F extends AbstractFinding> {
  static of<T>(): CompositeValidator<T, {}, never> {
    const validator: PartialValidator<{}, never> = () => ({})
    return new CompositeValidator<T, {}, never>(validator)
  }

  private constructor(private readonly partialValidator: PartialValidator<R, F>) {}

  add<K extends keyof T, FF extends AbstractFinding>(
    key: K,
    fieldValidator: FieldValidator<T, K, FF>
  ): CompositeValidator<T, R & Field<T, K>, F | FF> {
    const validator = (value: {}, callback: FindingCallback<F | FF>): R & Field<T, K> => {
      const partialResult = getPartialResultOrNull(this.partialValidator, value, callback)
      const fieldResult = getFieldResultOrNull(fieldValidator, key, value, (finding: FF) =>
        fieldCallback(String(key), finding, callback)
      )
      if (partialResult !== null && fieldResult !== null) {
        return { ...partialResult, ...fieldResult }
      } else {
        throw new ValidationError()
      }
    }

    return new CompositeValidator(validator)
  }

  get validator(): PartialValidator<R, F> {
    return this.partialValidator
  }

  get exactValidator(): PartialValidator<R, F | StrictCompositeValidationFinding> {
    return (value: {}, callback: FindingCallback<F | StrictCompositeValidationFinding>): R => {
      const result: R = this.validator(value, callback)
      const valueKeys = value !== undefined && value !== null ? Object.keys(value) : []
      const resultKeys = Object.keys(result)
      if (valueKeys.length > resultKeys.length) {
        const finding: StrictCompositeValidationFinding = {
          key: "StrictCompositeValidationFinding",
          path: [],
          details: {
            expectedKeys: resultKeys,
            actualKeys: valueKeys,
          },
        }
        callback(finding)
      }
      return result
    }
  }
}

function getPartialResultOrNull<R, F extends AbstractFinding>(
  validator: PartialValidator<R, F>,
  value: {},
  callback: FindingCallback<F>
): R | null {
  try {
    return validator(value, callback)
  } catch {
    return null
  }
}

function getFieldResultOrNull<T, K extends keyof T, F extends AbstractFinding>(
  validator: FieldValidator<T, K, F>,
  key: K,
  value: {},
  callback: FindingCallback<F>
): Field<T, K> | null {
  try {
    const result = validator((value as any)[key] as unknown, callback)
    return createField(key, result)
  } catch {
    return null
  }
}

function fieldCallback<F extends AbstractFinding>(key: string, finding: F, callback: FindingCallback<F>): void {
  callback({ ...finding, path: [key, ...finding.path] })
}

function createField<T, K extends keyof T>(key: K, value: T[K]): Field<T, K> {
  return { [key]: value } as unknown as Field<T, K>
}
