import * as migration_20261004_040010_initial from './20261004_040010_initial'

export const migrations = [
  {
    up: migration_20261004_040010_initial.up,
    down: migration_20261004_040010_initial.down,
    name: '20261004_040010_initial',
  },
]
