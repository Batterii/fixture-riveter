# Relations
Just as databases can define relationships between tables, so can we define
relationships between fixtures. In Objection.js, these are called "Relations"; in Rails,
they're called "Associations". Here, we call them **Relations**.

Regardless of how it's defined, the relation doesn't change what happens when the given
fixture generates a new instance: the related fixture is generated with the given
strategy (by default, the same strategy as the initial instance), and then is set on the
property.

Then, relating the two instances beyond setting the property (for example, setting
`postId`) will use the `relate` function in the chosen adapter, allowing for each ORM
to bind the two instances as they need. This removes the need to define `postId` foreign
key attributes in fixtures.


## Fixture name matches attribute
When defining a relation, if the attribute's name is the same as the related fixture, it
can be defined implicitly like a normal attribute or explicitly with the `relate`
function:

```typescript
fr.fixture("user", User, (f) => {
    f.attr("post");
    // or
    f.post();
    // or
    f.relation("post");
    // or
    f.attr("post", async(e) => e.relation("post"));
});
```

## Fixture name doesn't match attribute
If, however, the related fixture does not match the attribute, you need to specify the
fixture explicitly:

```typescript
fr.fixture("user", User, (f) => {
    f.relation("post", {fixture: "blog"});
    // or same as above but changing the relation name to match other fixture
    f.attr("post", async(e) => e.relation("blog"));
    // or
    f.post(async(e) => e.relation("blog"));
});
```

## Overriding attributes
Just like overriding attributes when calling a strategy method, you can pass in an
object of attributes to set on the related fixture.

```typescript
fr.fixture("user", User, (f) => {
    f.attr("post", {title: "New post"});
    // or
    f.post({title: "New post"});
    // or
    f.relation("post", {title: "New post"});
    // or
    f.attr("name", () => "Noah");
    f.attr("post", async(e) => e.relation("post", {title: await e.attr("name")}));
});
```

