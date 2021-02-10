---
sidebar: auto
---

# Exports

`fixture-riveter` exposes a number of classes and an instance of the primary class `FixtureRiveter` for easy consumption. Each of these exports is discussed below.

```typescript
import {
	// primary export
	fr,
	FixtureRiveter,

	// ORM adapters
	Adapter,
	DefaultAdapter,
	ObjectionAdapter,
	SequelizeAdapter,

	// object creation strategies
	Strategy,
	AttributesForStrategy,
	BuildStrategy,
	CreateStrategy,
} from "fixture-riveter";
```

## `fr` and `FixtureRiveter`

The primary method for consuming the library. (The `FixtureRiveter` constructor is exposed as well, in case you need to instantiate it yourself). The functionality is discussed further in [fr api](./fr/README.md).

### Relative links

[in parent directory](../README.md)

[in same directory](./adapter.md)

[in child directory](./exports/README.md)

[in adjacent directory](../guide/README.md)

### Absolute links

[in parent directory](/fixture-riveter/api/README.md)

[in same directory](/fixture-riveter/api/adapter.md)

[in child directory](/fixture-riveter/api/exports/README.md)

[in adjacent directory](/fixture-riveter/api/guide/README.md)
