import { ValidationError } from "../../lib/validator"
import {
  createResultWithFindingsValidator,
  createValidationErrorValidator,
  createValidResultValidator,
  expectFindings,
} from "../testing/test-utils"
import { SwitchValidator } from "./switch-validator"

describe("SwitchValidator", () => {
  describe("given only valid results", () => {
    it("should return result of single validator", () => {
      const mockCallback = jest.fn()
      const validator = createValidResultValidator<string, number>(42)
      const result = SwitchValidator.of(validator).validator("input", mockCallback)
      expect(result).toBe(42)
      expectFindings(mockCallback, [])
    })

    it("should return first result of multiple validators", () => {
      const mockCallback = jest.fn()
      const first = createValidResultValidator<string, number>(42)
      const second = createValidResultValidator<string, boolean>(true)
      const third = createValidResultValidator<string, string>("word")
      const result = SwitchValidator.of(first).or(second).or(third).validator("input", mockCallback)
      expect(result).toBe(42)
      expectFindings(mockCallback, [])
    })
  })

  describe("given results with findings", () => {
    it("should report finding of single validator", () => {
      const mockCallback = jest.fn()
      const validator = createResultWithFindingsValidator<string, number>(0, "f1")
      expect(() => SwitchValidator.of(validator).validator("input", mockCallback)).toThrow(ValidationError)
      expectFindings(mockCallback, ["f1"])
    })

    it("should return first valid result and no findings", () => {
      const mockCallback = jest.fn()
      const first = createResultWithFindingsValidator<string, number>(1, "f1")
      const second = createValidResultValidator<string, number>(2)
      const result = SwitchValidator.of(first).or(second).validator("input", mockCallback)
      expect(result).toBe(2)
      expectFindings(mockCallback, [])
    })

    it("should report findings if all of multiple validators have findings", () => {
      const mockCallback = jest.fn()
      const first = createResultWithFindingsValidator<string, number>(0, "f1")
      const second = createResultWithFindingsValidator<string, boolean>(false, "f2")
      const third = createResultWithFindingsValidator<string, string>("", "f3")
      const validator = SwitchValidator.of(first).or(second).or(third).validator
      expect(() => validator("input", mockCallback)).toThrow(ValidationError)
      expectFindings(mockCallback, ["f1", "f2", "f3"])
    })
  })

  describe("given critical results", () => {
    it("should report finding of single validator", () => {
      const mockCallback = jest.fn()
      const validator = createValidationErrorValidator<string, number>("f1")
      expect(() => SwitchValidator.of(validator).validator("input", mockCallback)).toThrow(ValidationError)
      expectFindings(mockCallback, ["f1"])
    })

    it("should return first valid result and no findings", () => {
      const mockCallback = jest.fn()
      const first = createValidationErrorValidator<string, number>("f1")
      const second = createValidResultValidator<string, number>(42)
      const result = SwitchValidator.of(first).or(second).validator("input", mockCallback)
      expect(result).toBe(42)
      expectFindings(mockCallback, [])
    })

    it("should report findings if all of multiple validators throw error", () => {
      const mockCallback = jest.fn()
      const first = createValidationErrorValidator<string, number>("f1")
      const second = createValidationErrorValidator<string, boolean>("f2")
      const third = createValidationErrorValidator<string, string>("f3")
      const validator = SwitchValidator.of(first).or(second).or(third).validator
      expect(() => validator("input", mockCallback)).toThrow(ValidationError)
      expectFindings(mockCallback, ["f1", "f2", "f3"])
    })
  })
})
