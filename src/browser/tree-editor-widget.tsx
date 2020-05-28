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
import { Title } from '@phosphor/widgets';
import { BaseWidget, Message, Saveable, SplitPanel, Widget } from '@theia/core/lib/browser';
import { Emitter, Event, ILogger } from '@theia/core/lib/common';
import { WorkspaceService } from '@theia/workspace/lib/browser/workspace-service';
import { injectable, postConstruct } from 'inversify';
import { debounce, isEqual } from 'lodash';
import * as React from 'react';
import * as ReactDOM from 'react-dom';

import { TreeEditor } from './interfaces';
import { DetailFormWidget } from './detail-form-widget';
import { AddCommandProperty, MasterTreeWidget } from './master-tree-widget';

@injectable()
export abstract class BaseTreeEditorWidget extends BaseWidget implements Saveable {
  public dirty: boolean = false;
  public autoSave: 'off';
  private splitPanel: SplitPanel;

  protected readonly onDirtyChangedEmitter = new Emitter<void>();
  get onDirtyChanged(): Event<void> {
    return this.onDirtyChangedEmitter.event;
  }

  public selectedNode: TreeEditor.Node;

  protected instanceData: any;

  constructor(
    protected readonly treeWidget: MasterTreeWidget,
    protected readonly formWidget: DetailFormWidget,
    protected readonly workspaceService: WorkspaceService,
    protected readonly logger: ILogger,
    readonly widget_id: string
  ) {
    super();
    this.id = widget_id;
    this.splitPanel = new SplitPanel();
    this.addClass(BaseTreeEditorWidget.Styles.EDITOR);
    this.splitPanel.addClass(BaseTreeEditorWidget.Styles.SASH);
    this.treeWidget.addClass(BaseTreeEditorWidget.Styles.TREE);
    this.formWidget.addClass(BaseTreeEditorWidget.Styles.FORM);
    this.formWidget.onChange(
      debounce(data => {
        if (
          !this.selectedNode ||
          !this.selectedNode.jsonforms ||
          isEqual(this.selectedNode.jsonforms.data, data)
        ) {
          return;
        }
        this.handleFormUpdate(data, this.selectedNode);
      }, 250)
    );
    this.toDispose.push(
      this.treeWidget.onSelectionChange(ev => this.treeSelectionChanged(ev))
    );
    this.toDispose.push(
      this.treeWidget.onDelete(node => this.deleteNode(node))
    );
    this.toDispose.push(
      this.treeWidget.onAdd(addProp => this.addNode(addProp))
    );

    this.toDispose.push(this.onDirtyChangedEmitter);
  }

  @postConstruct()
  protected init(): void {
    this.configureTitle(this.title);
  }

  protected onResize(_msg: any) {
    if (this.splitPanel) {
      this.splitPanel.update();
    }
  }

  protected renderError(errorMessage: string): void {
    ReactDOM.render(
      <React.Fragment>{errorMessage}</React.Fragment>,
      this.formWidget.node
    );
  }

  protected treeSelectionChanged(
    selectedNodes: readonly Readonly<TreeEditor.Node>[]
  ) {
    if (selectedNodes.length === 0) {
      this.selectedNode = undefined;
    } else {
      this.selectedNode = selectedNodes[0];
      this.formWidget.setSelection(this.selectedNode);
    }
    this.update();
  }

  /**
   * Sets the dirty state of this editor and notify listeners subscribed to the dirty state.
   *
   * @param dirty true if the editor is dirty
   */
  protected setDirty(dirty: boolean) {
    if (this.dirty !== dirty) {
      this.dirty = dirty;
      this.onDirtyChangedEmitter.fire();
    }
  }

  /**
   * Delete the given node including its associated data from the tree.
   *
   * @param node The tree node to delete
   */
  protected abstract deleteNode(node: Readonly<TreeEditor.Node>): void;

  /**
   * Add a node to the tree.
   * @param node The tree node to add
   * @param type The type of the node's data
   * @param property The property containing the node's data
   */
  protected abstract addNode({
    node,
    type,
    property
  }: AddCommandProperty): void;

  protected onAfterAttach(msg: Message): void {
    this.splitPanel.addWidget(this.treeWidget);
    this.splitPanel.addWidget(this.formWidget);
    this.splitPanel.setRelativeSizes([1, 4]);
    Widget.attach(this.splitPanel, this.node);
    this.treeWidget.activate();
    super.onAfterAttach(msg);
  }

  protected onActivateRequest() {
    if (this.splitPanel) {
      this.splitPanel.node.focus();
    }
  }

  /**
   * Called when the data in the detail was changed.
   * Whether you need to manually apply the change to the tree node's referenced data
   * depends on your implementation of method 'getDataForNode' of your ModelService.
   *
   * @param data The new data for the node
   * @param node The tree node whose data will be updated
   */
  protected abstract handleFormUpdate(
    data: any,
    node: TreeEditor.Node
  ): void;

  public save(): void {
    // do nothing by default
  }

  /**
   * Configure this editor's title tab by configuring the given Title object.
   *
   * @param title The title object configuring this editor's title tab in Theia
   */
  protected abstract configureTitle(title: Title<Widget>): void;
}

export namespace BaseTreeEditorWidget {
  export const WIDGET_LABEL = 'Theia Tree Editor';

  export namespace Styles {
    export const EDITOR = 'theia-tree-editor';
    export const TREE = 'theia-tree-editor-tree';
    export const FORM = 'theia-tree-editor-form';
    export const SASH = 'theia-tree-editor-sash';
  }
}
