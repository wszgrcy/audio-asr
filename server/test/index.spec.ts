import { expect } from 'chai';
import { getDb, pool$$ } from './util/get-db';
import { Hello } from './util/schema/hello';
import { init } from './util/init';
describe('template', () => {
  beforeEach(async () => {
    await init();
  });
  afterEach(async () => {
    await pool$$().query(`DROP SCHEMA "public" CASCADE`);
    await pool$$().end();
  });
  it('hello', async () => {
    expect(true).eq(true);
    const db = getDb();
    let list = await db.select().from(Hello);
    expect(list.length).eq(0);
    await db.insert(Hello).values({ name: 'test' });
    list = await db.select().from(Hello);
    expect(list.length).eq(1);
  });
});
