# Glossary

## Instance

Instead of fumbling with awkward phrasing like "currently constructed object" or "building a fixture", the word "instance" will be used when referring to the object that is being constructed or has been constructed from a given fixture's definition. The phrases "building an instance" or "building an instance of a/the fixture" will also be used when referring to the process of constructing an object from a given fixture's definition. The word "build" overlaps with the default [Strategy] method `build`, but its use in these phrases is deliberately Strategy-agnostic.

[Strategy]: ../api/strategy.md

::: danger TODO
Add examples and stuff to clarify
:::

## Scope

Nested fixtures and traits can define a given attribute multiple times. The order they are applied (the precedence) is determined by [dynamic scope]: For a given fixture, the list of attributes to assign to the [instance] is determined by walking up the hierarchy of parent fixtures, gathering each defined attribute. When traits are referenced in a definition, they are fully resolved (traits referencing traits will be walked until a given trait doesn't reference any others), and the resulting set of attributes is treated as if they were inlined. Traits passed in as arguments (when calling a Strategy method on `fr`) are treated the same way, except they are considered to be inline with the innermost fixture definition. All attribute overrides passed in when calling a Strategy method are considered to be inline with the innermost fixture definition as well. Once the full list is gathered, only the innermost defined definition for each attribute is used.

[dynamic scope]: https://en.wikipedia.org/wiki/Scope_(computer_science)#Dynamic_scope
[instance]: #instance

This same process is used when gathering hooks, except all hooks are run instead of only the latest.

### Precedence

Higher means will be selected/run first if it exists:

* Attribute overrides
* Trait argument list
* Inline definitions
* Inline trait references
* Parent/nesting fixture definitions
* Parent/nesting fixture trait references
* Global trait references

An example:

::: danger TODO
Figure out a good example here. Lots of examples in the tests but those are opaque.
:::
