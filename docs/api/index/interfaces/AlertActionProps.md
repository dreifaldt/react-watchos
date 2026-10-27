[**react-watchos API**](../../README.md)

***

[react-watchos API](../../README.md) / [index](../README.md) / AlertActionProps

# Interface: AlertActionProps

Defined in: [js/src/components.ts:666](https://github.com/emindeniz99/react-watchos/blob/main/js/src/components.ts#L666)

An action inside <Alert> / <ConfirmationDialog>. The system dismisses the
 presentation automatically when an action is tapped; `onPress` fires for
 the tapped action and the presentation's `onChange(false)` fires too.

## Extends

- `A11yProps`

## Properties

### accessibilityHidden?

> `optional` **accessibilityHidden?**: `boolean`

Defined in: [js/src/components.ts:100](https://github.com/emindeniz99/react-watchos/blob/main/js/src/components.ts#L100)

Hides this node and its whole subtree from VoiceOver (SwiftUI
`.accessibilityHidden(true)`, applied after label and hint, so it wins
over both). For purely decorative nodes such as a large quote mark or a
drop cap, which VoiceOver would otherwise read out as noise. Never set it
on anything interactive, or on a container holding interactive children:
a hidden control cannot be reached with VoiceOver at all.

#### Inherited from

`A11yProps.accessibilityHidden`

***

### accessibilityHint?

> `optional` **accessibilityHint?**: `string`

Defined in: [js/src/components.ts:91](https://github.com/emindeniz99/react-watchos/blob/main/js/src/components.ts#L91)

#### Inherited from

`A11yProps.accessibilityHint`

***

### accessibilityLabel?

> `optional` **accessibilityLabel?**: `string`

Defined in: [js/src/components.ts:90](https://github.com/emindeniz99/react-watchos/blob/main/js/src/components.ts#L90)

#### Inherited from

`A11yProps.accessibilityLabel`

***

### label

> **label**: `string`

Defined in: [js/src/components.ts:667](https://github.com/emindeniz99/react-watchos/blob/main/js/src/components.ts#L667)

***

### onPress?

> `optional` **onPress?**: () => `void`

Defined in: [js/src/components.ts:670](https://github.com/emindeniz99/react-watchos/blob/main/js/src/components.ts#L670)

#### Returns

`void`

***

### role?

> `optional` **role?**: `"destructive"` \| `"cancel"`

Defined in: [js/src/components.ts:669](https://github.com/emindeniz99/react-watchos/blob/main/js/src/components.ts#L669)

"destructive" renders red; "cancel" gets the cancel slot/placement.
