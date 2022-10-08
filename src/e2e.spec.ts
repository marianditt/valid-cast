import { Validation } from "./validation"
import {
  ChainValidator,
  CompositeValidator,
  hasTypeArray,
  hasTypeObject,
  hasTypeString,
  isValidArrayOf,
  isValidJson,
  isValidNumberBetween,
  isValidOptionalValue,
  isValidStringBetween,
  isValidUuid,
  isValidValueOrNull,
} from "./validators"

interface Address {
  readonly street: string
  readonly city: string
}

interface Person {
  readonly id: string | null
  readonly name: string
  readonly age: number
  readonly address: Address | undefined
}

interface Company {
  readonly id: string | null
  readonly name: string
  readonly employees: Person[]
}

const isValidUuidString = ChainValidator.of(hasTypeString).and(isValidUuid).validator

const isValidAddress = ChainValidator.of(hasTypeObject).and(
  CompositeValidator.of<Address>()
    .add("street", isValidStringBetween({ maxValue: 10 }))
    .add("city", isValidStringBetween({ minValue: 1 })).exactValidator
).validator

const isValidPerson = ChainValidator.of(hasTypeObject).and(
  CompositeValidator.of<Person>()
    .add("id", isValidValueOrNull(isValidUuidString))
    .add("name", isValidStringBetween({ minValue: 3, maxValue: 10 }))
    .add("age", isValidNumberBetween({ minValue: 18, maxValue: 200 }))
    .add("address", isValidOptionalValue(isValidAddress)).exactValidator
).validator

const isValidPersonArray = ChainValidator.of(hasTypeArray).and(isValidArrayOf(isValidPerson)).validator

const isValidCompany = ChainValidator.of(hasTypeObject).and(
  CompositeValidator.of<Company>()
    .add("id", isValidUuidString)
    .add("name", isValidStringBetween({ minValue: 3, maxValue: 10 }))
    .add("employees", isValidPersonArray).exactValidator
).validator

const validAddress: Address = {
  street: "street",
  city: "city",
}

const validPersonAlice: Person = {
  id: "35db1d4d-547e-47ac-a453-239214335830",
  name: "Alice",
  age: 42,
  address: validAddress,
}

const validPersonBob: Person = {
  id: null,
  name: "Bob",
  age: 23,
  address: validAddress,
}

const validPersonCarl: Person = {
  id: "addf7d50-6007-429c-afdb-8972e560fc77",
  name: "Carl",
  age: 18,
  address: undefined,
}

const validCompany: Company = {
  id: "39683634-dbbd-4787-977d-60f32380a57d",
  name: "Valid Cast",
  employees: [validPersonAlice, validPersonBob, validPersonCarl],
}

describe("End to end", () => {
  it("should return address for valid input", () => {
    const input: unknown = validAddress
    const result: Address = Validation.validate(input, isValidAddress).getValue()
    expect(result).toStrictEqual(validAddress)
  })

  it.each([validPersonAlice, validPersonBob, validPersonCarl])("should return person for $name", (input: unknown) => {
    const result: Person = Validation.validate(input, isValidPerson).getValue()
    expect(result).toStrictEqual(input)
  })

  it("should return company for valid input", () => {
    const input: unknown = validCompany
    const result: Company = Validation.validate(input, isValidCompany).getValue()
    expect(result).toStrictEqual(validCompany)
  })

  it("should return company for valid json string", () => {
    const isValidCompanyJson = ChainValidator.of(isValidJson).and(isValidCompany).validator
    const input: string = JSON.stringify(validCompany)
    const result: Company = Validation.validate(input, isValidCompanyJson).getValue()
    expect(result).toStrictEqual(validCompany)
  })
})
