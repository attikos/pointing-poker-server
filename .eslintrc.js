module.exports = {
    root: true,
    extends: [
        'airbnb-base',
        'plugin:import/errors',
        'plugin:import/warnings',
    ],
    plugins: ['prettier', 'import'],
    env: {
        commonjs: true,
        es2021: true,
        node: true,
        es6: true,
        es2020: true,
    },
    globals: {
        use: true,
        Exception: true,
    },
    parserOptions: {
        ecmaVersion: 12,
        sourceType: 'module',
        allowImportExportEverywhere: true,
    },
    rules: {
        camelcase: 0,
        indent: ['error', 4],
        'no-plusplus': 0,
        'no-param-reassign': 0,
        'prefer-const': 0,
        'class-methods-use-this': 0,
    },
    settings: {
        ecmascript: 6,
        'import/resolver': {
            node: {
                extensions: ['.js'],
                moduleDirectory: ['node_modules', 'app/', 'utils/'],
            },
        },
    },
};
