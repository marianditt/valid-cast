export interface ValidResult<R> {
  value: R
  findings: null
}

export interface ResultWithFindings<F> {
  value: null
  findings: F[]
}

export type ValidationResult<R, F> = ValidResult<R> | ResultWithFindings<F>
