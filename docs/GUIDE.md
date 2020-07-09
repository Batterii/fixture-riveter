# fixture_riveter Guide

This guide will give you a high-level view of defining a fixture, and then describe
the different options and details available.

To give a brief overview, here is the example from the [README](../README.md) with
explanatory comments.

```javascript
import {fr, ObjectionAdapter} from "fixture-riveter";
import {User} from "./models/user";

// Each adapter can specify ORM-specific build, save, associate, and set functions
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

expect(user).to.be.an.instanceof(User);
expect(user.id).to.exist;
expect(user.name).to.equal("Bogart");
expect(user.age).to.equal(32);
expect(user.email).to.equal("test1@example.com");
```

## Defining fixtures
As seen above, each fixture has a name, a model class, and a function for defining the
attributes.

### Explicit vs Implicit attributes
When defining attributes, you can use the explicit function `attr`, which takes the
attribute name as the first argument:

```javascript
f.attr("title", () => "First post!")
```

You can also call your attribute as a method on the fixture, which will pass the method
name as the attribute to `attr`:

```javascript
f.title(() => "First post!")
```

Implicit calling is the same as explicit calling in all ways except for when an
attribute shares a name with one of the properties on the `DefinitionProxy` class. In
those cases, an explicit call to `attr` will work as hoped:

```javascript
f.attr("sequence", () => "12345")
```

The library was initially written to only support explicit definitions, but at the last
minute gained implicit definition functionality. I will be using a mix of both
throughout the rest of the guide; neither is preferred, both are acceptable.

### Dependent attributes
Attributes can be defined with references to other attributes, even when they are
defined out of order:

```javascript
fr.fixture("user", User, (f) => {
    f.firstName(() => "Noah");
    f.email(async(e) => {
        // Attributes can be referenced explicitly
        const firstName = await e.attr("firstName");
        // or implicitly, just like in a definition
        const lastName = await e.lastName();
        return `${firstName}-${lastName}@example.com`.toLowerCase();
    });
    f.lastName(() => "Bogart");
});

const user = await fr.build("user");
user.email === "noah-bogart@example.com";
// > true
```

### Argument passing vs Context
Each definition function is called with the correct context, allowing for `this`-based
definitions. It is more verbose than single-character arguments (and eslint will
complain about an invalid use of `this`), but it simplifies having to track which
"level" of definition a given attribute is being defined within.

NOTE: this only works with "normal" function expressions, not arrow functions.

```javascript
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

### Aliases
To make fixture reuse and specificity easier, fixtures can be defined with aliases:

```javascript
fr.fixture("post", Post, {aliases: ["twit", "comment"]}, (f) => {
    f.attr("title", () => "First post!");
    f.attr("body", () => "Thank you for reading.");
});

const comment = await fr.build("comment");
comment.title === "First post!";
// > true
```

### Transient attributes
For those unaware, transient attributes are properties that exist on the model but are
not persisted in the database. They are quite helpful in defining a "variable" within
a fixture definition:

```javascript
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

```javascript
fr.fixture("user", User, (f) => {
    f.transient((t) => {
        t.attr("cool", () => false);
    });

    f.name(() => "Noah Bogart");

    f.after("build", async(user: any, evaluator: any) => {
        let cool = "";
        if (await evaluator.attr("cool")) cool = '"The Coolest Dude"';
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

### Nested fixtures
By defining a fixture within a fixture, the child fixture will inherit and override any
declared attributes on the parent, all the way up the inheritance chain.

```javascript
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

```javascript
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

## Using fixtures
A defined fixture can be instanced by calling one of the strategies (attributesFor,
build, create):

```javascript
// This will create a plain javascript object with all of the defined attributes
const post = await fr.attributesFor("post");

// This will instantiate the class Post and assign all defined attributes onto it
const post = await fr.build("post");

// This will instantiate the class Post, assign all defined attributes as build does,
// and then save the instance to the database, according to the `save` function in the
// chosen adapter
const post = await fr.create("post");
```

Regardless of which strategy is used, the defined attributes can be overridden by
passing in an object as the final argument:

```javascript
const post = await fr.build("post", {title: "The best post in the universe"});
post.title
// => "The best post in the universe"
```
