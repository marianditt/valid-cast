import { FindingCallback, ValidationError, ValidationFinding, Validator } from "../../lib/validator"

export interface MockFindingDetails {
  readonly id: string
}

export interface MockFinding extends ValidationFinding<"MockFinding", MockFindingDetails> {}

export function createMockFinding(id: string, path: string[] | null = null): MockFinding {
  return { key: "MockFinding", path: path ?? [], details: { id } }
}

export function createValidResultValidator<V, R>(result: R): Validator<V, R, never> {
  return () => result
}

export function createResultWithFindingsValidator<V, R>(result: R, id: string): Validator<V, R, MockFinding> {
  return (value: V, callback: FindingCallback<MockFinding>) => {
    callback(createMockFinding(id))
    return result
  }
}

export function createCriticalResultValidator<V, R>(id: string): Validator<V, R, MockFinding> {
  return (value: V, callback: FindingCallback<MockFinding>) => {
    callback(createMockFinding(id))
    throw new ValidationError()
  }
}
