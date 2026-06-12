import tseslint from 'typescript-eslint';
import eslintConfigPrettier from 'eslint-config-prettier';

export default tseslint.config(
  // Use TypeScript recommended rules
  ...tseslint.configs.recommended,
  
  // Disable formatting rules that conflict with Prettier
  eslintConfigPrettier,

  // Global Ignores
  {
    ignores: [
      'dist/**',
      'node_modules/**',
      'src/generated/prisma/**',
    ],
  },

  // Custom Rules Configuration
  {
    rules: {
      '@typescript-eslint/no-unused-vars': ['warn', { argsIgnorePattern: '^_' }],
      '@typescript-eslint/no-explicit-any': 'warn',
      'no-console': 'off',
    },
  }
);
