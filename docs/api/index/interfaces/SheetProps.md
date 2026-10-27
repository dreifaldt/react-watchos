[**react-watchos API**](../../README.md)

***

[react-watchos API](../../README.md) / [index](../README.md) / SheetProps

# Interface: SheetProps

Defined in: [js/src/components.ts:706](https://github.com/emindeniz99/react-watchos/blob/main/js/src/components.ts#L706)

Modal sheet (SwiftUI `.sheet`; effectively full-screen on watchOS).
Controlled like <Alert>: present with `presented`, the user's swipe-down /
system dismissal fires `onChange(false)`. Children are the sheet content.

## Properties

### children?

> `optional` **children?**: `ReactNode`

Defined in: [js/src/components.ts:709](https://github.com/emindeniz99/react-watchos/blob/main/js/src/components.ts#L709)

***

### onChange?

> `optional` **onChange?**: (`presented`) => `void`

Defined in: [js/src/components.ts:708](https://github.com/emindeniz99/react-watchos/blob/main/js/src/components.ts#L708)

#### Parameters

##### presented

`boolean`

#### Returns

`void`

***

### presented?

> `optional` **presented?**: `boolean`

Defined in: [js/src/components.ts:707](https://github.com/emindeniz99/react-watchos/blob/main/js/src/components.ts#L707)
