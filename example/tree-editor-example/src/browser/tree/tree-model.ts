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

export namespace ExampleModel {
    export namespace Type {
        export const Leaf = 'Leaf';
        export const Tree = 'Tree';
        export const Node = 'Node';

        export function name(type: string): string {
            return type;
        }
    }

    const components = [Type.Node, Type.Leaf];

    /** Maps types to their creatable children */
    export const childrenMapping: Map<string, TreeEditor.ChildrenDescriptor[]> = new Map([
        [
            Type.Tree,
            [
                {
                    property: 'children',
                    children: components
                }
            ]
        ],
        [
            Type.Node,
            [
                {
                    property: 'children',
                    children: components
                }
            ]
        ]
    ]);
}
