import type { Mongoose, SchemaType } from 'mongoose';

/**
 * Registers `mongoose.Schema.Types.Long` (cast to a BSON `Long`) and `mongoose.Types.Long`.
 * Port of mongoose-long (https://github.com/aheckmann/mongoose-long).
 */
export function registerLong(mongoose: Mongoose): typeof SchemaType {
    const { Schema, Types, mongo } = mongoose;
    const MongoLong = mongo.Long;

    class Long extends mongoose.SchemaType {
        constructor(key: string, options?: any) {
            super(key, options);
        }

        checkRequired(val: any): boolean {
            return val != null;
        }

        cast(val: any): any {
            if (val === null || val === undefined) return val;
            if (val === '') return null;

            if (val instanceof MongoLong) return val;

            if (val instanceof Number || typeof val === 'number') return MongoLong.fromNumber(Number(val));

            if (!Array.isArray(val) && val.toString) return MongoLong.fromString(val.toString());

            throw new (mongoose.SchemaType as any).CastError('Long', val, (this as any).path);
        }

        castForQuery(...args: any[]): any {
            const [$conditional, value] = args;
            // mongoose >= 7 passes (conditional | null, value, context)
            if (args.length === 3 && $conditional == null) return this.cast(value);
            if (args.length >= 2) {
                const handler = (this as any).$conditionalHandlers[$conditional];
                if (!handler) throw new Error(`Can't use ${$conditional} with Long.`);
                return handler.call(this, value);
            }
            return this.cast($conditional);
        }
    }

    function handleSingle(this: any, val: any) {
        return this.cast(val);
    }

    function handleArray(this: any, val: any[]) {
        return val.map((m) => this.cast(m));
    }

    // own copy: mongoose-long mutated the handler map shared with every SchemaType
    (Long.prototype as any).$conditionalHandlers = {
        ...(mongoose.SchemaType.prototype as any).$conditionalHandlers,
        $lt: handleSingle,
        $lte: handleSingle,
        $gt: handleSingle,
        $gte: handleSingle,
        $ne: handleSingle,
        $in: handleArray,
        $nin: handleArray,
        $mod: handleArray,
        $all: handleArray,
        $bitsAnySet: handleArray,
        $bitsAllSet: handleArray,
    };

    (Schema.Types as any).Long = Long;
    (Types as any).Long = MongoLong;
    return Long as unknown as typeof SchemaType;
}
