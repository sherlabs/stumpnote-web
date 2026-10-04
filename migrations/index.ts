import * as migration_20261004_040010_initial from './20261004_040010_initial';
import * as migration_20261004_044616_pages_blocks from './20261004_044616_pages_blocks';
import * as migration_20261004_053012_s4_content_fields from './20261004_053012_s4_content_fields';
import * as migration_20261004_075044_s6_analytics_settings from './20261004_075044_s6_analytics_settings';

export const migrations = [
  {
    up: migration_20261004_040010_initial.up,
    down: migration_20261004_040010_initial.down,
    name: '20261004_040010_initial',
  },
  {
    up: migration_20261004_044616_pages_blocks.up,
    down: migration_20261004_044616_pages_blocks.down,
    name: '20261004_044616_pages_blocks',
  },
  {
    up: migration_20261004_053012_s4_content_fields.up,
    down: migration_20261004_053012_s4_content_fields.down,
    name: '20261004_053012_s4_content_fields',
  },
  {
    up: migration_20261004_075044_s6_analytics_settings.up,
    down: migration_20261004_075044_s6_analytics_settings.down,
    name: '20261004_075044_s6_analytics_settings'
  },
];
