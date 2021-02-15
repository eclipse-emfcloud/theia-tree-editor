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
import { JsonForms, JsonFormsInitStateProps, JsonFormsReactProps } from '@jsonforms/react';
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

    async setSelection(selectedNode: TreeEditor.Node): Promise<void> {
        this.selectedNode = selectedNode;
        this.renderForms();
    }

    protected async renderForms(): Promise<void> {
        if (this.selectedNode) {
            const data = await this.modelService.getDataForNode(this.selectedNode);
            const schema = await this.modelService.getSchemaForNode(this.selectedNode);
            const uiSchema = await this.modelService.getUiSchemaForNode(this.selectedNode);

            ReactDOM.render(
                <div className={JSON_FORMS_CONTAINER_CSS_CLASS}>
                    <JsonFormsStyleContext.Provider value={this.getStyles()}>
                        <JsonForms
                            data={data}
                            schema={schema}
                            uischema={uiSchema}
                            onChange={this.jsonformsOnChange}
                            {...this.getJsonFormsConfig()}
                        />
                    </JsonFormsStyleContext.Provider>
                </div>,
                this.node
            );
        } else {
            this.renderEmptyForms();
        }
    }

    /**
     * Provides configuration for JsonForms rendering the detail forms.
     * Unless the configuration actually changes,
     * this should always return the same object to avoid unnecessary re-renders.
     */
    protected getJsonFormsConfig(): JsonFormsDetailConfig {
        return jsonFormsConfig;
    }

    /**
     * Returns the styles for the detail form.
     * As long as the styles do not change,
     * this should always return the same object to avoid unnecessary re-renders of the form.
     */
    protected getStyles(): StyleContext {
        return styleContextValue;
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

export type JsonFormsDetailConfig = Omit<JsonFormsInitStateProps & JsonFormsReactProps, 'data' | 'onChange' | 'schema' | 'uischema'>;

/** Default json forms configuration using the default vanilla cells and renderers. */
export const jsonFormsConfig: JsonFormsDetailConfig = {
    cells: vanillaCells,
    renderers: vanillaRenderers,
    config: {
        restrict: false,
        trim: false,
        showUnfocusedDescription: true,
        hideRequiredAsterisk: false
    },
    refParserOptions: {
        dereference: {
            circular: 'ignore'
        }
    }
};

/** Default vanilla styles extend with theia-specific styling. */
export const styleContextValue: StyleContext = {
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

