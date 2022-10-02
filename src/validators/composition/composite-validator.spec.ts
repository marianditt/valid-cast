import { ValidationError } from "../../lib/validator"
import {
  createCriticalResultValidator,
  createMockFinding,
  createResultWithFindingsValidator,
  createValidResultValidator,
} from "../testing/test-utils"
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
        .add("name", createCriticalResultValidator("fName"))
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
        .add("isBroken", createCriticalResultValidator("fIsBroken")).validator
      expect(() => validator({}, mockCallback)).toThrow(ValidationError)
      expectFindings(mockCallback, ["isBroken"], ["fIsBroken"])
    })

    it("should throw and propagate all field findings with key", () => {
      const mockCallback = jest.fn()
      const validator = CompositeValidator.of<Thing>()
        .add("name", createCriticalResultValidator("fName"))
        .add("age", createValidResultValidator(thing.age))
        .add("isBroken", createCriticalResultValidator("fIsBroken")).validator
      expect(() => validator({}, mockCallback)).toThrow(ValidationError)
      expectFindings(mockCallback, ["name", "isBroken"], ["fName", "fIsBroken"])
    })
  })
})
