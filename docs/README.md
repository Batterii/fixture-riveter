# fixture-riveter

fixture-riveter is a fixtures replacement library based on thoughtbot's excellent ruby library [factory_bot][factory_bot], with some ideas adapted from [factory-girl][factory-girl], another javascript library inspired by factory_bot. It's written in Typescript, is fully async, and implements nearly all of factory_bot's features.

[factory_bot]: https://github.com/thoughtbot/factory_bot/
[factory-girl]: https://github.com/simonexmachina/factory-girl

It was built for a knex/objection.js codebase and thus the integration with that ORM is the best. It has support for other ORMs through the use of adapters, but some of the features don't work as well or at all with them.

## Contributing

As this is a very young library, there will be plenty of places it could be improved. No PR is too small, no issue is too weird or out of bounds. Please adhere to our [Code of Conduct][coc] when participating with this project.

[coc]: CODE_OF_CONDUCT.md

## License

Copyright © 2020 Noah Bogart and Batterii, distributed under the license in [LICENSE](LICENSE).
