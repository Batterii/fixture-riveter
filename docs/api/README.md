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

The primary method for consuming the library. (The `FixtureRiveter` constructor is exposed as well, in case you need to instantiate it yourself). A full description of the internals can be found in [fixture-riveter](./fr/README.md).

## `Adapter`

`Adapter` is the interface that `fixture-riveter` uses to interact with 1) a given fixture's class, and 2) the database (or ORM). It defines 5 methods that all subclasses must implement. A description of these methods, and instructions on writing your own, can be found in [Adapter](./adapter.md).

## `Strategy`

`Strategy` is the interface that `fixture-riveter` uses to turn fixture definitions into objects, whether it be Plain Old Javascript Objects or instances of a given class. A description of its methods, and instructions on writing one's own, can be found in [Strategy](./strategy.md).
