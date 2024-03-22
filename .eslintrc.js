/**
 * ESLint's configuration file for the project.
 * @module .eslintrc.js
 */

module.exports = {
  /**
   * Specifies the environments where the code is designed to run.
   * @property {boolean} browser - Allows browser global variables.
   * @property {boolean} es2021 - Allows ES2021 global variables.
   */
  env: {
    browser: true,
    es2021: true,
  },
  /**
   * Specifies the base configurations to extend.
   * @property {string} 'airbnb-base' - Airbnb's base JavaScript guide.
   * @property {string} 'plugin:angular/johnpapa' - John Papa's Angular style guide.
   */
  extends: [
    'airbnb-base',
    // Rules for AngularJS: https://github.com/EmmanuelDemey/eslint-plugin-angular?tab=readme-ov-file#rules
    'plugin:angular/johnpapa',
    'plugin:diff/diff', // comment out this line to run linter across all files
  ],
  /**
   * Specifies the parser options.
   * @property {string} ecmaVersion - Specifies the ECMAScript version to use.
   * @property {string} sourceType - Sets the source type to 'module' which allows the use of import and export statements.
   */
  parserOptions: {
    ecmaVersion: 'latest',
    sourceType: 'module',
  },
  /**
   * Specifies the plugins to use.
   */
  plugins: ['angular', 'prettier'],
  /**
   * Specifies global variables.
   * Variables are read-only by default.
   */
  globals: {
    _: 'readonly',
    moment: 'readonly',
    $: 'readonly',
    Highcharts: 'readonly',
    angular: 'readonly',
    reportDataSet: 'readonly',
    myApp: 'readonly',
  },
  /**
   * Specifies the rules to enforce.
   * Each rule can have a severity level (0 - off, 1 - warn, 2 - error) and additional configuration options.
   */
  rules: {
    'no-console': 'error',
    'func-names': 'off',
    'max-len': [
      'error',
      100,
      2,
      {
        ignoreUrls: true,
        ignoreStrings: true,
        ignoreTemplateLiterals: false,
        ignoreComments: true,
        ignoreRegExpLiterals: true,
        ignoreTrailingComments: true,
      },
    ],
    'no-else-return': 'error',
    'no-unneeded-ternary': 'error',
    'no-useless-return': 'error',
    'no-var': 'error',
    'one-var': ['error', 'never'],
    'prefer-arrow-callback': 'error',
    'prefer-const': 'error',
    'no-unused-vars': 'warn',
    yoda: [
      'error',
      'never',
      {
        exceptRange: true,
      },
    ],
    'angular/module-getter': 'off',
    'angular/function-type': 'off',
    'angular/controller-as': 'off',
    'angular/file-name': 'off', // We can enable this in the future
    'no-plusplus': 'off',
    complexity: ['error', 10],
    'max-nested-callbacks': ['error', 3],
    'max-lines-per-function': [
      'error',
      {
        // Exception - angular controllers at beginning, for them use:
        // eslint-disable-next-line max-lines-per-function, max-params
        max: 20,
        skipBlankLines: true,
        skipComments: true,
      },
    ],
    'max-depth': ['error', 3],
    'max-lines': [
      'warn',
      {
        max: 500,
        skipBlankLines: true,
        skipComments: true,
      },
    ],
    'max-params': ['error', 3],
    'no-magic-numbers': [
      'error',
      {
        ignore: [-1, 0, 1, 2, 3, 4, 5, 10], // Ignore common numbers
        detectObjects: false,
        enforceConst: true,
        ignoreArrayIndexes: true,
      },
    ],
  },
};
