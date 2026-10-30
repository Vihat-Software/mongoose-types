import type * as mongodb from 'mongodb';
import type { SchemaType } from 'mongoose';

export { registerInt32 } from './int32';
export { registerLong } from './long';

declare module 'mongoose' {
    namespace Schema {
        namespace Types {
            class Long extends SchemaType {}
        }
    }

    namespace Types {
        class Long extends mongodb.Long {}
    }
}
