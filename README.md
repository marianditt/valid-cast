# Valid Cast

![Tests](https://github.com/marianditt/valid-cast/actions/workflows/main-tests.yml/badge.svg)
[![codecov](https://codecov.io/gh/marianditt/valid-cast/branch/main/graph/badge.svg?token=CBX68X7ABK)](https://codecov.io/gh/marianditt/valid-cast)

_Valid Cast_ combines input validation with type casting. Developers are sometimes forced to make assumptions about the
input data type. Assumptions can be dangerous, because one can easily overlook corner cases. Input validation can help
to gain confidence about the data type as well as semantic correctness of the input value.

## Validating values

The entry point for validations is the static method `Validation.validate(value, validator)`,
where `value` is validated and `validator` is a primitive or composed validator.
The validate method creates a validation object, which provides two getters:

- `getValue()` - returns the validated value of the correct type,
- `getFindings()` - returns all reported findings by validators.

`getValue()` will throw a `ValidationError` if `getFindings()` does not return an empty array.
`getFindings()` always returns an empty array if `getValue()` returns a value.

## Validator composition

There are two classes of validators: primitive and composed.
Primitive validators basically take a value and return a result or throw a `ValidationError`.
Composed validators take one or more validators and compose them to one new validator.

### Primitive validators

Primitive validators are e.g., type validators like `hasTypeString`, `hasTypeArray`, `isValidJson`,
or value validators like `isGreaterThan`, or `isUndefined`.

#### Example - hasTypeString

```typescript
const input: unknown = "..." // or a value of another type.
try {
  const result: string = Validation.validate(input, hasTypeString).getValue()
} catch (error) {
  // Handle ValidationError.
}
```

Alternatively, one can always check for validation findings instead of catching errors.

```typescript
const input: unknown = "..." // or a value of another type.
const validation: Validation = Validation.validate(input, hasTypeString)
if (validation.getFindings().length > 0) {
  // Handle validation findings.
} else {
  const result: string = validation.getValue()
}
```

#### Example - isValidJson

Note that `isValidJson` expects an input value of type string and returns an object of unknown type.
_Valid Cast_ does not make assumptions about the object type,
but we now know that the string was valid json and can work with the parsed result.

```typescript
const input: string = "..." // or valid json.
try {
  const result: unknown = Validation.validate(input, isValidJson).getValue()
} catch (error) {
  // Handle ValidationError.
}
```

#### Example - isGreaterThan

Note that some primitive validators take arguments.
Strictly speaking, they are validator providers - functions that create validators.

```typescript
const input: number = 42
try {
  const result: number = Validation.validate(input, isGreaterThan(0)).getValue()
} catch (error) {
  // Handle ValidationError.
}
```

### Composed validators

Composite validators are used to build powerful validators from simpler building blocks.
Composite validators take validators and return a composed validator.
Composed validators can again be used in other composite validators.
Other than building more powerful validation rules,
composite validators can also cast to arbitrary complex result types.

#### Example - ChainValidator

Validations can be chained such that one value must pass multiple validation criteria.

```typescript
const isValidPercentage = ChainValidator.of(hasTypeNumber).and(isGreaterOrEqual(0)).and(isLessOrEqual(100)).validator
const input: unknown = 42
try {
  const result: number = Validation.validate(input, isValidPercentage).getValue()
  // Result is a number in [0, 100].
} catch (error) {
  // Handle ValidationError.
}
```

Some convenience validators exists. The percentage validator above e.g., is equivalent to:

```typescript
const isValidPercentage = isValidNumberBetween({minValue: 0, maxValue: 100})
```

#### Example - CompositeValidator

Validators can be composed to validate complex structures.
The input value is not only validated but also safely cast to desired type.
Note that the `CompositeValidator` takes the target type.
This type is used to assist when adding field validators.
The `CompositeValidator` makes sure that only fields of the provided type are used,
and that the field validators returns the correct type.

```typescript
interface Person {
  name: string
  address: Address
}

interface Address {
  street: string
  city: string
}

const isValidAddress = CompositeValidator.of<Address>()
  .add("street", hasTypeString)
  .add("city", hasTypeString).exactValidator // ensures that the input does not provide extra fields.

const isValidPerson = CompositeValidator.of<Person>()
  .add("name", hasTypeString)
  .add("address", isValidAddress).validator // extra fields are allowed but are not contained in the result.

const input = {} // or a valid person.
try {
  const result: Person = Validation.validate(input, isValidPerson).getValue()
} catch (error) {
  // Handle ValidationError.
}
```
