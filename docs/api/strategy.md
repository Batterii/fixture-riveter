---
sidebar: auto
title: Strategy
---

# `Strategy`

Strategies are the way for `fixture-riveter` to modularize creation and relation in creating instances of fixture definitions. The interface is small, making subclassing easy.

##### Example

```typescript
import {fr, Strategy, Assembler} from "fixture-riveter";

class JsonStrategy extends Strategy {
    // This strategy takes the created instance and turns it into a json string
    async result<T>(assembler: Assembler<T>): Promise<string> {
        const instance = await assembler.toInstance();
        return JSON.stringify(instance);
    }
}

fr.registerStrategy("json", JsonStrategy);
```

## Instance properties

### name

String name of this strategy. Used to find the strategy when calling `fr.run`.

### adapter

Instance of the specified [Adapter](./adapter.md) (per-fixture or global).

### fixture-riveter

The currently-running instance. Useful when using `relate` (see below).

## Methods

None of the methods on a `Strategy` will be exposed to the uesr; they are called internally in the generation of a given fixture. Because each `Strategy` can perform wildly different operations, each method will be described at a high level. Then, the 3 provided `Strategies` will be detailed.

### result()

Handles calling the "object creation" methods given by the [Assembler](./assembler.md), awaiting callbacks as necessary. Accepts the Model class function as well, in case

##### Arguments

| Argument  | Type                        | Description                      | Optional? |
|-----------|-----------------------------|----------------------------------|-----------|
| assembler | [Assembler](./assembler.md) | Assembler instance               | Required  |
| Model     | Class function              | The class function (constructor) | Optional  |

##### Return value

| Type             | Description                                   |
|------------------|-----------------------------------------------|
| Promise\<any\> | Object to be returned directly to the caller. |

### relation()

When a fixture defines a relationship to another fixture, this method is called to perform the creation of the related object.

##### Arguments

| Argument           | Type                                                                           | Description                                        | Optional? |
|--------------------|--------------------------------------------------------------------------------|----------------------------------------------------|-----------|
| fixtureName        | string                                                                         | Fixture name of relation                           | Required  |
| traitsAndOverrides | [string[]] <br> [Record\<string, any\>] <br> [string[], Record\<string, any\>] | A list of traits and/or overrides for the relation | Optional  |

##### Return value

| Type           | Description                                       |
|----------------|---------------------------------------------------|
| Promise\<any\> | Object to be set on the current fixture instance. |

## Default `Strategies`

### `build`

#### result()

Creates an instance of the fixture's model, assigns attributes, and then performs the "afterBuild" callback.

#### relation()

Calls `fr.run` with the "build" strategy, returning just the instance of the related fixture.

### `create`

#### result()

Creates an instance of the fixture's model and assigns attributes. Performs the "afterBuild" and "beforeCreate" callbacks. Calls the adapter's `save` method (detailed [here](./adapter.md)), and then performs the "afterCreate" callbacks.

#### relation()

Calls `fr.run` with the "create" strategy, returning the saved instance of the related fixture.

### `attributesFor`

#### result()

Assigns the fixture's attributes to a plain javacsript object.

#### relation()

Calls `fr.run` with the "null" strategy, returning `undefined`.

::: danger TODO
Look into whether we even need a null strategy?
:::
