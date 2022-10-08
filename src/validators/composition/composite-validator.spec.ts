import { ValidationError } from "../../lib/validator"
import {
  createMockFinding,
  createResultWithFindingsValidator,
  createValidationErrorValidator,
  createValidResultValidator,
} from "../testing/test-utils"
import { hasTypeBoolean, hasTypeNumber, hasTypeString } from "../typing/type-validators"
import { CompositeValidator } from "./composite-validator"

interface Thing {
  readonly name: string
  readonly age: number
  readonly isBroken: boolean
}

const thing: Thing = {
  name: "thing",
  age: 7,
  isBroken: true,
}

describe("CompositeValidator", () => {
  function expectFindings(mockCallback: jest.Mock, keys: string[], ids: string[]): void {
    expect(mockCallback).toHaveBeenCalledTimes(Object.keys(ids).length)
    for (let index = 0; index < ids.length; ++index) {
      expect(mockCallback.mock.calls[index].length).toBe(1)
      expect(mockCallback.mock.calls[index][0]).toStrictEqual(createMockFinding(ids[index], [keys[index]]))
    }
  }

  describe("given only valid results", () => {
    it("should return result for empty object", () => {
      const mockCallback = jest.fn()
      const validator = CompositeValidator.of<{}>().validator
      expect(validator({}, mockCallback)).toStrictEqual({})
      expectFindings(mockCallback, [], [])
    })

    it("should return Thing for valid fields", () => {
      const mockCallback = jest.fn()
      const validator = CompositeValidator.of<Thing>()
        .add("name", createValidResultValidator(thing.name))
        .add("age", createValidResultValidator(thing.age))
        .add("isBroken", createValidResultValidator(thing.isBroken)).validator
      expect(validator({}, mockCallback)).toStrictEqual(thing)
      expectFindings(mockCallback, [], [])
    })
  })

  describe("given result with findings", () => {
    it("should return Thing and propagate early field finding with key", () => {
      const mockCallback = jest.fn()
      const validator = CompositeValidator.of<Thing>()
        .add("name", createResultWithFindingsValidator(thing.name, "fName"))
        .add("age", createValidResultValidator(thing.age))
        .add("isBroken", createValidResultValidator(thing.isBroken)).validator
      expect(validator({}, mockCallback)).toStrictEqual(thing)
      expectFindings(mockCallback, ["name"], ["fName"])
    })

    it("should return Thing and propagate late field finding with key", () => {
      const mockCallback = jest.fn()
      const validator = CompositeValidator.of<Thing>()
        .add("name", createValidResultValidator(thing.name))
        .add("age", createValidResultValidator(thing.age))
        .add("isBroken", createResultWithFindingsValidator(thing.isBroken, "fIsBroken")).validator
      expect(validator({}, mockCallback)).toStrictEqual(thing)
      expectFindings(mockCallback, ["isBroken"], ["fIsBroken"])
    })

    it("should return Thing and propagate all field findings with key", () => {
      const mockCallback = jest.fn()
      const validator = CompositeValidator.of<Thing>()
        .add("name", createResultWithFindingsValidator(thing.name, "fName"))
        .add("age", createResultWithFindingsValidator(thing.age, "fAge"))
        .add("isBroken", createResultWithFindingsValidator(thing.isBroken, "fIsBroken")).validator
      expect(validator({}, mockCallback)).toStrictEqual(thing)
      expectFindings(mockCallback, ["name", "age", "isBroken"], ["fName", "fAge", "fIsBroken"])
    })
  })

  describe("given critical results", () => {
    it("should throw and propagate early findings with keys", () => {
      const mockCallback = jest.fn()
      const validator = CompositeValidator.of<Thing>()
        .add("name", createValidationErrorValidator("fName"))
        .add("age", createValidResultValidator(thing.age))
        .add("isBroken", createValidResultValidator(thing.isBroken)).validator
      expect(() => validator({}, mockCallback)).toThrow(ValidationError)
      expectFindings(mockCallback, ["name"], ["fName"])
    })

    it("should throw and propagate late field finding with key", () => {
      const mockCallback = jest.fn()
      const validator = CompositeValidator.of<Thing>()
        .add("name", createValidResultValidator(thing.name))
        .add("age", createValidResultValidator(thing.age))
        .add("isBroken", createValidationErrorValidator("fIsBroken")).validator
      expect(() => validator({}, mockCallback)).toThrow(ValidationError)
      expectFindings(mockCallback, ["isBroken"], ["fIsBroken"])
    })

    it("should throw and propagate all field findings with key", () => {
      const mockCallback = jest.fn()
      const validator = CompositeValidator.of<Thing>()
        .add("name", createValidationErrorValidator("fName"))
        .add("age", createValidResultValidator(thing.age))
        .add("isBroken", createValidationErrorValidator("fIsBroken")).validator
      expect(() => validator({}, mockCallback)).toThrow(ValidationError)
      expectFindings(mockCallback, ["name", "isBroken"], ["fName", "fIsBroken"])
    })
  })

  describe("given exact validator", () => {
    it("should return Thing if result fields are equal to input fields", () => {
      const mockCallback = jest.fn()
      const validator = CompositeValidator.of<Thing>()
        .add("name", createValidResultValidator(thing.name))
        .add("age", createValidResultValidator(thing.age))
        .add("isBroken", createValidResultValidator(thing.isBroken)).exactValidator
      expect(validator(thing, mockCallback)).toStrictEqual(thing)
    })

    it("should propagate findings if result has less fields than input", () => {
      const mockCallback = jest.fn()
      const validator = CompositeValidator.of<Thing>()
        .add("name", createValidResultValidator(thing.name))
        .add("age", createValidResultValidator(thing.age))
        .add("isBroken", createValidResultValidator(thing.isBroken)).exactValidator
      expect(validator({ ...thing, extraField: undefined }, mockCallback)).toStrictEqual(thing)
      expect(mockCallback).toHaveBeenCalledTimes(1)
      expect(mockCallback.mock.calls[0].length).toBe(1)
      expect(mockCallback.mock.calls[0][0]).toStrictEqual({
        key: "StrictCompositeValidationFinding",
        path: [],
        details: {
          expectedKeys: ["name", "age", "isBroken"],
          actualKeys: ["name", "age", "isBroken", "extraField"],
        },
      })
    })
  })

  describe("given real thing", () => {
    it("should return Thing for valid input", () => {
      const mockCallback = jest.fn()
      const validator = CompositeValidator.of<Thing>()
        .add("name", hasTypeString)
        .add("age", hasTypeNumber)
        .add("isBroken", hasTypeBoolean).exactValidator
      const input: {} = {
        name: "cup",
        age: 1,
        isBroken: true,
      }
      const result: Thing = validator(input, mockCallback)
      expect(result).toStrictEqual(input)
      expectFindings(mockCallback, [], [])
    })
  })
})
