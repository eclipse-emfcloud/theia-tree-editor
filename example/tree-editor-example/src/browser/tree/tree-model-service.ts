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
import { JsonSchema, UISchemaElement } from '@jsonforms/core';
import { ILogger } from '@theia/core';
import { inject, injectable } from 'inversify';

import { ExampleModel } from './tree-model';
import { exampleSchema, leafView, nodeView, treeView } from './tree-schema';

@injectable()
export class TreeModelService implements TreeEditor.ModelService {
    constructor(@inject(ILogger) private readonly logger: ILogger) {}

    getDataForNode(node: TreeEditor.Node): any {
        return node.jsonforms.data;
    }

    getSchemaForNode(node: TreeEditor.Node): JsonSchema | undefined {
        return {
            definitions: exampleSchema.definitions,
            ...this.getSchemaForType(node.jsonforms.type)
        };
    }

    private getSchemaForType(type: string): any {
        if (!type) {
            return undefined;
        }
        const schema = Object.entries(exampleSchema.definitions)
            .map(entry => entry[1])
            .find(definition => definition.properties && definition.properties.typeId.const === type);
        if (schema === undefined) {
            this.logger.warn("Can't find definition schema for type " + type);
        }
        return schema;
    }

    getUiSchemaForNode(node: TreeEditor.Node): UISchemaElement | undefined {
        const type = node.jsonforms.type;
        switch (type) {
            case ExampleModel.Type.Tree:
                return treeView;
            case ExampleModel.Type.Node:
                return nodeView;
            case ExampleModel.Type.Leaf:
                return leafView;
            default:
                this.logger.warn("Can't find registered ui schema for type " + type);
                return undefined;
        }
    }

    getChildrenMapping(): Map<string, TreeEditor.ChildrenDescriptor[]> {
        return ExampleModel.childrenMapping;
    }

    getNameForType(type: string): string {
        return ExampleModel.Type.name(type);
    }
}
