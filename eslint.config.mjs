import { defineConfig, globalIgnores } from 'eslint/config'
import { tanstackConfig } from '@tanstack/eslint-config'
import convexPlugin from '@convex-dev/eslint-plugin'

export default defineConfig([
  ...tanstackConfig,
  ...convexPlugin.configs.recommended,
  globalIgnores([
    '**/convex/_generated/**',
    '**/routeTree.gen.ts',
    '**/dist/**',
    '**/.output/**',
    'apps/desktop/src-tauri/target/**',
  ]),
])
