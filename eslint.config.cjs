// eslint.config.cjs
const js = require('@eslint/js');
const globals = require('globals');
const pluginReact = require('eslint-plugin-react');
const pluginReactHooks = require('eslint-plugin-react-hooks');
const pluginA11y = require('eslint-plugin-jsx-a11y');
const pluginPrettier = require('eslint-plugin-prettier');

module.exports = [
  // 1) ignore dist & node_modules
  { ignores: ['dist/**', 'node_modules/**'] },

  // 2) main config
  {
    languageOptions: {
      // all parser options go here
      parserOptions: {
        ecmaVersion: 'latest',
        sourceType: 'module',
        ecmaFeatures: { jsx: true },
      },
      globals: {
        ...globals.browser,
        ...globals.node,
      },
    },
    plugins: {
      react: pluginReact,
      'react-hooks': pluginReactHooks,
      'jsx-a11y': pluginA11y,
      prettier: pluginPrettier,
    },
    settings: {
      react: { version: 'detect' },
    },
    rules: {
      // core JS rules
      ...js.configs.recommended.rules,

      // React + Hooks + a11y
      ...pluginReact.configs.recommended.rules,
      ...pluginReactHooks.configs.recommended.rules,
      ...pluginA11y.configs.recommended.rules,

      // Prettier-as-an-ESLint-rule
      'prettier/prettier': [
        'error',
        {
          singleQuote: true,
          printWidth: 80,
          trailingComma: 'all',
          tabWidth: 2,
          semi: true,
          endOfLine: 'auto',
        },
      ],

      // your overrides
      'react/react-in-jsx-scope': 'off',
    },
  },
];
