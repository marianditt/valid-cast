import { AbstractFinding, FindingCallback, ValidationFinding, Validator } from "../../lib/validator"

export interface PropertyValidationDetails<P, PF> {
  readonly propertyName: string
  readonly propertyValue: P
  readonly propertyFindings: PF[]
}

export interface PropertyValidationFinding<P, PF>
  extends ValidationFinding<"PropertyValidationFinding", PropertyValidationDetails<P, PF>> {}

export type PropertyProvider<V, P> = (value: V) => P

export function hasValidProperty<V, P, PF extends AbstractFinding>(
  propertyName: string,
  propertyProvider: PropertyProvider<V, P>,
  propertyValidator: Validator<P, unknown, PF>
): Validator<V, V, PropertyValidationFinding<P, PF>> {
  function validator(value: V, callback: FindingCallback<PropertyValidationFinding<P, PF>>): V {
    const findings: PF[] = []
    const property = propertyProvider(value)

    try {
      propertyValidator(property, (finding: PF) => findings.push(finding))
      if (findings.length > 0) {
        callback(createPropertyValidationFinding(propertyName, property, findings))
      }
    } catch {
      callback(createPropertyValidationFinding(propertyName, property, findings))
    }
    return value
  }

  return validator
}

function createPropertyValidationFinding<V, F>(name: string, value: V, findings: F[]): PropertyValidationFinding<V, F> {
  return {
    key: "PropertyValidationFinding",
    path: [],
    details: {
      propertyName: name,
      propertyValue: value,
      propertyFindings: findings,
    },
  }
}
