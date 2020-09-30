# Theia Tree Editor Dev Example

The example of how to build the Theia-based applications with the tree-editor-example.
Usually, it isn't necessary to manually build or execute this example
because this is done via npm scripts from the root of this repository.
However, if you want to tinker with the example yourself, see the following sections on building and running it.
Note that before building the browser or electron examples separately, the initial setup on the project's root level must have been executed.

## Running the browser example

    yarn rebuild:browser
    cd browser-app
    yarn start

Open http://localhost:3000 in the browser.

## Running the Electron example

    yarn rebuild:electron
    cd electron-app
    yarn start

## Developing with the browser example

Start watching of tree-editor-example.

    cd tree-editor-example
    yarn watch

Start watching of the browser example.

    yarn rebuild:browser
    cd browser-app
    yarn watch

Launch `Start Browser Backend` configuration from VS code.

Open http://localhost:3000 in the browser.

## Developing with the Electron example

Start watching of tree-editor-example.

    cd tree-editor-example
    yarn watch

Start watching of the electron example.

    yarn rebuild:electron
    cd electron-app
    yarn watch

Launch `Start Electron Backend` configuration from VS code.

## Typescript in VSCode does not find the theia-tree-editor in the example

Try restarting the Typescript server.

- bring up command palette: CTRL + SHIFT + P (or equivalent on Mac)
- Search for and execute command `TypeScript: Restart TS server`
