module.exports = {
  root: true,
  env: {
    commonjs: true,
    node: true,
    mocha: true,
  },
  extends: [
    'plugin:vue/essential'
  ],
  rules: {
    'max-len': [
      'error',
      {
        code: 300,
        ignoreUrls: true,
        ignoreTrailingComments: true,
      },
    ],
    'no-console': 'off',
    'default-param-last': 'off',
    'no-console': process.env.NODE_ENV === 'production' ? 'error' : 'off',
    'no-debugger': process.env.NODE_ENV === 'production' ? 'error' : 'off',
    'vue/multi-word-component-names': 'off'
  },
  parser: 'vue-eslint-parser'
};