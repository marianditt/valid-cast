import { AbstractFinding, Validator } from "../../lib/validator"

export type Field<T, K extends keyof T> = K extends keyof T ? { [P in K]-?: T[P] } : never
export type PartialValidator<R, F extends AbstractFinding> = Validator<{}, R, F>
export type FieldValidator<T, K extends keyof T, F extends AbstractFinding> = Validator<unknown, T[K], F>
