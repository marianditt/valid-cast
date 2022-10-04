import { AbstractFinding, FindingCallback, ValidationError, Validator } from "../../lib/validator"

export class SwitchValidator<V, R0, F0 extends AbstractFinding> {
  static of<V, R, F extends AbstractFinding>(validator: Validator<V, R, F>): SwitchValidator<V, R, F> {
    return new SwitchValidator<V, R, F>(makeStrict(validator))
  }

  private constructor(private readonly strictValidator: Validator<V, R0, F0>) {}

  or<R1, F1 extends AbstractFinding>(caseValidator: Validator<V, R1, F1>): SwitchValidator<V, R0 | R1, F0 | F1> {
    const validator = (value: V, callback: FindingCallback<F0 | F1>): R0 | R1 => {
      try {
        return this.strictValidator(value, callback)
      } catch {
        return makeStrict(caseValidator)(value, callback)
      }
    }

    return new SwitchValidator(validator)
  }

  get validator(): Validator<V, R0, F0> {
    return (value: V, callback: FindingCallback<F0>): R0 => {
      const findings: F0[] = []
      try {
        return this.strictValidator(value, (finding: F0) => findings.push(finding))
      } catch {
        // Handle findings.
      }
      findings.forEach((finding: F0) => callback(finding))
      throw new ValidationError()
    }
  }
}

function makeStrict<V, R, F extends AbstractFinding>(validator: Validator<V, R, F>): Validator<V, R, F> {
  return (value: V, callback: FindingCallback<F>): R => {
    let isValid = true
    const result: R = validator(value, (finding: F) => {
      isValid = false
      callback(finding)
    })
    if (isValid) {
      return result
    } else {
      throw new ValidationError()
    }
  }
}
