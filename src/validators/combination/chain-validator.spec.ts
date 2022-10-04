import { ValidationError } from "../../lib/validator"
import {
  createValidationErrorValidator,
  createResultWithFindingsValidator,
  createValidResultValidator,
  expectFindings,
} from "../testing/test-utils"
import { ChainValidator } from "./chain-validator"

describe("ChainValidator", () => {
  describe("given only valid results", () => {
    it("should return result of single validator", () => {
      const mockCallback = jest.fn()
      const validator = createValidResultValidator<string, number>(42)
      const result = ChainValidator.of(validator).validator("input", mockCallback)
      expect(result).toBe(42)
      expectFindings(mockCallback, [])
    })

    it("should return last result of many validators", () => {
      const mockCallback = jest.fn()
      const first = createValidResultValidator<string, number>(42)
      const second = createValidResultValidator<number, boolean>(true)
      const third = createValidResultValidator<boolean, number>(13)
      const result = ChainValidator.of(first).and(second).and(third).validator("input", mockCallback)
      expect(result).toBe(13)
      expectFindings(mockCallback, [])
    })
  })

  describe("given results with findings", () => {
    it("should return finding of single validator", () => {
      const mockCallback = jest.fn()
      const validator = createResultWithFindingsValidator<string, number>(0, "f1")
      const result = ChainValidator.of(validator).validator("input", mockCallback)
      expect(result).toBe(0)
      expectFindings(mockCallback, ["f1"])
    })

    it("should propagate early findings", () => {
      const mockCallback = jest.fn()
      const first = createResultWithFindingsValidator<string, number>(1, "f1")
      const second = createValidResultValidator<number, number>(2)
      const result = ChainValidator.of(first).and(second).validator("input", mockCallback)
      expect(result).toBe(2)
      expectFindings(mockCallback, ["f1"])
    })

    it("should add late findings", () => {
      const mockCallback = jest.fn()
      const first = createValidResultValidator<string, number>(0)
      const second = createResultWithFindingsValidator<number, number>(3, "f2")
      const result = ChainValidator.of(first).and(second).validator("input", mockCallback)
      expect(result).toBe(3)
      expectFindings(mockCallback, ["f2"])
    })

    it("should concatenate all findings", () => {
      const mockCallback = jest.fn()
      const first = createResultWithFindingsValidator<string, number>(0, "f1")
      const second = createValidResultValidator<number, number>(3)
      const third = createResultWithFindingsValidator<number, number>(-2, "f3")
      const fourth = createResultWithFindingsValidator<number, number>(100, "f4")
      const result = ChainValidator.of(first).and(second).and(third).and(fourth).validator("input", mockCallback)
      expect(result).toBe(100)
      expectFindings(mockCallback, ["f1", "f3", "f4"])
    })
  })

  describe("given critical results", () => {
    it("should return critical finding of single validator", () => {
      const mockCallback = jest.fn()
      const validator = createValidationErrorValidator<string, number>("f1")
      expect(() => ChainValidator.of(validator).validator("input", mockCallback)).toThrow(ValidationError)
      expectFindings(mockCallback, ["f1"])
    })

    it("should not list findings after first critical finding", () => {
      const mockCallback = jest.fn()
      const first = createValidationErrorValidator<string, number>("f1")
      const second = createResultWithFindingsValidator<number, number>(42, "f2")
      expect(() => ChainValidator.of(first).and(second).validator("input", mockCallback)).toThrow(ValidationError)
      expectFindings(mockCallback, ["f1"])
    })

    it("should list all findings before first critical finding", () => {
      const mockCallback = jest.fn()
      const first = createResultWithFindingsValidator<string, number>(42, "f1")
      const second = createValidationErrorValidator<number, number>("f2")
      expect(() => ChainValidator.of(first).and(second).validator("input", mockCallback)).toThrow(ValidationError)
      expectFindings(mockCallback, ["f1", "f2"])
    })

    it("should list all findings up to critical finding", () => {
      const mockCallback = jest.fn()
      const v1 = createValidResultValidator<string, number>(1)
      const v2 = createResultWithFindingsValidator<number, number>(2, "f2")
      const v3 = createResultWithFindingsValidator<number, number>(3, "f3")
      const v4 = createValidResultValidator<number, boolean>(true)
      const v5 = createValidationErrorValidator<boolean, string>("f5")
      const v6 = createValidationErrorValidator<string, number>("f6")
      const v7 = createValidResultValidator<number, number>(42)
      const validator = ChainValidator.of(v1).and(v2).and(v3).and(v4).and(v5).and(v6).and(v7).validator
      expect(() => validator("input", mockCallback)).toThrow(ValidationError)
      expectFindings(mockCallback, ["f2", "f3", "f5"])
    })
  })
})
