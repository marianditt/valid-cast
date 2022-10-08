import { AbstractFinding, Validator } from "../../lib/validator"
import { ConstantValidationFinding, ConstantValidator } from "../value/constant-validator"
import { SwitchValidator } from "./switch-validator"

export function isValidValueOrNull<V, R, F extends AbstractFinding>(
  valueValidator: Validator<V, R, F>
): Validator<V, R | null, F | ConstantValidationFinding> {
  return SwitchValidator.of(valueValidator).or(ConstantValidator.isNull).validator
}

export function isValidOptionalValue<V, R, F extends AbstractFinding>(
  valueValidator: Validator<V, R, F>
): Validator<V, R | undefined, F | ConstantValidationFinding> {
  return SwitchValidator.of(valueValidator).or(ConstantValidator.isUndefined).validator
}
