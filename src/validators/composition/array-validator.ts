import { AbstractFinding, FindingCallback, ValidationError, Validator } from "../../lib/validator"

export function isValidArrayOf<V, R, F extends AbstractFinding>(
  itemValidator: Validator<V, R, F>
): Validator<V[], R[], F> {
  function validator(value: V[], callback: FindingCallback<F>): R[] {
    const result: R[] = new Array<R>(value.length)
    let hasError: boolean = false
    for (let index = 0; index < value.length; ++index) {
      try {
        result[index] = itemValidator(value[index], (finding: F) => arrayCallback(index, finding, callback))
      } catch {
        hasError = true
      }
    }

    if (hasError) {
      throw new ValidationError()
    } else {
      return result
    }
  }

  return validator
}

function arrayCallback<F extends AbstractFinding>(index: number, finding: F, callback: FindingCallback<F>): void {
  const arrayFinding: F = { ...finding, path: ["" + index, ...finding.path] }
  callback(arrayFinding)
}
