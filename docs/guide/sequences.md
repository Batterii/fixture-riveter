# Sequences
Sequences are wrappers around [Generators][generator], useful in providing unique values for attributes (such as email addresses). They can be defined directly as attributes in fixtures or globally on the `fr` object itself. By default, they generate numbers and start at 1.

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

## Resetting sequences
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

## Sequence options
### Initial value
Sequences can be given initial values, either a number or a string or an object with key `initial` that contains a number or a string:

```typescript
fr.sequence("counter", 3);
fr.generate("counter");
// 3
fr.generate("counter");
// 4

fr.sequence("greeting", "Hello");
fr.generate("greeting");
// Hello
fr.generate("greeting");
// Hellp

fr.sequence("age", {initial: 34});
fr.generate("age");
// 34
fr.generate("age");
// 35
```

**NOTE**: Behind the scenes, the initial value is used to select the appropriate pre-built generator. `{initial: "hello"}` is the same as `{gen: () => stringGen("hello")}`, and `{initial: 34}` is the same as `{gen: () => numberGen(34)}`.

### Generator function
Instead of a number or string, a generator function can be passed in, either by itself or in an object with the key `gen`:

```typescript
function *generator() {
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

fr.sequence("+2", {gen: generator});
fr.generate("+2");
// 0
fr.generate("+2");
// 2
```

If the desired generator function takes arguments, it must be passed in wrapped in a function:

```typescript
function *generator(initial) {
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

fr.sequence("double", {gen: () => generator(3)});
fr.generate("double");
// 3
fr.generate("double");
// 6
```
### Aliases
Global sequences can be given aliases, just like fixtures. The aliases point to the same generator, so they increment together:

```typescript
fr.sequence("plus2", {aliases: ["double", "increaser"]})
fr.generate("plus2");
// 1
fr.generate("double");
// 2
fr.generate("increaser");
// 3
```

### Callbacks
Sequences can take a callback, which is where their true power lies:

```typescript
fr.sequence("email", (x) => `test${x}@domain.com`);
fr.generate("email");
// test1@domain.com
fr.generate("email");
// test2@domain.com

fr.sequence("email2", {callback: (x) => `test${x}@domain.com`});
fr.generate("email2");
// test1@domain.com
fr.generate("email2");
// test2@domain.com
```

### Combining options
All of the options can be passed in as an object:

```typescript
fr.sequence("email", {initial: 100, aliases: ["super email"], callback: (x) => `test${x}@domain.com`});
fr.generate("super email");
// test100@domain.com
```

If the options aren't bundled in an object, they must be ordered: initial value or generator, aliases, callback:

```typescript
fr.sequence("email", 100, {aliases: ["super email"]}, (x) => `test${x}@domain.com`);
fr.generate("super email");
// test100@domain.com
```
