import { AbstractFinding, FindingCallback, Validator } from "../../lib/validator"

/**
 * The chain validator can be used to concatenate {@link Validator}s.
 *
 * The result of one {@link Validator} is used as the input for the next.
 * Valid results must satisfy all conditions in the chain.
 * Every {@link Validator} in the chain can report {@link ValidationFinding}s.
 * Any {@link Validator} that throws a {@link ValidationError} interrupts the chain validation.
 *
 * Note that chain validators can also be used to transform types incrementally.
 *
 * @example
 * const isValidPercentage = ChainValidator
 *   .of(hasTypeString)
 *   .and(isValidIntegerString)
 *   .and(isGreaterOrEqual(0))
 *   .and(isLessOrEqual(100))
 *   .validator
 *
 * const input: unknown = "42"
 * const result: number = Validation.validate(input, isValidPercentage).getValue()
 * // result -> 42
 *
 * @example
 * const input: unknown = "forty-two"
 * const findings = Validation.validate(input, isValidPercentage).getFindings()
 * // findings.length -> 3 ("forty-two" is not a number, comparison with NaN is always false)
 *
 * @see of
 * @see validator
 */
export class ChainValidator<V0, R0, F0 extends AbstractFinding> {
  /**
   * The entry point for validation chains.
   *
   * @param firstValidator the first validator in the chain.
   * @returns the chain validator builder.
   * @see validator
   */
  static of<V, R, F extends AbstractFinding>(firstValidator: Validator<V, R, F>): ChainValidator<V, R, F> {
    return new ChainValidator(firstValidator)
  }

  private constructor(private readonly chainValidator: Validator<V0, R0, F0>) {}

  /**
   * Adds the next validator to the chain.
   *
   * @param nextValidator the validator that is appended to the chain.
   * @returns the chain validator builder.
   * @see validator
   */
  and<R1, F1 extends AbstractFinding>(nextValidator: Validator<R0, R1, F1>): ChainValidator<V0, R1, F0 | F1> {
    const validator = (value: V0, callback: FindingCallback<F0 | F1>): R1 => {
      const chainResult = this.chainValidator(value, callback)
      return nextValidator(chainResult, callback)
    }
    return new ChainValidator(validator)
  }

  /**
   * @returns the built composite chain validator.
   */
  get validator(): Validator<V0, R0, F0> {
    return this.chainValidator
  }
}
