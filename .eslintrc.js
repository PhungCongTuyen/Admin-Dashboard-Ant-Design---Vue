module.exports = {
    'env': {
        'browser': true,
        'es6': true
    },
    'extends': [
        'prettier',
        'plugin:vue/essential',
        'plugin:@typescript-eslint/eslint-recommended',
        "plugin:vue/vue3-essential",
        "eslint:recommended",
        "@vue/typescript"
    ],
    'globals': {
        'Atomics': 'readonly',
        'SharedArrayBuffer': 'readonly'
    },
    'parserOptions': {
        'ecmaVersion': 2018,
        'parser': '@typescript-eslint/parser',
        'sourceType': 'module'
    },
    'plugins': [
        'vue',
        '@typescript-eslint'
    ],
    'rules': {
        'indent': [
            'error',
            2
        ],
        'linebreak-style': [
            'error',
            'windows'
        ],
        'quotes': [
            'error',
            'double'
        ],
        'semi': [
            'error',
            'always'
        ],
        "vue/no-v-model-argument": "off"
    }
};