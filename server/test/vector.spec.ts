import { expect } from 'chai';
import {} from 'drizzle-kit';
import { getDb, pool$$ } from './util/get-db';
import { sql, cosineDistance, gt } from 'drizzle-orm';
import { VectorHello } from './util/schema/vector-hello';
import { init } from './util/init';

describe('vector', () => {
  beforeEach(async () => {
    await init();
  });
  afterEach(async () => {
    await pool$$().query(`DROP SCHEMA "public" CASCADE`);
    await pool$$().end();
  });
  it('hello', async () => {
    const db = getDb();
    await db.insert(VectorHello).values({
      title: 'item1',
      embedding: [1, 1, 1],
    });
    await db.insert(VectorHello).values({
      title: 'item1',
      embedding: [1, 1, 0],
    });
    const similarity = sql<number>`1 - (${cosineDistance(VectorHello.embedding, [1, 0, 0])})`;
    const similarGuides = await db
      .select()
      .from(VectorHello)
      .where(gt(similarity, 0.5));
    expect(similarGuides.length).gt(0);
  });
});
