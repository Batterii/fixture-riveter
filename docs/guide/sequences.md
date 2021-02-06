# Sequences
Sequences are wrappers around [Generators][generator], useful in providing "unique" values for attributes (such as email addresses). They can directly as attributes in fixtures or globally on the `fr` object itself.

[generator]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Generator

## Defining sequences
Global sequences are defined on the `fr` object, just like fixtures and traits.

```typescript
fr.sequence("dayNumber");

fr.generate("dayNumber");
// 1
fr.generate("dayNumber");
// 2
```

Attribute sequences are defined on fixtures, like other attributes.

```typescript
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

## Sequence options
Sequences can be given initial values, either a number (as seen above) or a string:

```typescript
fr.sequence("email", "Hello");
fr.generate("email");
// Hello
fr.generate("email");
// Hellp
```

Instead of a number or string, a generator function can be passed in:

```typescript
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

If the desired generator function takes arguments, it must be passed in wrapped in a function:

```typescript
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

Global sequences can be given aliases, just like fixtures. The aliases point to the same generator, so they increment together:

```typescript
fr.sequence("plus2", ["double", "increaser"])
fr.generate("plus2");
// 1
fr.generate("double");
// 2
fr.generate("increaser");
// 3
```

Sequences can take a callback, which is where their true power lies:

```typescript
fr.sequence("email", (x) => `test${x}@domain.com`);
fr.generate("email");
// test1@domain.com
fr.generate("email");
// test2@domain.com
```

**NOTE**: Options must be ordered: initial value or generator, aliases, callback.

All sequences can be reset to their initial value, using the global `fr.resetSequences`:

```typescript
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

