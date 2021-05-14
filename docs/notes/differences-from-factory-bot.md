# Differences from factory_bot

As noted in the README, the primary source of inspiration is [factory_bot][factory_bot]. After attempting to use many of the similar libraries that exist in the javascript world, I grew annoyed at the lack of features and robust internal design. I also didn't have much Typescript experience and viewed the chance to convert an existing library to TS would be a fantastic learning opportunity.

This library diverges from [factory_bot][factory_bot] in a couple major ways. First, [factory_bot][factory_bot] relies heavily on Ruby's metaprogramming capabilities, `instance_exec`, `method_missing`, and `define_method`. Second, Ruby (and Rails alongside it) are synchronous, which means that there is no consideration for awaiting calls to a database or performing assignments "out of order". And finally, [factory_bot][factory_bot] is tightly coupled with Rails' ideas about persistence (even tho it tries to be ORM agnostic).

The issue of metaprogramming is handled by a combination of approaches. The first is to pass in the fixture or evaluator wherever it's being used, instead of parsing implicit method calls. The second approach is to use `call` everywhere, making sure that the option of using full `function` statements instead of arrow functions keeps `this` correctly applied.

## Async

The issue of async I handled by biting the bullet and just making all appropriate calls async. Sadly, this makes using an attribute within another attribute _very_ verbose, which is unfortunate (as seen below), but none of the javascript ORMs are synchronous and it's not possible to avoid when a given attribute can reference an association. (I toyed with disallowing referencing associations, which would let all other attributes be synchronous, but that limits any complex async attributes from being defined.)

Example of referencing another attribute within an attribute in javascript:

```typescript
// explicit
f.attr("name", () => faker.name.firstName());
f.attr("email", async(e) => `${await e.attr("name")}@example.com`);

// or implicit
f.name(() => faker.name.firstName());
f.email(async(e) => `${await e.name()}@example.com`);
```

versus in ruby:

```ruby
name { Faker::Name.first_name }
email { "#{name}@example.com" }
```

To keep evaluation simple, I deliberately kept all async calls synchronous otherwise, meaning that for a given async call, the library waits until it is finished, instead of deferring and then calling `Promise.all` or similar after the end. This also keeps the code the cleanest, making attribute assignment readable and consistent with synchronous calls.

To tackle the issue of tight coupling, I took inspiration from the adapter system in simonexmachina's javascript library [factory-girl][factory_girl]. Each ORM can define and handle the core calls differently, and each fixture can use whichever is most appropriate. This frees up the need to implement [factory_bot][factory_bot]'s `to_create`, `skip_create`, or `initialize_with`. Instead, the user can define a new adapter (extending an existing adapter if necessary) and override any of the functions. This allows for keeping one's custom construction and persistence functions DRY.

[factory_bot]: https://github.com/thoughtbot/factory_bot/
[factory_girl]: https://github.com/simonexmachina/factory-girl
