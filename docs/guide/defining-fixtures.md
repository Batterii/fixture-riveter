# Defining fixtures
As seen above, each fixture has a name, a model class, and a function for defining the
attributes.

## Naming
When defining fixtures, you can explicitly pass in the fixture's name as a string:

```typescript
class User {}
fr.fixture("user", User, ...)
const user = await fr.build("user");
```

If your model class defines a static `tableName` property (because you're extending
[Objection.js][objection-js]'s Model, for example), you can pass in the model directly
and the model's static `tableName` property will be used:

[objection-js]: https://vincit.github.io/objection.js/

```typescript
class User {
    static tableName = "users";
}
fr.fixture(User, ...)
const user = await fr.build("users");
```

If you don't define the static `tableName` property, you can still use the class
directly; the class's `name` property will be used.

```typescript
class User {}
fr.fixture(User, ...);
const user = await fr.build("User");
```

::: warning
As seen, no modifications are performed on the derived class name, so the string must be
matched. Take care, as minifiers and transpilers can munge class names.
:::

## Attributes
When defining attributes, you can use the explicit function `attr`, which takes the
attribute name as the first argument:

```typescript
f.attr("title", () => "First post!")
```

You can also call your attribute as a method on the fixture, which will pass the method
name as the attribute to `attr`:

```typescript
f.title(() => "First post!")
```

Implicit calling is the same as explicit calling in all ways except for when an
attribute shares a name with one of the properties on the `DefinitionProxy` class. In
those cases, an explicit call to `attr` will work as hoped:

```typescript
f.attr("sequence", () => "12345")
```

The library was initially written to only support explicit definitions, but has since
gained implicit definition functionality. I will be using a mix of both throughout the
rest of the guide; neither is preferred, both are acceptable.

## Dependent attributes
Attributes can be defined with references to other attributes, even when they are
defined out of order:

```typescript
fr.fixture("user", User, (f) => {
    f.email(async(e) => {
        // Attributes can be referenced explicitly
        const firstName = await e.attr("firstName");
        // or implicitly, just like in a definition
        const lastName = await e.lastName();
        return `${firstName}-${lastName}@example.com`.toLowerCase();
    });
    f.firstName(() => "Noah");
    f.lastName(() => "Bogart");
});

const user = await fr.build("user");
user.email === "noah-bogart@example.com";
// > true
```

Note: referencing other attributes using the `evaluator` object must be async.

## Argument passing vs Context
Each definition function is called with the correct context, allowing for `this`-based
definitions. It is more verbose than single-character arguments (and eslint will
complain about an invalid use of `this`), but it simplifies having to track which
"level" of definition a given attribute is being defined within.

NOTE: this only works with "normal" function expressions, not arrow functions.

```typescript
fr.fixture("user", User, function() {
    this.firstName(() => "Noah");
    this.lastName(() => "Bogart");
    this.email(async function() {
        const firstName = await this.firstName();
        const lastName = await this.lastName();
        return `${firstName}-${lastName}@example.com`.toLowerCase();
    });
});
```

## Aliases
To make fixture reuse and specificity easier, fixtures can be defined with aliases:

```typescript
fr.fixture("post", Post, {aliases: ["twit", "comment"]}, (f) => {
    f.attr("title", () => "First post!");
    f.attr("body", () => "Thank you for reading.");
});

const comment = await fr.build("comment");
comment.title === "First post!";
// > true
```

This is different than aliases in attribute and trait definitions, as fixtures can also
accept other options (`parent` and `traits`).

## Transient attributes
Transient attributes are properties that exist on the model but are not persisted in the
database. They are quite helpful in defining a "variable" that is only used within
a fixture definition:

```typescript
fr.fixture("user", User, (f) => {
    f.transient((t) => {
        t.attr("cool", () => false);
    });

    f.attr("name", async(user) => {
        let cool = "";
        if (await user.attr("cool")) cool = '"The Coolest Dude"';
        return `Noah ${cool} Bogart`;
    });
});

const user = await fr.build("user", {cool: true});
user.name === 'Noah "The Coolest Dude" Bogart';
// > true
Reflect.has(user, "cool");
// > false
```

Transient attributes are available in callbacks as well (which will be discussed at
length later on). During a callback, the transient attribute is available on the second
argument, the evaluator:

```typescript
fr.fixture("user", User, (f) => {
    f.transient((t) => {
        t.cool(() => false);
    });

    f.name(() => "Noah Bogart");

    f.after("build", async(user, evaluator) => {
        let cool = "";
        if (await evaluator.cool()) cool = '"The Coolest Dude"';
        const [first, last] = user.name.split(" ");
        user.name = [first, cool, last].join(" ");
    });
});

const user = await fr.build("user", {cool: true});
user.name
// => 'Noah "The Coolest Dude" Bogart'
Reflect.has(user, "cool");
// => false
```

## Nested fixtures
By defining a fixture within a fixture, the child fixture will inherit and override any
declared attributes on the parent, all the way up the inheritance chain. Currently, the
child fixture's class must be specified as well, even when it's the same.

```typescript
fr.fixture("grandparentList", List, (f) => {
    f.entry1(() => "100");
    f.entry2(() => "200");

    f.fixture("parentList", List, (ff) => {
        ff.entry2(() => "20");
        ff.entry3(() => "30");

        ff.fixture("childList", List, (fff) => {
            fff.entry3(() => "3");
        });
    });
});

const list = await fr.build("childList");
list.entry1
// => 100
list.entry2
// => 20
list.entry3
// => 3
```

The parent fixture can be specified instead of nesting:

```typescript
fr.fixture("parentList", List, (f) => {
    f.attr("entry1", () => "10");
    f.attr("entry2", () => "20");
});

fr.fixture("childList", List, {parent: "parentList"}, (f) => {
    f.attr("entry2", () => "2");
    f.attr("entry3", () => "3");
});

const list = await fr.build("childList");
list.entry1
// => 10
list.entry2
// => 2
list.entry3
// => 3
```

