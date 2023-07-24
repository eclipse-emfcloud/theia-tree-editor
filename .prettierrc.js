module.exports = {
    trailingComma: 'none',
    printWidth: 140,
    tabWidth: 4,
    semi: true,
    singleQuote: true,
    arrowParens: 'avoid',
    overrides: [
        {
            files: '*.json',
            options: {
                tabWidth: 2
            }
        },
        {
            files: '*.md',
            options: {
                tabWidth: 2
            }
        }
    ]
};
