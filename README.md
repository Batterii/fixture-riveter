# fixture-riveter

[![GitHub license](https://img.shields.io/badge/license-MIT-blue.svg)][github license]
[![npm version](https://img.shields.io/npm/v/fixture-riveter)][npm version]
[![Mutation testing badge](https://img.shields.io/endpoint?style=flat&url=https%3A%2F%2Fbadge-api.stryker-mutator.io%2Fgithub.com%2FBatterii%2Ffixture-riveter%2Fmaster)][stryker]
![Test status](https://img.shields.io/github/workflow/status/Batterii/fixture-riveter/tests)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)][mapr]

[github license]: https://github.com/Batterii/fixture-riveter/blob/master/LICENSE
[npm version]: https://www.npmjs.com/package/fixture-riveter
[stryker]: https://dashboard.stryker-mutator.io/reports/github.com/Batterii/fixture-riveter/master
[mapr]: http://makeapullrequest.com

fixture-riveter is a fixtures replacement library based on thoughtbot's excellent ruby
library [factory_bot][factory_bot], with some ideas adapted from
[factory-girl][factory-girl], another javascript library inspired by factory_bot. It's
written in Typescript, is fully async, and implements nearly all of factory_bot's
features.

[factory_bot]: https://github.com/thoughtbot/factory_bot/
[factory-girl]: https://github.com/simonexmachina/factory-girl

It was built for a knex/objection.js codebase and thus the integration with that ORM is
the best. It has support for other ORMs through the use of adapters, but some of the
features don't work as well or at all with them.

## Installation

Node.js:

```bash
npm install --save-dev fixture-riveter
```

## Documentation

A complete guide to using fixture-riveter can be found in the [guide][guide]. For those
interested in code first, here is a simple demonstration:

[guide]: https://batterii.github.io/fixture-riveter

```typescript
import {fr, ObjectionAdapter} from "fixture-riveter";

fr.setAdapter(new ObjectionAdapter());

fr.fixture(User, (f) => {
    f.name(() => "Noah");
    f.age(() => 32);
    f.sequence("email", (n) => `test${n}@example.com`);
});

const user = await fr.create(User, {name: "Bogart"});

expect(user).to.be.an.instanceof(User);
expect(user.id).to.exist;
expect(user.name).to.equal("Bogart");
expect(user.age).to.equal(32);
expect(user.email).to.equal("test1@example.com");
```

## Contributing

As this is a very young library, there will be plenty of places it could be improved. No
PR is too small, no issue is too weird or out of bounds. Please adhere to our [Code of
Conduct][coc] when participating with this project.

[coc]: CODE_OF_CONDUCT.md

## License

Copyright © 2021 Noah Bogart and Batterii, distributed under the license in
[LICENSE](LICENSE).
