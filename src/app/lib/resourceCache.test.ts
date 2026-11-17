import assert from 'node:assert/strict';
import test from 'node:test';
import {
  businessResourceCacheKey,
  clearBusinessResourceCacheForTests,
  invalidateBusinessResourceCache,
  loadBusinessResource,
  readBusinessResourceCache,
} from './resourceCache.ts';

test.beforeEach(() => clearBusinessResourceCacheForTests());

test('reutiliza un recurso reciente sin repetir la consulta', async () => {
  const key = businessResourceCacheKey('assignment-1', '/business/dashboard');
  let calls = 0;
  const loader = async () => ({ visits: ++calls });

  const first = await loadBusinessResource(key, loader);
  const second = await loadBusinessResource(key, loader);

  assert.deepEqual(first, { visits: 1 });
  assert.deepEqual(second, { visits: 1 });
  assert.equal(calls, 1);
});

test('refresh forzado actualiza el valor guardado', async () => {
  const key = businessResourceCacheKey('assignment-1', '/business/programs');
  let calls = 0;
  const loader = async () => [++calls];

  await loadBusinessResource(key, loader);
  const refreshed = await loadBusinessResource(key, loader, true);

  assert.deepEqual(refreshed, [2]);
  assert.deepEqual(readBusinessResourceCache(key), [2]);
});

test('comparte una consulta en curso entre consumidores', async () => {
  const key = businessResourceCacheKey('assignment-1', '/business/promotions');
  let calls = 0;
  const loader = async () => {
    calls += 1;
    await Promise.resolve();
    return ['promotion'];
  };

  const [first, second] = await Promise.all([
    loadBusinessResource(key, loader),
    loadBusinessResource(key, loader),
  ]);

  assert.deepEqual(first, ['promotion']);
  assert.deepEqual(second, ['promotion']);
  assert.equal(calls, 1);
});

test('invalida solamente los recursos de la asignación modificada', async () => {
  const firstKey = businessResourceCacheKey('assignment-1', '/business/dashboard');
  const secondKey = businessResourceCacheKey('assignment-2', '/business/dashboard');
  await loadBusinessResource(firstKey, async () => 'first');
  await loadBusinessResource(secondKey, async () => 'second');

  invalidateBusinessResourceCache('assignment-1');

  assert.equal(readBusinessResourceCache(firstKey), undefined);
  assert.equal(readBusinessResourceCache(secondKey), 'second');
});
