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
import { JsonFormsCore } from '@jsonforms/core';
import { JsonForms } from '@jsonforms/react';
import {
    JsonFormsStyleContext,
    StyleContext,
    vanillaCells,
    vanillaRenderers,
    vanillaStyles
} from '@jsonforms/vanilla-renderers';
import { Emitter, Event } from '@theia/core';
import { BaseWidget, Message } from '@theia/core/lib/browser';
import { inject, injectable } from 'inversify';
import * as React from 'react';
import * as ReactDOM from 'react-dom';

import { TreeEditor } from './interfaces';

const JSON_FORMS_CONTAINER_CSS_CLASS = 'jsonforms-container';

/**
 * Renders the detail view of the tree editor and binds the selected object's data to a generated form.
 */
@injectable()
export class DetailFormWidget extends BaseWidget {
    private selectedNode: TreeEditor.Node;
    private jsonformsOnChange: (state: Pick<JsonFormsCore, 'data' | 'errors'>) => void;

    protected changeEmitter = new Emitter<Readonly<any>>();

    constructor(@inject(TreeEditor.ModelService) private readonly modelService: TreeEditor.ModelService) {
        super();

        this.toDispose.push(this.changeEmitter);
        this.jsonformsOnChange = (state: Pick<JsonFormsCore, 'data' | 'errors'>) =>
            this.changeEmitter.fire(state.data);
        this.renderEmptyForms();
    }

    get onChange(): Event<Readonly<any>> {
        return this.changeEmitter.event;
    }

    setSelection(selectedNode: TreeEditor.Node): void {
        this.selectedNode = selectedNode;
        this.renderForms();
    }

    protected renderForms(): void {
        if (this.selectedNode) {
            const data = this.modelService.getDataForNode(this.selectedNode);
            const schema = this.modelService.getSchemaForNode(this.selectedNode);
            const uiSchema = this.modelService.getUiSchemaForNode(this.selectedNode);

            ReactDOM.render(
                <div className={JSON_FORMS_CONTAINER_CSS_CLASS}>
                    <JsonFormsStyleContext.Provider value={styleContextValue}>
                        <JsonForms
                            data={data}
                            schema={schema}
                            uischema={uiSchema}
                            cells={vanillaCells}
                            renderers={vanillaRenderers}
                            onChange={this.jsonformsOnChange}
                            config={{
                                restrict: false,
                                trim: false,
                                showUnfocusedDescription: true,
                                hideRequiredAsterisk: false
                            }}
                            refParserOptions={{
                                dereference: { circular: 'ignore' }
                            }}
                        />
                    </JsonFormsStyleContext.Provider>
                </div>,
                this.node
            );
        } else {
            this.renderEmptyForms();
        }
    }

    protected renderEmptyForms(): void {
        ReactDOM.render(
            <React.Fragment>Please select an element</React.Fragment>,
            this.node
        );
    }

    protected onUpdateRequest(msg: Message): void {
        super.onUpdateRequest(msg);
        this.renderForms();
    }
}

// Default vanilla styles extend with theia-specific styling
const styleContextValue: StyleContext = {
    styles: [
        ...vanillaStyles,
        {
            name: 'array.button',
            classNames: ['theia-button']
        },
        {
            name: 'array.table.button',
            classNames: ['theia-button']
        },
        {
            name: 'control.input',
            classNames: ['theia-input']
        },
        {
            name: 'control.select',
            classNames: ['theia-select']
        },
        {
            name: 'vertical.layout',
            classNames: ['theia-vertical']
        }
    ]
};

