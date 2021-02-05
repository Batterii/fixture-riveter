# Using fixtures

A defined fixture can be instanced by calling one of the strategies (by default: `attributesFor`, `build`, `create`):

```typescript
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

Regardless of which strategy is used, the defined attributes can be overridden by passing in an object as the final argument:

```typescript
const post = await fr.build("post", {title: "The best post in the universe"});
post.title
// => "The best post in the universe"
```

As with fixture definitions, the fixture name can instead be the desired class, following the same logic as for definitions (static `tableName` or `name` property on the class):

```typescript
const post = await fr.build(Post);
```

These can be mixed, as long as care is taken to watch for class name munging and any differences between the given fixture name string and the name as set in the definition:

```typescript
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

## Changing build strategies of relations
By default, relations are build with the same strategy as their parent object:

```typescript
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

If you want to have all relations use the `create` strategy instead, you can set the global flag `fr.useParentStrategy` to false:

```typescript
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

If you want to specify the strategy used in a relation, use the `{strategy: build}` option in the attribute definition:

```typescript
fr.fixture("post", Post, ...);

fr.fixture("user", User, (f) => {
    f.relation("post", {strategy: "build"});
});
const user = await fr.create("user");
user.id === undefined;
// false
user.post.id === undefined;
// true
```
