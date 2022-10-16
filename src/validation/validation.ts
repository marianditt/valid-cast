import { AbstractFinding, ValidationError, Validator } from "../lib/validator"
import { ValidationResult } from "./validation-types"

/**
 * The validation class provides an entry point for validation and access to the validation result.
 *
 * @see validate
 */
export class Validation<R, F extends AbstractFinding> {
  /**
   * The entry point for validations.
   *
   * @param value the value to validate.
   * @param validator a primitive or composite validator used for validation.
   * @returns the validation instance that gives access to the validation result or findings.
   */
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

  /**
   * Tries to get the validation result.
   *
   * A value is only returned if the {@link Validator} did not report any {@link ValidationFinding}s.
   * A {@link ValidationError} is thrown even if the {@link Validator} returned a result
   * but also reported a {@link ValidationFinding}.
   *
   * @returns the valid result of correct type.
   * @throws {@link ValidationError} if at least one {@link ValidationFinding} was reported.
   */
  getValue(): R {
    if (this.result.findings === null) {
      return this.result.value
    } else {
      throw new ValidationError()
    }
  }

  /**
   * @returns all reported {@link ValidationFinding}s or an empty array only if the result is valid.
   */
  getFindings(): F[] {
    return this.result.findings ?? []
  }
}
