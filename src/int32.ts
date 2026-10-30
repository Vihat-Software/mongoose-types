import type { Mongoose, SchemaType } from 'mongoose';

const INT32_MAX = 0x7fffffff;
const INT32_MIN = -0x80000000;

/**
 * Registers `mongoose.Schema.Types.Int32`, replacing the native one: values are rounded, not rejected.
 * Port of mongoose-int32 (https://github.com/vkarpov15/mongoose-int32).
 */
export function registerInt32(mongoose: Mongoose): typeof SchemaType {
    class Int32 extends mongoose.SchemaType {
        static INT32_BSON_TYPE = 16;
        static INT32_MAX = INT32_MAX;
        static INT32_MIN = INT32_MIN;
        static instance = 'Int32';

        constructor(key: string, options?: any) {
            super(key, options, 'Int32');
        }

        cast(val: any): any {
            if (val == null) return val;

            let num = Number(val);
            if (isNaN(num)) throw new mongoose.Error(`${val} is not a number`);

            num = Math.round(num);
            if (num < INT32_MIN || num > INT32_MAX) {
                throw new mongoose.Error(
                    `${val} is outside of the range of valid BSON int32s: ${INT32_MAX} - ${INT32_MIN}`,
                );
            }
            return num;
        }
    }

    (Int32.prototype as any).$conditionalHandlers = (
        mongoose.Schema.Types.Number.prototype as any
    ).$conditionalHandlers;

    (mongoose.Schema.Types as any).Int32 = Int32;
    (mongoose as any).SchemaTypes.Int32 = Int32;
    return Int32 as unknown as typeof SchemaType;
}
