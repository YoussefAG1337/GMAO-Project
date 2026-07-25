import { describe, it, expect } from 'vitest';
import { buildListQuery, parseListParams, emptyPage } from '../pagination';

describe('buildListQuery', () => {
  it('serializes params and omits empty values', () => {
    expect(buildListQuery({ page: 2, limit: 10, statut: 'NOUVELLE' })).toBe(
      'page=2&limit=10&statut=NOUVELLE',
    );
  });

  it('drops undefined/empty entries', () => {
    expect(buildListQuery({ page: 1, statut: '', atelierId: undefined })).toBe('page=1');
  });

  it('returns an empty string for no params', () => {
    expect(buildListQuery()).toBe('');
  });
});

describe('parseListParams', () => {
  it('coerces page/limit to numbers and passes filters through as strings', () => {
    expect(parseListParams({ page: '3', limit: '25', statut: 'EN_COURS' })).toEqual({
      page: 3,
      limit: 25,
      statut: 'EN_COURS',
    });
  });

  it('drops empty values and non-numeric page/limit', () => {
    expect(parseListParams({ page: '', statut: undefined, priorite: 'HAUTE' })).toEqual({
      priorite: 'HAUTE',
    });
  });

  it('takes the first value when a param repeats (array)', () => {
    expect(parseListParams({ statut: ['NOUVELLE', 'EN_COURS'] })).toEqual({ statut: 'NOUVELLE' });
  });
});

describe('emptyPage', () => {
  it('returns a valid empty paginated envelope', () => {
    expect(emptyPage()).toEqual({ items: [], total: 0, page: 1, limit: 20, totalPages: 1 });
  });
});
