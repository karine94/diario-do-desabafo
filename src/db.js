import Dexie from 'dexie';

export const db = new Dexie('DiarioDesabafoDB');

db.version(1).stores({
  entries: '++id, title, createdAt, theme'
});