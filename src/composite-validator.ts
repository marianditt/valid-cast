import { JsonObject } from "./type-validators"
import { AbstractFinding, FindingCallback, ValidationError, Validator } from "./validator"

export type Field<T, K extends keyof T> = K extends keyof T ? { [P in K]-?: T[P] } : never

export class CompositeValidator<T, R, F extends AbstractFinding> {
  static of<T>(): CompositeValidator<T, {}, never> {
    const wrapper: Validator<JsonObject, {}, never> = () => ({})
    return new CompositeValidator<T, {}, never>(wrapper)
  }

  constructor(private readonly partialValidator: Validator<JsonObject, R, F>) {}

  add<K extends keyof T, FF extends AbstractFinding>(
    key: K,
    fieldValidator: Validator<unknown, T[K], FF>
  ): CompositeValidator<T, R & Field<T, K>, F | FF> {
    const wrapper = (value: JsonObject, callback: FindingCallback<F | FF>): R & Field<T, K> => {
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

  get validator(): Validator<JsonObject, R, F> {
    return this.partialValidator
  }
}

function getResultOrNull<R, F extends AbstractFinding>(
  validator: Validator<JsonObject, R, F>,
  value: JsonObject,
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
  return { [key]: value } as Field<T, K>
}
