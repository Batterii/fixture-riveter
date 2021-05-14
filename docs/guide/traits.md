# Traits

Traits are collections of attributes and transients that can be applied to a given fixture, during definition or at creation time. They can be defined globally or in a given fixture. If defined globally, any fixture may reference it, while if defined in a fixture, only that fixture and all child fixtures may reference it. (In other words, traits are lexically scoped.)

## Defining traits

Traits are defined just like fixtures, and can be referenced when creating fixtures or child fixtures with the `{traits: []}` option.

```typescript
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

## In fixture and trait definitions

Traits can be applied to a fixture inside of the definition, by referencing them like attributes or relations:

```typescript
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

::: tip NOTE
Fixtures and sequences are checked before traits are, so if you try to reference a trait that shares a name with a fixture or sequence, it will reference those instead.
:::

## Precedence

Traits follow the [scoping] rules, so if multiple traits would affect the same attribute, the last trait is used:

[dynamic scope]: ./glossary.md#scope

```typescript
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

## When building an instance

As shown above, traits can be passed into factories and child factories using the `{traits: []}` options, and they can be referenced in fixture and trait definitions.

They can also be used when building an instance of a fixture by passing in an array of trait names:

```typescript
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

```typescript
const savedClowns = await fr.createList("user", 3, ["clown"]);
savedClowns.length;
// 3
savedClowns[0].name;
// Pagliacci
```

## With relations

Traits can be passed to relations, just like when building instances:

```typescript
fr.fixture("user", User, (f) => {
    f.attr("name", () => "Noah");

    f.trait("clown", (t) => {
        t.attr("name", () => "Pagliacci");
    });
});

fr.fixture("post", Post, (f) => {
    f.relation("user", ["clown"]);
    // or
    f.relation("author", ["clown"], {fixture: "user"});
});

const post = await fr.create("post");
post.user.name
// Pagliacci
```
