import { ValidationError } from "../../lib/validator"
import {
  createValidationErrorValidator,
  createMockFinding,
  createResultWithFindingsValidator,
  createValidResultValidator,
} from "../testing/test-utils"
import { isValidArrayOf } from "./array-validator"

describe("ArrayValidator", () => {
  function expectFindings(mockCallback: jest.Mock, ids: string[]): void {
    expect(mockCallback).toHaveBeenCalledTimes(ids.length)
    for (let index = 0; index < ids.length; ++index) {
      expect(mockCallback.mock.calls[index].length).toBe(1)
      expect(mockCallback.mock.calls[index][0]).toStrictEqual(createMockFinding(ids[index], ["" + index]))
    }
  }

  describe("given only valid results", () => {
    it("should return result for empty array", () => {
      const mockCallback = jest.fn()
      const validator = isValidArrayOf(createValidationErrorValidator<string, string>("f1"))
      expect(validator([], mockCallback)).toStrictEqual([])
      expectFindings(mockCallback, [])
    })

    it("should return result for valid items", () => {
      const mockCallback = jest.fn()
      const validator = isValidArrayOf(createValidResultValidator<string, string>("item"))
      expect(validator(["input", "input"], mockCallback)).toStrictEqual(["item", "item"])
      expectFindings(mockCallback, [])
    })
  })

  describe("given results with findings", () => {
    it("should return result and propagate all findings with index", () => {
      const mockCallback = jest.fn()
      const validator = isValidArrayOf(createResultWithFindingsValidator<string, string>("item", "f"))
      expect(validator(["input", "input"], mockCallback)).toStrictEqual(["item", "item"])
      expectFindings(mockCallback, ["f", "f"])
    })
  })

  describe("given critical results", () => {
    it("should throw and propagate all findings with index", () => {
      const mockCallback = jest.fn()
      const validator = isValidArrayOf(createValidationErrorValidator<string, string>("f"))
      expect(() => validator(["input", "input"], mockCallback)).toThrow(ValidationError)
      expectFindings(mockCallback, ["f", "f"])
    })
  })
})
