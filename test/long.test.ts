import mongoose from 'mongoose';
import { describe, expect, it } from 'vitest';

import { registerLong } from '../src';

registerLong(mongoose);

const Model = mongoose.model(
    'LongTest',
    new mongoose.Schema({
        n: { type: (mongoose.Schema.Types as any).Long },
        list: [{ type: (mongoose.Schema.Types as any).Long }],
    }),
);

const L = (mongoose.Types as any).Long;

describe('registerLong', () => {
    it('casts numbers, numeric strings and Long values', () => {
        expect(new Model({ n: 5 }).n.toString()).toBe('5');
        expect(new Model({ n: '9007199254740993' }).n.toString()).toBe('9007199254740993');
        const long = L.fromNumber(42);
        expect(new Model({ n: long }).n.equals(long)).toBe(true);
    });

    it('keeps null/undefined and turns empty string into null', () => {
        expect(new Model({ n: null }).n).toBeNull();
        expect(new Model({}).n).toBeUndefined();
        expect(new Model({ n: '' }).n).toBeNull();
    });

    it('rejects values that cannot be cast', async () => {
        const err: any = await new Model({ n: [1, 2] }).validate().catch((e) => e);
        expect(err.errors.n).toBeDefined();
    });

    it('casts query operators', () => {
        const q = (filter: any) => Model.find(filter).cast(Model) as any;
        expect(q({ n: 5 }).n.toString()).toBe('5');
        expect(q({ n: { $gt: '10' } }).n.$gt.toString()).toBe('10');
        expect(q({ n: { $ne: 3 } }).n.$ne.toString()).toBe('3');
        expect(q({ n: { $in: [1, '2'] } }).n.$in.map(String)).toEqual(['1', '2']);
    });

    it('does not pollute the handlers shared with other schema types', () => {
        const base = (mongoose.SchemaType.prototype as any).$conditionalHandlers;
        expect(base.$lt).toBeUndefined();
    });

    it('serializes through BSON as int64', () => {
        const bson = mongoose.mongo.BSON.serialize(new Model({ n: 5 }).toObject());
        expect((mongoose.mongo.BSON.deserialize(bson, { promoteLongs: false }) as any).n._bsontype).toBe('Long');
    });
});
