import { isValidUuid, StringErrorEnum } from "./string-validator"

const validInputs: string[] = [
  "00000000-0000-0000-0000-000000000000",
  "6b4be894-2b29-46d4-9257-1fb5e0deb094",
  "6b4be894-2b29-46d4-8000-000000000000",
  "6b4be894-2b29-46d4-8fff-ffffffffffff",
  "F1F069AA-2A39-414F-AA7E-C428F054EF90",
  "88202A4f-7d8C-4FE8-a57f-fb04457EE677",
]

const invalidInputs: string[] = [
  "",
  "11111111-1111-1111-1111-111111111111",
  "ffffffff-ffff-ffff-ffff-ffffffffffff",

  // too short
  "6b4be894-2b29-46d4-9257-1fb5e0deb09",
  "6b4be894-2b29-46d4-925-1fb5e0deb094",
  "6b4be894-2b29-46d-9257-1fb5e0deb094",
  "6b4be894-2b2-46d4-9257-1fb5e0deb094",
  "6b4be89-2b29-46d4-9257-1fb5e0deb094",

  // too long
  "6b4be894-2b29-46d4-9257-1fb5e0deb0940",
  "6b4be894-2b29-46d4-92570-1fb5e0deb094",
  "6b4be894-2b29-46d40-9257-1fb5e0deb094",
  "6b4be894-2b290-46d4-9257-1fb5e0deb094",
  "6b4be8940-2b29-46d4-9257-1fb5e0deb094",

  // wrong dashes
  "6b4be894-2b29-46d4-92571fb5e0deb094",
  "6b4be894-2b29-46d49257-1fb5e0deb094",
  "6b4be894-2b2946d4-9257-1fb5e0deb094",
  "6b4be8942b29-46d4-9257-1fb5e0deb094",
  "12345678123412341234123456789abc",

  // valid uuid with single invalid character
  "6b4be894-2b29-46d4-7000-000000000000",
  "6b4be894-2b29-46d4-8000-00000000000g",
]

describe("UuidValidator", () => {
  describe(`given valid uuid inputs`, () => {
    it.each(validInputs)("should return valid uuid for %p", (input) => {
      const mockCallback = jest.fn()
      const result = isValidUuid(input, mockCallback)
      expect(result).toBe(input)
      expect(mockCallback).toHaveBeenCalledTimes(0)
    })
  })

  describe(`given invalid uuid inputs`, () => {
    it.each(invalidInputs)("should return string with findings for %p", (input) => {
      const mockCallback = jest.fn()
      expect(isValidUuid(input, mockCallback)).toBe(input)
      expect(mockCallback).toHaveBeenCalledTimes(1)
      expect(mockCallback.mock.calls[0].length).toBe(1)
      expect(mockCallback.mock.calls[0][0]).toStrictEqual({
        key: "StringValidationFinding",
        path: [],
        details: { error: StringErrorEnum.INVALID_UUID },
      })
    })
  })
})
