/********************************************************************************
 * Copyright (c) 2019-2020 EclipseSource and others.
 *
 * This program and the accompanying materials are made available under the
 * terms of the Eclipse Public License v. 2.0 which is available at
 * https://www.eclipse.org/legal/epl-2.0, or the MIT License which is
 * available at https://opensource.org/licenses/MIT.
 *
 * SPDX-License-Identifier: EPL-2.0 OR MIT
 ********************************************************************************/
import {
    // eslint-disable-next-line import/no-deprecated
    createTreeContainer,
    defaultTreeProps,
    TreeProps,
    TreeWidget as TheiaTreeWidget
} from '@theia/core/lib/browser/tree';
import { interfaces } from 'inversify';

import { DetailFormWidget } from './detail-form-widget';
import { TreeEditor } from './interfaces';
import { MasterTreeWidget, TreeContextMenu } from './master-tree-widget';
import { BaseTreeEditorWidget } from './tree-editor-widget';

export const TREE_PROPS = {
    ...defaultTreeProps,
    contextMenuPath: TreeContextMenu.CONTEXT_MENU,
    multiSelect: false,
    search: false
} as TreeProps;

function createTreeWidget(
    parent: interfaces.Container
): MasterTreeWidget {
    // eslint-disable-next-line import/no-deprecated
    const treeContainer = createTreeContainer(parent);

    treeContainer.unbind(TheiaTreeWidget);
    treeContainer.bind(MasterTreeWidget).toSelf();
    treeContainer.rebind(TreeProps).toConstantValue(TREE_PROPS);
    return treeContainer.get(MasterTreeWidget);
}

/**
 * Creates a new inversify container to create tree editor widgets using the given customizations.
 * If further services are needed than the given ones, these must either be bound in the parent container
 * or to the returned container before a tree editor widget is requested.
 *
 * Note that this method does not create a singletion tree editor but returns a new instance whenever an instace is requested.
 *
 * @param parent The parent inversify container
 * @param treeEditorWidget The concrete tree editor widget to create
 * @param modelService The tree editor's model service
 * @param nodeFactory The tree editor's node factory
 */
export function createBasicTreeContainer(
    parent: interfaces.Container,
    treeEditorWidget: interfaces.Newable<BaseTreeEditorWidget>,
    modelService: interfaces.Newable<TreeEditor.ModelService>,
    nodeFactory: interfaces.Newable<TreeEditor.NodeFactory>): interfaces.Container {

    const container = parent.createChild();
    container.bind(TreeEditor.ModelService).to(modelService);
    container.bind(TreeEditor.NodeFactory).to(nodeFactory);
    container.bind(DetailFormWidget).toSelf();
    container.bind(MasterTreeWidget).toDynamicValue(context => createTreeWidget(context.container));
    container.bind(treeEditorWidget).toSelf();

    return container;
}

/**
 * Creates a new map based on the model service's children mapping.
 * The created map maps from command ID to command descriptor.
 * The command descriptor contains information about the parent type, the type of the new node and the container property.
 *
 * Basically, this creates add commands for all types that can be created in properties, grouped by command id.
 *
 * @param modelService The tree editor's model service
 */
export function generateAddCommandDescriptions(modelService: TreeEditor.ModelService): Map<string, TreeEditor.AddCommandDescription> {
    // Create a command for every type that can be added to a node
    const commandMap: Map<string, TreeEditor.AddCommandDescription> = new Map();
    Array.from(modelService.getChildrenMapping()).forEach(([parentType, value]) => {
        // get all creatable types for the parent node
        const creatableTypes: Set<TreeEditor.ChildrenDescriptor> = value
            // get flat array of child descriptors
            .reduce((acc, val) => acc.concat(val), [])
            // unify by adding to set
            .reduce((acc, val) => acc.add(val), new Set<TreeEditor.ChildrenDescriptor>());
        Array.from(creatableTypes).forEach(desc => {
            desc.children.forEach(type => {
                const name = modelService.getNameForType(type);
                const commandId = `json-forms-tree.add.${parentType}.${desc.property}.${name}`;
                const command = {
                    id: commandId,
                    label: name
                };
                commandMap.set(commandId, { parentType, property: desc.property, type, command });
            });
        });
    });
    return commandMap;
}
