/**
 * Base type of all primitive and composite validators.
 *
 * A validator is a function that takes an input value to validate
 * and a {@link FindingCallback} function to report {@link ValidationFinding}s.
 *
 * Validators can either return a result or throw a {@link ValidationError}.
 * Returning a result does not necessarily mean that the result is valid.
 * Validators enable further inspection by other validators when returning a result.
 * A {@link ValidationError} is thrown if validators cannot or choose not to return a result.
 *
 * {@link ValidationFinding}s are reported using the {@link FindingCallback} function.
 * Validators must report at least one {@link ValidationFinding} if an input value is invalid.
 * Multiple {@link ValidationFinding}s can be reported through multiple calls to the {@link FindingCallback} function.
 *
 * @example
 * interface OddValidationDetails {
 *   readonly actualValue: number
 * }
 *
 * interface OddValidationFinding extends ValidationFinding<"OddValidationFinding", OddValidationDetails> {}
 *
 * // A validator that takes and returns a number.
 * function isOddValidator(value: number, callback: FindingCallback<OddValidationFinding>): number {
 *   if (value % 2 !== 1) {
 *     const finding: OddValidationFinding = {
 *       key: "OddValidationFinding",
 *       path: [],
 *       details: { actualValue: value },
 *     }
 *     callback(finding)
 *   }
 *   return value // return the input value even if it is invalid for further validation.
 * }
 */
export type Validator<V, R, F extends AbstractFinding> = (value: V, callback: FindingCallback<F>) => R

/**
 * A callback function provided by {@link Validation}
 * and used by {@link Validator}s to collect {@link ValidationFinding}s.
 */
export type FindingCallback<F extends AbstractFinding> = (finding: F) => void

/**
 * Base type of all {@link ValidationFinding}s.
 */
export type AbstractFinding = ValidationFinding<string, unknown>

/**
 * Generic finding type reported by {@link Validator}s.
 *
 * Findings provide a unique key, a path and details.
 * The key is specified by the {@link Validator} and must identify a finding type uniquely.
 * The path locates a property of the validated value, which is addressed by the finding.
 * Levels of nested properties are individual items in the path.
 * {@link Validator}s provide details that further describe the validation finding.
 *
 * Consider a company which provides a list of employees.
 * The example shows that the name of the employee at index 1 is of invalid type.
 *
 * @example
 * {
 *   key: "TypeValidationFinding",
 *   path: ["employees", "1", "name"],
 *   details: {
 *     expectedType: "STRING",
 *   }
 * }
 */
export interface ValidationFinding<K extends string, D> {
  readonly key: K
  readonly path: string[]
  readonly details: D
}

/**
 * {@link Validation} and {@link Validator}s throw validation errors if a result cannot or should not be returned.
 */
export class ValidationError extends Error {}
