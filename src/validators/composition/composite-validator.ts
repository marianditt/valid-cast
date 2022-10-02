import { AbstractFinding, FindingCallback, ValidationError, ValidationFinding, Validator } from "../../lib/validator"

export type Field<T, K extends keyof T> = K extends keyof T ? { [P in K]-?: T[P] } : never

export interface StrictCompositeValidationDetails {
  readonly expectedKeys: string[]
  readonly actualKeys: string[]
}

export interface StrictCompositeValidationFinding
  extends ValidationFinding<"StrictCompositeValidationFinding", StrictCompositeValidationDetails> {}

export class CompositeValidator<T, R extends {}, F extends AbstractFinding> {
  static of<T>(): CompositeValidator<T, {}, never> {
    const wrapper: Validator<unknown, {}, never> = () => ({})
    return new CompositeValidator<T, {}, never>(wrapper)
  }

  constructor(private readonly partialValidator: Validator<unknown, R, F>) {}

  add<K extends keyof T, FF extends AbstractFinding>(
    key: K,
    fieldValidator: Validator<unknown, T[K], FF>
  ): CompositeValidator<T, R & Field<T, K>, F | FF> {
    const wrapper = (value: unknown, callback: FindingCallback<F | FF>): R & Field<T, K> => {
      const partialResult = getResultOrNull(this.partialValidator, value, callback)
      const fieldResult = getResultOrNull(fieldValidator, value, (finding: FF) =>
        fieldCallback(String(key), finding, callback)
      )
      if (partialResult !== null && fieldResult !== null) {
        return { ...partialResult, ...createField(key, fieldResult) }
      } else {
        throw new ValidationError()
      }
    }

    return new CompositeValidator(wrapper)
  }

  get validator(): Validator<unknown, R, F> {
    return this.partialValidator
  }

  get exactValidator(): Validator<unknown, R, F | StrictCompositeValidationFinding> {
    return (value: unknown, callback: FindingCallback<F | StrictCompositeValidationFinding>): R => {
      const result: R = this.validator(value, callback)
      const valueKeys = typeof value === "object" && value !== null ? Object.keys(value) : []
      const resultKeys = Object.keys(result)
      if (valueKeys.length !== resultKeys.length) {
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

function getResultOrNull<R, F extends AbstractFinding>(
  validator: Validator<unknown, R, F>,
  value: unknown,
  callback: FindingCallback<F>
): R | null {
  try {
    return validator(value, callback)
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
