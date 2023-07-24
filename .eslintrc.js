/** @type {import('eslint').Linter.Config} */
const year = new Date().getFullYear();
module.exports = {
    root: true,
    extends: ['./configs/base.eslintrc.json', './configs/warnings.eslintrc.json', './configs/errors.eslintrc.json','prettier'],
    ignorePatterns: ['**/{node_modules,lib}'],
    parserOptions: {
        tsconfigRootDir: __dirname,
        project: 'tsconfig.eslint.json'
    },
    overrides: [
        {
            files: ['*.spec.ts'],
            rules: {
                'no-unused-expressions': 0,
                'no-invalid-this': 0
            }
        },
        {
            files: ['*.ts', '*.tsx'],
            rules: {
                // eslint-plugin-header
                'header/header': [
                    2,
                    'block',
                    [
                        {
                            pattern: '[\n\r]+ \\* Copyright \\([cC]\\) \\d{4}(-\\d{4})? .*[\n\r]+',
                            template: `********************************************************************************
  * Copyright (c) ${year} EclipseSource and others.
  *
  * This program and the accompanying materials are made available under the
  * terms of the Eclipse Public License v. 2.0 which is available at
  * https://www.eclipse.org/legal/epl-2.0, or the MIT License which is
  * available at https://opensource.org/licenses/MIT.
  *
  * SPDX-License-Identifier: EPL-2.0 OR MIT
  ********************************************************************************`
                        }
                    ]
                ]
            }
        }
    ]
};
