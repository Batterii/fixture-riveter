# Intro

The guides listed in the sidebar are high-level overviews of the various use-cases and features of `fixture-riveter`, linking to the [API](/api/) docs where necessary to provide a full understanding.

::: tip NOTE
Because this library is written in Typescript and designed to be used in a Typescript codebase, all code in the guides will be in Typescript.
:::

As a brief overview, here is the example from the [tutorial](/tutorial/) with explanatory comments.

```typescript
import {fr, ObjectionAdapter} from "fixture-riveter";
import {User} from "./models/user";

// Each adapter can specify ORM-specific build, save, relate, and set functions.
// A given adapter can be set on a specific fixture as well, allowing for
// fixture-specific build and save functionality.
fr.setAdapter(new ObjectionAdapter());

// `fixture` defines a new fixture, and requires a name, the model class to build, and
// a function that takes a single argument (the fixture).
fr.fixture("user", User, (f) => {
    // Attributes can be defined explicitly with `attr`
    f.attr("name", () => "Noah");
    // or implicitly by calling the attribute name directly on the fixture
    f.age(() => 32);
    // There is support for sequences, which are integers by default and increment on
    // each usage
    f.sequence("email", (n) => `test${n}@example.com`);
});

// `create` inserts the built fixture into the database (calling the `save` function in
// the adapater), but you can use `build` to only create an instance of the model, or
// `attributesFor` to create a plain object.
// Any attribute can be overridden by passing in an object of the desired changes. These
// always take precedence over the attributes in the fixture definition.
const user = await fr.create("user", {name: "Bogart"});

user instanceof User;
// true
Number.isFinite(user.id);
// true
user.name === "Bogart";
// true
user.age === 32;
// true
usser.email === "test1@example.com";
// true
```
