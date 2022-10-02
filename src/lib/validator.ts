export type Validator<V, R, F extends AbstractFinding> = (value: V, callback: FindingCallback<F>) => R

export type FindingCallback<F extends AbstractFinding> = (finding: F) => void

export interface ValidationFinding<K extends string, D> {
  readonly key: K
  readonly path: string[]
  readonly details: D
}

export type AbstractFinding = ValidationFinding<string, unknown>

export class ValidationError extends Error {}
