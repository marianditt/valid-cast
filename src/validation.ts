import { AbstractFinding, ValidationError, Validator } from "./validator"

export class Validation<R, F extends AbstractFinding> {
  static validate<V, R, F extends AbstractFinding>(value: V, validator: Validator<V, R, F>): Validation<R, F> {
    const findings: F[] = []
    try {
      const result = validator(value, (finding: F) => findings.push(finding))
      if (findings.length === 0) {
        return new Validation<R, F>({ value: result, findings: null })
      } else {
        return new Validation<R, F>({ value: null, findings })
      }
    } catch {
      return new Validation<R, F>({ value: null, findings })
    }
  }

  private constructor(private readonly result: ValidationResult<R, F>) {}

  getValue(): R {
    if (this.result.findings === null) {
      return this.result.value
    } else {
      throw new ValidationError()
    }
  }

  getFindings(): F[] {
    return this.result.findings ?? []
  }
}

interface ValidResult<R> {
  value: R
  findings: null
}

interface ResultWithFindings<F> {
  value: null
  findings: F[]
}

type ValidationResult<R, F> = ValidResult<R> | ResultWithFindings<F>
