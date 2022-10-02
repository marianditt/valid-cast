import { Validator } from "../../lib/validator"
import { ComparisonValidationFinding, isGreaterThan } from "./comparison-validators"
import { hasValidProperty, PropertyValidationFinding } from "./property-validator"

describe("PropertyValidator", () => {
  describe("given list not empty condition", () => {
    let callbackMock: jest.Mock
    let validator: Validator<string[], string[], PropertyValidationFinding<number, ComparisonValidationFinding>>

    beforeEach(() => {
      callbackMock = jest.fn()
      validator = hasValidProperty("length", (array: string[]): number => array.length, isGreaterThan(0))
    })

    it("should return list for list with items", () => {
      const values: string[] = [""]
      const result = validator(values, callbackMock)
      expect(result).toBe(values)
      expect(callbackMock).toHaveBeenCalledTimes(0)
    })

    it("should return list and report findings for empty list", () => {
      const values: string[] = []
      const result = validator(values, callbackMock)
      expect(result).toBe(values)
      expect(callbackMock).toHaveBeenCalledTimes(1)
      expect(callbackMock.mock.calls[0].length).toBe(1)
      expect(callbackMock.mock.calls[0][0]).toStrictEqual({
        key: "PropertyValidationFinding",
        path: [],
        details: {
          propertyName: "length",
          propertyValue: 0,
          propertyFindings: [
            {
              key: "ComparisonValidationFinding",
              path: [],
              details: {
                comparator: ">",
                comparedValue: 0,
              },
            },
          ],
        },
      })
    })
  })
})
