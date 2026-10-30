import mongoose from 'mongoose';
import { describe, expect, it } from 'vitest';

import { registerInt32 } from '../src';

registerInt32(mongoose);

const Model = mongoose.model('Int32Test', new mongoose.Schema({ n: { type: (mongoose.Schema.Types as any).Int32 } }));

describe('registerInt32', () => {
    it('casts and rounds', () => {
        expect(new Model({ n: '7' }).n).toBe(7);
        expect(new Model({ n: 7.6 }).n).toBe(8);
        expect(new Model({ n: null }).n).toBeNull();
    });

    it('rejects NaN and out-of-range values', async () => {
        const check = (n: any) =>
            new Model({ n }).validate().then(
                () => null,
                (e: any) => e,
            );
        expect((await check('abc'))?.errors.n).toBeDefined();
        expect((await check(2 ** 31))?.errors.n).toBeDefined();
        expect(await check(2 ** 31 - 1)).toBeNull();
    });

    it('casts query operators like Number', () => {
        const q = Model.find({ n: { $gte: '3' } }).cast(Model) as any;
        expect(q.n.$gte).toBe(3);
    });
});
