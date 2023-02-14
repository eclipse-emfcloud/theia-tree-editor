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
import {
    DetailFormWidget,
    MasterTreeWidget,
    NavigatableTreeEditorOptions,
    ResourceTreeEditorWidget,
    TreeEditor
} from '@eclipse-emfcloud/theia-tree-editor';
import { codicon, Title, Widget } from '@theia/core/lib/browser';
import { DefaultResourceProvider, ILogger } from '@theia/core/lib/common';
import { EditorPreferences } from '@theia/editor/lib/browser';
import { WorkspaceService } from '@theia/workspace/lib/browser/workspace-service';
import { inject, injectable } from 'inversify';

@injectable()
export class TreeEditorWidget extends ResourceTreeEditorWidget {
    constructor(
        @inject(MasterTreeWidget)
        readonly treeWidget: MasterTreeWidget,
        @inject(DetailFormWidget)
        readonly formWidget: DetailFormWidget,
        @inject(WorkspaceService)
        readonly workspaceService: WorkspaceService,
        @inject(ILogger) readonly logger: ILogger,
        @inject(NavigatableTreeEditorOptions)
        protected readonly options: NavigatableTreeEditorOptions,
        @inject(DefaultResourceProvider)
        protected provider: DefaultResourceProvider,
        @inject(TreeEditor.NodeFactory)
        protected readonly nodeFactory: TreeEditor.NodeFactory,
        @inject(EditorPreferences)
        protected readonly editorPreferences: EditorPreferences
    ) {
        super(
            treeWidget,
            formWidget,
            workspaceService,
            logger,
            TreeEditorWidget.WIDGET_ID,
            options,
            provider,
            nodeFactory,
            editorPreferences
        );
    }

    protected getTypeProperty(): string {
        return 'typeId';
    }

    protected configureTitle(title: Title<Widget>): void {
        super.configureTitle(title);
        title.iconClass = codicon('list-tree');
    }
}

// eslint-disable-next-line no-redeclare
export namespace TreeEditorWidget {
    export const WIDGET_ID = 'tree-editor-example-tree-editor';
    export const EDITOR_ID = 'tree-editor-example.tree.editor';
}
