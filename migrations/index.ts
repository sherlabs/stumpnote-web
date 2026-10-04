import * as migration_20261004_040010_initial from './20261004_040010_initial';
import * as migration_20261004_044616_pages_blocks from './20261004_044616_pages_blocks';

export const migrations = [
  {
    up: migration_20261004_040010_initial.up,
    down: migration_20261004_040010_initial.down,
    name: '20261004_040010_initial',
  },
  {
    up: migration_20261004_044616_pages_blocks.up,
    down: migration_20261004_044616_pages_blocks.down,
    name: '20261004_044616_pages_blocks'
  },
];
