# @vihat-software/mongoose-types

Mongoose schema types that Mongoose does not ship:

- **`Long`**: BSON int64, a maintained TypeScript port of [mongoose-long](https://github.com/aheckmann/mongoose-long).
- **`Int32`**: BSON int32 that rounds instead of rejecting fractions, a port of [mongoose-int32](https://github.com/vkarpov15/mongoose-int32).
  Mongoose 9 has a native `Int32`; this one replaces it so behaviour stays the same for existing schemas.

Works with `mongoose` `>=8 <10`.

## Usage

```ts
import mongoose from 'mongoose';
import { registerInt32, registerLong } from '@vihat-software/mongoose-types';

registerLong(mongoose); // adds mongoose.Schema.Types.Long and mongoose.Types.Long
registerInt32(mongoose); // adds mongoose.Schema.Types.Int32

export const TLong = mongoose.Schema.Types.Long;
export const TInt32 = mongoose.Schema.Types.Int32;
```

Call the `register*` functions once, before any schema using the types is defined.

## Differences from the originals

- `Long` registers its own `$conditionalHandlers` copy; mongoose-long mutated the map shared by every `SchemaType`.
- Written in TypeScript, shipped as CommonJS with typings. No runtime dependencies.

## Development

```bash
yarn install
yarn build
yarn test
```

## Releasing

```bash
npm version patch   # or minor / major; creates the vX.Y.Z tag
git push --follow-tags
```

The `Publish` workflow publishes to npm through trusted publishing. It needs a one-time setup on npmjs.com
(package settings, Trusted Publisher, GitHub Actions: org `Vihat-Software`, repo `mongoose-types`, workflow `publish.yml`).
The first publish of a new package has to be done manually (`npm publish`) so the package exists to configure.

## License

MIT (see `LICENSE`). Includes code derived from mongoose-long (MIT) and mongoose-int32 (Apache-2.0); see `NOTICE`.
