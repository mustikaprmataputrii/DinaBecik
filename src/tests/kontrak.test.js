import { describe, expect, it } from 'vitest';
import { KONTRAK_ADAPTER } from '../data/kontrak.js';
import * as mockAdapter from '../data/mockAdapter.js';
import * as firebaseAdapter from '../data/firebaseAdapter.js';

describe('kontrak adapter data', () => {
  it('mendaftarkan 19 fungsi adapter', () => {
    expect(KONTRAK_ADAPTER).toHaveLength(19);
  });

  it.each([
    ['mockAdapter', mockAdapter],
    ['firebaseAdapter', firebaseAdapter],
  ])('%s mengekspor seluruh fungsi kontrak', (_nama, adapter) => {
    for (const namaFungsi of KONTRAK_ADAPTER) {
      expect(adapter[namaFungsi], `${namaFungsi} harus diekspor`).toEqual(expect.any(Function));
    }
  });
});
