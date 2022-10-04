import { AbstractFinding, FindingCallback, Validator } from "../../lib/validator"

export class ChainValidator<V0, R0, F0 extends AbstractFinding> {
  static of<V, R, F extends AbstractFinding>(validator: Validator<V, R, F>): ChainValidator<V, R, F> {
    return new ChainValidator(validator)
  }

  private constructor(private readonly chainValidator: Validator<V0, R0, F0>) {}

  and<R1, F1 extends AbstractFinding>(nextValidator: Validator<R0, R1, F1>): ChainValidator<V0, R1, F0 | F1> {
    const validator = (value: V0, callback: FindingCallback<F0 | F1>): R1 => {
      const chainResult = this.chainValidator(value, callback)
      return nextValidator(chainResult, callback)
    }
    return new ChainValidator(validator)
  }

  get validator(): Validator<V0, R0, F0> {
    return this.chainValidator
  }
}
