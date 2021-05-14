---
title: Tutorial
---

This section will help you set up a single fixture, load it, and use it in a test.

## 1. Installation

In these docs, we'll assume `npm`, but `yarn` works just as well.

:::: code-group
::: code-group-item NPM

```bash
npm install -D fixture-riveter
```

:::
::: code-group-item YARN

```bash
yarn add -D fixture-riveter
```

:::
::::

## 2. Create a fixture

Create a new folder, probably in your test folder, to hold the fixtures you define. Best practices is to make a separate fixture definition file for each model you'll need.

```bash
mkdir test/fixtures
```

In a file in that directory, import the model class you wish to create a fixture for and the `fr` instance from `fixture-riveter`. In the below example, we include an example model class for demonstration purposes.

:::: code-group
::: code-group-item Typescript

```typescript
// in lib/models/user.ts
class User {
    id: number;
    name: string;
    age: number;
    email: string;
}

// in test/fixtures/user.ts
import {fr} from "fixture-riveter";
import {User} from "../../lib/models/user";

fr.fixture("user", User, (f) => {
    f.attr("name", () => "Noah");
    f.attr("age", () => 32);
    f.sequence("email", (n) => `test${n}@foo.bar`);
});
```

:::
::: code-group-item Javascript

```javascript
// in lib/models/user.js
class User {}

// in test/fixtures/user.js
const fr = require("fixture-riveter").fr;
const User = require("../../lib/models/user").User;

fr.fixture("user", User, (f) => {
    f.attr("name", () => "Noah");
    f.attr("age", () => 32);
    f.sequence("email", (n) => `test${n}@foo.bar`);
});
```

:::
::::

## 3. Load fixture definitions

There are two options for loading fixtures:

1) Manually import each fixture definition file individually
2) Use the built-in async method `loadFixtures` to load every fixture in a given directory.

For the purposes of this tutorial, we'll assume you know how to manually import files. Because of how `fixture-riveter` is built, nothing needs to be done with the imported file, the very act of loading it loads the defined fixture.

To use the built-in method, import `fr` and call the method asynchronously, either in a jest/mocha/similar `before` block (so that happens before running any tests), or with a `.then` callback to handle the Promise. In either case, use a relative path from your project root, aka where you run `npm test`.

:::: code-group
::: code-group-item Typescript

```typescript
import {fr} from "fixture-riveter";

before(async function() {
    await fr.loadFixtures("test/fixtures");
});
```

:::
::: code-group-item Javascript

```javascript
const fr = require("fixture-riveter").fr;

before(async function() {
    await fr.loadFixtures("test/fixtures");
});
```

:::
::::

## 4. Using a fixture

Create a new test file in your test directory, adjacent other tests. Import `fr` from `fixture-riveter`, and in an async test, call the `build` method to generate an instance of the model that has not been saved to the database. The code below uses the testing library `mocha` and the assertion library `chai`, but any testing and assertion libraries will do.

:::: code-group
::: code-group-item Typescript

```typescript
import {fr} from "fixture-riveter";
import {it} from "mocha";
import {expect} from "chai";

it("builds an instance of the model", async function() {
    const user = await fr.build("user");

    expect(user.name).to.equal("Noah");
    expect(user.age).to.equal(32);
    expect(user.email).to.equal("test1@foo.bar");
});
```

:::
::: code-group-item Javascript

```javascript
const fr = require("fixture-riveter").fr;
const it = require("mocha").it;
const expect = require("chai").expect;

it("builds an instance of the model", async function() {
    const user = await fr.build("user");

    expect(user.name).to.equal("Noah");
    expect(user.age).to.equal(32);
    expect(user.email).to.equal("test1@foo.bar");
});
```

:::
::::

## Further usage

For more examples, please check the [Guide](/guide/). For a comprehensive tour of the internals, see the [API](/api/). For discussions of design decisions and differences from the libraries that inspired `fixture-riveter`, [Design Notes](/notes/).
