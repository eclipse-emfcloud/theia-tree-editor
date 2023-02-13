# Eclipse EMF.cloud Theia Tree Editor ![build-status](https://img.shields.io/jenkins/build?jobUrl=https://ci.eclipse.org/emfcloud/job/eclipse-emfcloud/job/theia-tree-editor/job/master/)

[![License: EPL v2.0](https://img.shields.io/badge/License-EPL%20v2.0-yellow.svg)](https://www.eclipse.org/legal/epl-2.0/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

Dependencies:
[<img src="https://img.shields.io/badge/dynamic/json?color=blue&url=https://raw.githubusercontent.com/eclipse-emfcloud/theia-tree-editor/master/theia-tree-editor/package.json&query=$.peerDependencies%5B%27%40jsonforms%2Fcore%27%5D&label=JSONForms&logo=JSONForms" alt="JSONForms"/>](https://github.com/eclipsesource/jsonforms)
[<img src="https://img.shields.io/badge/dynamic/json?color=blue&url=https://raw.githubusercontent.com/eclipse-emfcloud/theia-tree-editor/master/theia-tree-editor/package.json&query=$.peerDependencies%5B%27%40theia%2Fcore%27%5D&label=Theia&logo=Theia" alt="Theia"/>](https://github.com/eclipse-theia/theia)

Theia tree editor provides a framework to build tree master detail editors
for editing model based data in Eclipse Theia.
An overview over the tree editor's features and customization capabilities can be found in this [blog post](https://eclipsesource.com/blogs/2021/02/03/how-to-build-a-tree-editor-in-eclipse-theia/).

The framework itself is located in [theia-tree-editor](./theia-tree-editor).
Documentation about the editor's components and how to set up a custom editor
can be found in the [documentation](./theia-tree-editor/DOCUMENTATION.MD).

[example](./example) contains a simple development example using the tree editor framework in a minimal Theia.

For more information, please visit the [EMF.cloud Website](https://www.eclipse.org/emfcloud/).
If you have questions, contact us on our [discussions page](https://github.com/eclipse-emfcloud/emfcloud/discussions)
and have a look at our [communication and support options](https://www.eclipse.org/emfcloud/contact/).

## Available via NPM ![build-status-server](https://img.shields.io/jenkins/build?jobUrl=https://ci.eclipse.org/emfcloud/job/deploy-theia-tree-editor-npm/&label=publish)

- _Snapshots:_ https://www.npmjs.com/package/@eclipse-emfcloud/theia-tree-editor

## Quick Start via Yeoman Generator

The simplest way to get started with building your own editor is to look at an example.
You can adapt the existing data model and learn how to customize the framework based on your specific requirements.

To get started, we provide a Yeoman generator that creates your own template project with a working example.
The template is integrated into the Theia extension generator.
To create the editor template project, install the extension generator and launch it:

```
npm install -g yo generator-theia-extension
mkdir my-extension && cd my-extension
yo theia-extension
```

For the extensions type, select “TreeEditor”

The template generator creates a tree editor based on an example data model. It also creates a Theia product that embeds the editor, so you can directly try it out with the following commands:

```
cd browser-app
yarn start
```

## Developer Setup

Install [nvm](https://github.com/creationix/nvm#install-script).

    curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.36.0/install.sh | bash

Install npm and node.

    nvm install 12.19.1
    nvm use 12.19.1

Install yarn.

    npm install -g yarn

Install dependencies and build framework and example

    yarn

## Running the Browser Example

    yarn example

or

    npm run example

The example Theia runs at [http://localhost:3000](http://localhost:3000).

## License

This program and the accompanying materials are made available under the
terms of the Eclipse Public License v. 2.0 which is available at
http://www.eclipse.org/legal/epl-2.0.

This Source Code may also be made available under the following Secondary
Licenses when the conditions for such availability set forth in the Eclipse
Public License v. 2.0 are satisfied: MIT.

SPDX-License-Identifier: EPL-2.0 OR MIT
