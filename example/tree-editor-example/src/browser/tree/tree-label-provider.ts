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
import { TreeEditor } from '@eclipse-emfcloud/theia-tree-editor';
import { codicon, LabelProviderContribution } from '@theia/core/lib/browser';
import { injectable } from 'inversify';

import { TreeEditorWidget } from './tree-editor-widget';
import { ExampleModel } from './tree-model';

const ICON_CLASSES: Map<string, string> = new Map([
    [ExampleModel.Type.Leaf, codicon('chrome-maximize')],
    [ExampleModel.Type.Tree, codicon('list-tree')],
    [ExampleModel.Type.Node, codicon('type-hierarchy-sub')]
]);

/* Icon for unknown types */
const UNKNOWN_ICON = codicon('question');

@injectable()
export class TreeLabelProvider implements LabelProviderContribution {
    public canHandle(element: object): number {
        if ((TreeEditor.Node.is(element) || TreeEditor.CommandIconInfo.is(element)) && element.editorId === TreeEditorWidget.EDITOR_ID) {
            return 1000;
        }
        return 0;
    }

    public getIcon(element: object): string | undefined {
        let iconClass: string | undefined;
        if (TreeEditor.CommandIconInfo.is(element)) {
            iconClass = ICON_CLASSES.get(element.type);
        } else if (TreeEditor.Node.is(element)) {
            iconClass = ICON_CLASSES.get(element.jsonforms.type);
        }

        return iconClass ?? UNKNOWN_ICON;
    }

    public getName(element: object): string | undefined {
        const data = TreeEditor.Node.is(element) ? element.jsonforms.data : element;
        if (data.name) {
            return data.name;
        } else if (data.typeId) {
            return this.getTypeName(data.typeId);
        }

        return undefined;
    }

    private getTypeName(typeId: string): string {
        return ExampleModel.Type.name(typeId);
    }
}
