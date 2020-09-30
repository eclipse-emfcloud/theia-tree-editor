This package provides a framework for the creation of tree master detail editors in Theia.
The detail is rendered with JSON Forms.

# Configuring a tree editor

To use the tree editor for a custom model, the following classes and interfaces need to be extended resp. implemented.

## BaseTreeEditorWidget

The implementation of this abstract class is the the whole editor widget containing a tree and a detail
whose content depends on the node selected in the tree.

You need to implement `addNode` and `deleteNode` to define how nodes are added to and deleted from the model opened in the editor.
This includes notifying the tree which nodes it has to add resp. remove.

Furthermore, you need to implement `handleFormUpdate`. This is called whenever the user changes data in the detail view.

`save` needs to be overridden if the tree editor should react to the common save command (e.g. if the user presses Ctrl+S in Theia).
By default nothing is done when save is called.

If you want to implement an editor which uses a resource which is loaded from a uri,
you should consider extending [ResourceTreeEditorWidget](src/browser/resource/resource-tree-editor-widget.ts).
This already provides basic implementations for load, save and dirty marker handling, as well as
adding and removing nodes. This is a good starting point for editors that "simply"
show files from the theia workspace and don't need custom file retrieval.

In case you have a resource given as a URI but need custom implementations for loading and saving
the data, you should consider extending [NavigatableTreeEditorWidget](src/browser/navigatable-tree-editor-widget.ts).

## Theia Services

To properly show labels and icons for the tree nodes in your editor,
you need to implement and register an implementation of Theia's `LabelProviderContribution`.
The implemented label provider contribution identifies editor nodes, which it handles,
by checking their `editorId` property. This property is set by the `NodeFactory` (see below) when creating tree nodes.
If your editor supports adding new elements in the tree,
the contribution also needs to provide their icons by handling `CommandIconInfo`.
This could also be done in a separate label provider contribution but for simplicity
sake we handle both in the same contribution.

A simple label provider contributions could look likes this.

```typescript
import { injectable } from "inversify";
import { LabelProviderContribution } from "@theia/core/lib/browser";
import { TreeEditor } from "@eclipse-emfcloud/theia-tree-editor";

const ICON_CLASSES: Map<string, string> = new Map([
  // Map types to icon css classes here
  // ...
]);

@injectable()
export class MyLabelProviderContribution implements LabelProviderContribution {
  public canHandle(element: object): number {
  if (
    (TreeEditor.Node.is(element) || TreeEditor.CommandIconInfo.is(element)) &&
    element.editorId === MyTreeEditor.EDITOR_ID
  ) {
    return 100;
  }
  return 0;
  }

  getIcon(element: object): string | undefined {
  if (TreeEditor.CommandIconInfo.is(element)) {
    return ICON_CLASSES.get(element.type);
  } else if (TreeEditor.Node.is(element)) {
    return ICON_CLASSES.get(element.jsonforms.type);
  }
  return undefined;
  }

  getName(element: object): string | undefined {
  return TreeEditor.Node.is(element) ? element.name : undefined;
  }
}
```

## Services in the TreeEditor namespace

These services need to be implemented to define how the tree editor retrieves and presents the data.
All these interfaces and a definition of the tree editor's node model can be found in
[interfaces.ts](src/browser/interfaces.ts)

### TreeEditor.NodeFactory

The `NodeFactory` specifies how tree nodes are created from instance data.
For every created node, this should set the nodes' `editorId` property
to the same identifier to allow the label provider contribution indentifying them.

### TreeEditor.ModelService

The `ModelService` provides logic to get everything needed to render the detail for a tree node.
This includes providing the data, a schema for the data, and a UI schema specifying how the data is rendered.

# Registering a custom tree editor

To use the editor, you need to bind it in your frontend module (which exports a `ContainerModule`).
However, you should not bind your implementations directly to the interfaces provided
by the json forms tree package because this creates conflicts when when using multiple tree editor implementations in the same Theia instance.

Instead, we provided a utility method `createBasicTreeContainter` that creates a new child container of the current context
and binds all needed services inside the container.
Because the bindings are then encapsulated in the child container, other editors are not affected by them.
If you have additional services or values you need to bind for the creation of your editor,
you can also bind them in the child container.

The following code snipped shows a container module which registers a widget factory for a custom editor.

```typescript
export default new ContainerModule(bind => {
  // Bind label provider contribution globally because Theia's label provider can't find it otherwise.
  bind(LabelProviderContribution).to(MyLabelProviderContribution);

  // Bind services to themselves in case you use them in your extension outside of the editor, too.
  // In this example we only need the label provider contribution somewhere else.
  bind(MyLabelProviderContribution).toSelf();

  bind<WidgetFactory>(WidgetFactory).toDynamicValue(context => ({
  id: "my-theia-tree-editor",
  createWidget: (options: NavigatableWidgetOptions) => {
    // This creates a new inversify Container with all the basic services needed for a theia tree editor.
    const treeContainer = createBasicTreeContainter(
    context.container,
    MyEditorWidget,
    MyModelService,
    MyNodeFactory
    );

    // Our example tree editor needs additional options. So, we bind them in the container created before
    const uri = new URI(options.uri);
    treeContainer
    .bind(NavigatableTreeEditorWidgetOptions)
    .toConstantValue({ uri });

    // Finally, we create a new editor by telling the container to retrieve an instance of our editor implementation
    return treeContainer.get(MyTreeEditorWidget);
  }
  }));
});
```

## Binding for use outside the tree editor widget

If you need to use your implementations of `TreeEditor.NodeFactory` or `TreeEditor.LabelProvider`,
you have two methods to register them safely.

### Bind to self

You can bind a service to itself. Then you can get them injected by referencing your implementation directly.

```typescript
// bind (e.g. when creating a ContainerModule)
bind(MyNodeFactory).toSelf();

// inject (e.g. in a constructor)
@inject(MyNodeFactory) factory: MyNodeFactory
```

### Bind to name

The second method is binding to the original interface and specifying a name constraint that needs to be provided when getting the service injected.

```typescript
// bind (e.g. when creating a ContainerModule)
bind(MyNodeFactory).to(TreeEditor.NodeFactory).whenTargetNamed("my-tree");

// inject (e.g. in a constructor)
@inject(TreeEditor.NodeFactory) @named("my-tree") factory: TreeEditor.NodeFactory
```
