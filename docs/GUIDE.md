# fixture_riveter Guide

This guide will give you a high-level view of defining a fixture, and then describe
the different options and details available.

To give a brief overview, here is the example from the [README](../README.md) with
explanatory comments.

```javascript
import {fr, ObjectionAdapter} from "fixture-riveter";
import {User} from "./models/user";

// Each adapter can specify ORM-specific build, save, associate, and set functions.
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

## Defining fixtures
As seen above, each fixture has a name, a model class, and a function for defining the
attributes.

### Explicit vs Implicit naming
When defining fixtures, you can explicitly pass in the fixture's name as a string:

```javascript
fr.fixture("user", User, ...)
```

If your model class defines a static `tableName` property (because you're extending
[Objection.js][objection-js]'s Model, for example), you can pass in the model directly
and the model's static `tableName` property will be used:

[objection-js]: https://vincit.github.io/objection.js/

```javascript
class User {
    static tableName = "users";
}

fr.fixture(User, ...)

const user = await fr.build("users");
user instanceof User;
// true
```

If you don't define the static `tableName` property, you can still use the class
directly; the class's `name` property will be used. Take care, as minifiers and
transpilers can munge class names.

```javascript
class User {}

fr.fixture(User, (f) => {
    f.attr("name", () => "Noah");
});

const user = await fr.build("User");
user.name === "Noah";
// true
```

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

The library was initially written to only support explicit definitions, but has since
gained implicit definition functionality. I will be using a mix of both throughout the
rest of the guide; neither is preferred, both are acceptable.

### Dependent attributes
Attributes can be defined with references to other attributes, even when they are
defined out of order:

```javascript
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

Note: referencing other attributes using the `evaluator` object must be async. More
about the `evaluator` object below.

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

This is different than aliases in attribute and trait definitions, as fixtures can also
accept other options (`parent` and `traits`).

### Transient attributes
Transient attributes are properties that exist on the model but are not persisted in the
database. They are quite helpful in defining a "variable" that is only used within
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

### Nested fixtures
By defining a fixture within a fixture, the child fixture will inherit and override any
declared attributes on the parent, all the way up the inheritance chain. Currently, the
child fixture's class must be specified as well, even when it's the same.

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
A defined fixture can be instanced by calling one of the strategies (by default:
`attributesFor`, `build`, `create`):

```javascript
// This will create a plain javascript object with all of the defined attributes
const post = await fr.attributesFor("post");

// This will instantiate the class Post and assign all defined attributes onto it
const post = await fr.build("post");

// This will:
// * instantiate the class Post
// * assign all defined attributes as build does
// * then save the instance to the database, according to the `save`
//   function in the chosen adapter
const post = await fr.create("post");
```

Regardless of which strategy is used, the defined attributes can be overridden by
passing in an object as the final argument:

```javascript
const post = await fr.build("post", {title: "The best post in the universe"});
post.title
// => "The best post in the universe"
```

As with fixture definitions, the fixture name can instead be the desired class,
following the same logic as for definitions (static `tableName` or `name` property on
the class):

```javascript
const post = await fr.build(Post);
```

These can be mixed, as long as care is taken to watch for class name munging and any
differences between the given fixture name string and the name as set in the definition:

```javascript
class User {}

fr.fixture(User, ...);

const user = await fr.build("User"); // not "user"
user instanceof User
// true

class Post {
    static tableName = "posts";
}

fr.fixture("posts", Post, ...); // has to match tableName here

const post = await fr.build(Post); // to be matched here
post instanceof Post
// true
```

## Relations
Just as databases can define relationships between tables, so can we define
relationships between fixtures. In Objection.js, these are called "Relations"; in Rails,
they're called "Associations". Here, we call them Relations.

Regardless of how it's defined, the relation doesn't change what happens when the given
fixture generates a new instance: the related fixture is generated with the given
strategy (by default, the same strategy as the initial instance), and then is set on the
property.

Then, relating the two instances beyond setting the property (for example, setting
`postId`) will use the `associate` function in the chosen adapter, allowing for each ORM
to bind the two instances as they need. This removes the need to define `postId` foreign
key attributes in fixtures.


### Fixture name matches attribute
When defining a relation, if the attribute's name is the same as the related fixture, it
can be defined implicitly like a normal attribute or explicitly with the `associate`
function:

```javascript
fr.fixture("user", User, (f) => {
    f.attr("post");
    // or
    f.post();
    // or
    f.association("post");
    // or
    f.attr("post", async(e) => e.association("post"));
});
```

### Fixture name doesn't match attribute
If, however, the related fixture does not match the attribute, you need to specify the
fixture explicitly:

```javascript
fr.fixture("user", User, (f) => {
    f.association("post", {fixture: "blog"});
    // or same as above but changing the association name to match other fixture
    f.attr("post", async(e) => e.association("blog"));
    // or
    f.post(async(e) => e.association("blog"));
});
```

### Overriding attributes
Just like overriding attributes when calling a strategy method, you can pass in an
object of attributes to set on the related fixture.

```javascript
fr.fixture("user", User, (f) => {
    f.attr("post", {title: "New post"});
    // or
    f.post({title: "New post"});
    // or
    f.association("post", {title: "New post"});
    // or
    f.attr("name", () => "Noah");
    f.attr("post", async(e) => e.association("post", {title: await e.attr("name")}));
});
```

## Build strategies
By default, relations are build with the same strategy as their parent object:

```javascript
fr.fixture("post", Post, ...);

fr.fixture("user", User, (f) => {
    f.attr("post");
});

const user = await fr.build("user");
user.id === undefined;
// true
user.post.id === undefined;
// true

const savedUser = await fr.create("user");
savedUser.id === undefined;
// false
savedUser.post.id === undefined;
// false
```

If you want to have all relations use the `create` strategy instead, you can set the
global flag `fr.useParentStrategy` to false:

```javascript
fr.useParentStrategy = false;
fr.fixture("post", Post, ...);

fr.fixture("user", User, (f) => {
    f.attr("post");
});

const user = await fr.build("user");
user.id === undefined;
// true
user.post.id === undefined;
// false
```

If you want to specify the strategy used in a relation, use the `{strategy: build}`
option in the attribute definition:

```javascript
fr.fixture("post", Post, ...);

fr.fixture("user", User, (f) => {
    f.association("post", {strategy: "build"});
});
const user = await fr.create("user");
user.id === undefined;
// false
user.post.id === undefined;
// true
```

## Sequences
Sequences are wrappers around [Generators][generator], useful in providing "unique"
values for attributes (such as email addresses). They can directly as attributes in
fixtures or globally on the `fr` object itself.

[generator]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Generator

### Defining sequences
Global sequences are defined on the `fr` object, just like fixtures and traits.

```javascript
fr.sequence("dayNumber");

fr.generate("dayNumber");
// 1
fr.generate("dayNumber");
// 2
```

Attribute sequences are defined on fixtures, like other attributes.

```javascript
fr.fixture("user", User, (f) => {
    // Creates a new sequence on "user" on a new attribute "age"
    f.sequence("age");
    // Creates a new attribute "day", explicitly using the global sequence "dayNumber"
    f.attr("day", () => fr.generate("dayNumber"));
    // Creates a new attribute "dayNumber", implicitly using the global
    //sequence "dayNumber". Doesn't work if there is a fixture with the same name
    f.attr("dayNumber");
});

const user = await fr.build("user");
user.age;
// 1
user.day;
// 1
user.dayNumber;
// 2
```

`fr.generate` only works on global sequences. Global sequences must have unique names.

### Sequence options
Sequences can be given initial values, either a number (as seen above) or a string:

```javascript
fr.sequence("email", "Hello");
fr.generate("email");
// Hello
fr.generate("email");
// Hellp
```

Instead of a number or string, a generator function can be passed in:

```javascript
function* generator() {
    let i = 0;
    while (true) {
        yield i;
        i += 2;
    }
}

fr.sequence("plus2", generator);
fr.generate("plus2");
// 0
fr.generate("plus2");
// 2
```

If the desired generator function takes arguments, it must be passed in wrapped in a
function:

```javascript
function* generator(initial) {
    let i = initial;
    while (true) {
        yield i;
        i *= 2;
    }
}

fr.sequence("double", () => generator(3));
fr.generate("double");
// 3
fr.generate("double");
// 6
```

Global sequences can be given aliases, just like fixtures. The aliases point to the same
generator, so they increment together:

```javascript
fr.sequence("plus2", ["double", "increaser"])
fr.generate("plus2");
// 1
fr.generate("double");
// 2
fr.generate("increaser");
// 3
```

Sequences can take a callback, which is where their true power lies:

```javascript
fr.sequence("email", (x) => `test${x}@domain.com`);
fr.generate("email");
// test1@domain.com
fr.generate("email");
// test2@domain.com
```

**NOTE**: Options must be ordered: initial value or generator, aliases, callback.

All sequences can be reset to their initial value, using the global `fr.resetSequences`:

```javascript
fr.sequence("email", (x) => `test${x}@domain.com`);
fr.generate("email");
// test1@domain.com
fr.generate("email");
// test2@domain.com
fr.generate("email");
// test3@domain.com

fr.resetSequences();

fr.generate("email");
// test1@domain.com
```

## Traits
Traits are collections of attributes and transients that can be applied to a given
fixture, during definition or at creation time. They can be defined globally or in
a given fixture. If defined globally, any fixture may reference it, while if defined in
a fixture, only that fixture and all child fixtures may reference it. (In other words,
traits are lexically scoped.)

### Defining traits
Traits are defined just like fixtures, and can be referenced when creating fixtures or
child fixtures with the `{traits: []}` option.

```javascript
// global trait
fr.trait("old", (t) => {
    t.attr("age", () => 100);
});

fr.fixture("user", User, (f) => {
    f.attr("name", () => "Noah");
    f.attr("age", () => 32);
    f.attr("isAdmin", () => false);

    // fixture trait
    f.trait("admin", (t) => {
        t.attr("isAdmin", () => true);
    });

    f.fixture("adminUser", User, {traits: ["admin"]});
    f.fixture("oldUser", User, {traits: ["old"]});
    f.fixture("oldAdmin", User, {traits: ["admin", "old"]});
});

const user = await fr.build("oldAdmin");
user.isAdmin
// true
user.age
// 100
```

### Using traits
Traits can be applied to a fixture inside of the definition, by referencing them like
attributes or relations:

```javascript
fr.trait("old", (t) => {
    t.attr("age", () => 100);
});

fr.fixture("user", User, (f) => {
    f.attr("name", () => "Noah");

    // references the global trait
    f.attr("old");
});

const user = await fr.build("user");
user.age
// 100
```

Note: Fixtures and sequences are checked before traits are, so if you try to reference
a trait that shares a name with a fixture or sequence, it will reference those instead.

### Precedence

If multiple traits would affect the same attribute, the last trait is used:

```javascript
fr.fixture("user", User, (f) => {
    f.trait("old", (t) => {
        t.attr("age", () => 100);
        f.attr("favoriteColor", () => "black");
    });

    f.trait("young", (t) => {
        t.attr("age", () => 5);
        f.attr("favoriteColor", () => "red");
    });

    f.trait("faveBlue", (t) => {
        f.attr("favoriteColor", () => "blue");
    });

    f.fixture("youngUser", {traits: ["young", "faveBlue"]});
    f.fixture("oldUser", {traits: ["faveBlue", "old"]});
});

const youngUser = await fr.build("youngUser");
youngUser.age
// 5
youngUser.favoriteColor
// blue

const oldUser = await fr.build("oldUser");
oldUser.age
// 100
oldUser.favoriteColor
// black
```

### Using traits
As shown above, traits can be passed into factories and child factories using the
`{traits: []}` options, and they can be referenced in fixture and trait definitions.

They can also be used when constructing an instance of a fixture by passing in an array
of trait names:

```javascript
fr.fixture("user", User, (f) => {
    f.attr("name", () => "Noah");
    f.attr("age", () => 32);

    f.trait("old", (t) => {
        t.attr("age", () => 100);
    });

    f.trait("clown", (t) => {
        t.attr("name", () => "Pagliacci");
    });
});

const sillyNoah = await fr.build("user", ["old", "clown"]);
sillyNoah.name;
// Pagliacci
sillyNoah.age;
// 100
```

This works with all strategies, including all `Pair` and `List` variations:

```javascript
const savedClowns = await fr.createList("user", 3, ["clown"]);
savedClowns.length;
// 3
savedClowns[0].name;
// Pagliacci
```

### With relations

Traits can be passed to relations, just like when creating instances:

```javascript
fr.fixture("user", User, (f) => {
    f.attr("name", () => "Noah");

    f.trait("clown", (t) => {
        t.attr("name", () => "Pagliacci");
    });
});

fr.fixture("post", Post, (f) => {
    f.association("user", ["clown"]);
    // or
    f.association("author", ["clown"], {fixture: "user"});
});

const post = await fr.create("post");
post.user.name
// Pagliacci
```
