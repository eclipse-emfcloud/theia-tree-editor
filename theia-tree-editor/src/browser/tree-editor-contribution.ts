/********************************************************************************
 * Copyright (c) 2019-2020 EclipseSource and others.
 *
 * This program and the accompanying materials are made available under the
 * terms of the Eclipse Public License v. 2.0 which is available at
 * https://www.eclipse.org/legal/epl-2.0, or the MIT License which is
 * available at https://opensource.org/licenses/MIT.
 *
 * SPDX-License-Identifier: EPL-2.0 OR MIT
 *******************************************************************************/
import { CommandContribution, CommandHandler, CommandRegistry, MenuContribution, MenuModelRegistry } from '@theia/core';
import { LabelProviderContribution, WidgetOpenHandler } from '@theia/core/lib/browser';

import { TreeEditor } from './interfaces';
import { TreeAnchor, TreeContextMenu } from './master-tree-widget';
import { BaseTreeEditorWidget } from './tree-editor-widget';
import { generateAddCommandDescriptions } from './util';

/**
 * Abstract base class for defining custom tree editor contributions.
 * An editor's contribution registers its commands and context menus.
 * Furthermore, it defines which URIs the editor can handle and may configure
 * the widget with additional options (see WidgetOpenHandler).
 */
export abstract class BaseTreeEditorContribution
    extends WidgetOpenHandler<BaseTreeEditorWidget>
    implements CommandContribution, MenuContribution
{
    private commandMap: Map<string, TreeEditor.AddCommandDescription>;

    constructor(private editorId: string, private modelService: TreeEditor.ModelService, private labelProvider: LabelProviderContribution) {
        super();
    }
    /**
     * @returns maps property names to type identifiers to their corresponding add command
     */
    private getCommandMap(): Map<string, TreeEditor.AddCommandDescription> {
        if (!this.commandMap) {
            this.commandMap = generateAddCommandDescriptions(this.modelService);
        }
        return this.commandMap;
    }
    registerCommands(commands: CommandRegistry): void {
        this.getCommandMap().forEach((description, _commandId, _map) => {
            commands.registerCommand(
                description.command,
                new AddCommandHandler(description.parentType, description.property, description.type, this.modelService)
            );
        });
    }
    registerMenus(menus: MenuModelRegistry): void {
        this.getCommandMap().forEach((description, _property, _map) => {
            const iconInfo: TreeEditor.CommandIconInfo = {
                _id: 'theia-tree-editor-command-icon-info',
                editorId: this.editorId,
                type: description.type
            };
            menus.registerMenuAction(TreeContextMenu.ADD_MENU, {
                commandId: description.command.id,
                label: description.command.label,
                icon: this.labelProvider.getIcon?.(iconInfo)
            });
        });
    }
}

class AddCommandHandler implements CommandHandler {
    constructor(
        private readonly parent: string,
        private readonly property: string,
        private readonly type: string,

        private modelService: TreeEditor.ModelService
    ) {}

    execute(treeAnchor: TreeAnchor): void {
        treeAnchor.onClick(this.property, this.type);
    }

    isVisible(treeAnchor: TreeAnchor): boolean {
        if (!treeAnchor) {
            return false;
        }
        const nodeType = treeAnchor.node.jsonforms.type;
        if (nodeType !== this.parent) {
            return false;
        }

        // Check whether the node object's type can contain children of this command's type.
        return this.modelService
            .getChildrenMapping()
            .get(nodeType)
            .map(desc => desc.children)
            .reduce((acc, val) => acc.concat(val), [])
            .reduce((acc, val) => acc.add(val), new Set<string>())
            .has(this.type);
    }
}
