---
sidebar: auto
title: API
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

The primary method for consuming the library. (The `FixtureRiveter` constructor is exposed as well, in case you need to instantiate it yourself). The functionality is discussed further in [fr api](/api/fr/).

## `Adapter`

Instead of writing ORM-specific code for instancing and persisting created objects, we rely on this interface (and the following default implementation of it). This handles the two aforementioned aspects of `factory_bot`: creating an instance of a given model, and then persisting it to the database.
