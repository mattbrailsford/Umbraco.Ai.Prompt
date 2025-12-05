import { css, html, customElement, state, nothing } from "@umbraco-cms/backoffice/external/lit";
import { UmbLitElement } from "@umbraco-cms/backoffice/lit-element";
import { UmbTextStyles } from "@umbraco-cms/backoffice/style";
import type { UaiSelectedEvent } from "@umbraco-ai/core";
import { UaiPartialUpdateCommand, UAI_EMPTY_GUID } from "@umbraco-ai/core";
import "@umbraco-ai/core";
import type { UaiPromptDetailModel } from "../../../types.js";
import type { UaiPromptScope, UaiScopeRule } from "../../../property-actions/types.js";
import { TEXT_BASED_PROPERTY_EDITOR_UIS } from "../../../property-actions/constants.js";
import { UAI_PROMPT_WORKSPACE_CONTEXT } from "../prompt-workspace.context-token.js";
import { createEmptyRule } from "../../../components/scope-rule-editor/scope-rule-editor.element.js";
import "../../../components/scope-rule-editor/scope-rule-editor.element.js";

/**
 * Creates a default scope with one include rule for all text-based editors.
 */
function createDefaultScope(): UaiPromptScope {
    return {
        includeRules: [{
            propertyEditorUiAliases: [...TEXT_BASED_PROPERTY_EDITOR_UIS],
            propertyAliases: null,
            documentTypeAliases: null,
        }],
        excludeRules: [],
    };
}

/**
 * Workspace view for Prompt details.
 * Displays content, description, scope configuration, tags, and status.
 */
@customElement("uai-prompt-details-workspace-view")
export class UaiPromptDetailsWorkspaceViewElement extends UmbLitElement {
    #workspaceContext?: typeof UAI_PROMPT_WORKSPACE_CONTEXT.TYPE;

    @state()
    private _model?: UaiPromptDetailModel;

    constructor() {
        super();
        this.consumeContext(UAI_PROMPT_WORKSPACE_CONTEXT, (context) => {
            if (context) {
                this.#workspaceContext = context;
                this.observe(context.model, (model) => {
                    this._model = model;
                });
            }
        });
    }

    #getScope(): UaiPromptScope {
        return this._model?.scope ?? createDefaultScope();
    }

    #onDescriptionChange(event: Event) {
        event.stopPropagation();
        const value = (event.target as HTMLInputElement).value;
        this.#workspaceContext?.handleCommand(
            new UaiPartialUpdateCommand<UaiPromptDetailModel>({ description: value || null }, "description")
        );
    }

    #onContentChange(event: Event) {
        event.stopPropagation();
        const value = (event.target as HTMLTextAreaElement).value;
        this.#workspaceContext?.handleCommand(
            new UaiPartialUpdateCommand<UaiPromptDetailModel>({ content: value }, "content")
        );
    }

    #onIsActiveChange(event: Event) {
        event.stopPropagation();
        const checked = (event.target as HTMLInputElement).checked;
        this.#workspaceContext?.handleCommand(
            new UaiPartialUpdateCommand<UaiPromptDetailModel>({ isActive: checked }, "isActive")
        );
    }

    #onProfileChange(event: UaiSelectedEvent) {
        event.stopPropagation();
        this.#workspaceContext?.handleCommand(
            new UaiPartialUpdateCommand<UaiPromptDetailModel>({ profileId: event.unique }, "profileId")
        );
    }

    #updateScope(scope: UaiPromptScope) {
        this.#workspaceContext?.handleCommand(
            new UaiPartialUpdateCommand<UaiPromptDetailModel>({ scope }, "scope")
        );
    }

    // Include rules handlers
    #onAddIncludeRule() {
        const scope = this.#getScope();
        this.#updateScope({
            ...scope,
            includeRules: [...scope.includeRules, createEmptyRule()],
        });
    }

    #onRemoveIncludeRule(index: number) {
        const scope = this.#getScope();
        this.#updateScope({
            ...scope,
            includeRules: scope.includeRules.filter((_, i) => i !== index),
        });
    }

    #onIncludeRuleChange(index: number, rule: UaiScopeRule) {
        const scope = this.#getScope();
        const newRules = [...scope.includeRules];
        newRules[index] = rule;
        this.#updateScope({
            ...scope,
            includeRules: newRules,
        });
    }

    // Exclude rules handlers
    #onAddExcludeRule() {
        const scope = this.#getScope();
        this.#updateScope({
            ...scope,
            excludeRules: [...scope.excludeRules, createEmptyRule()],
        });
    }

    #onRemoveExcludeRule(index: number) {
        const scope = this.#getScope();
        this.#updateScope({
            ...scope,
            excludeRules: scope.excludeRules.filter((_, i) => i !== index),
        });
    }

    #onExcludeRuleChange(index: number, rule: UaiScopeRule) {
        const scope = this.#getScope();
        const newRules = [...scope.excludeRules];
        newRules[index] = rule;
        this.#updateScope({
            ...scope,
            excludeRules: newRules,
        });
    }

    render() {
        if (!this._model) return html`<uui-loader></uui-loader>`;

        return html`
            <div class="layout">
                <div class="main-column">${this.#renderLeftColumn()}</div>
                <div class="aside-column">${this.#renderRightColumn()}</div>
            </div>
        `;
    }

    #renderLeftColumn() {
        if (!this._model) return html`<uui-loader></uui-loader>`;

        const scope = this.#getScope();

        return html`
            <uui-box headline="Prompt Configuration">
                <umb-property-layout label="AI Profile" description="Optional AI profile this prompt is designed for">
                    <uai-profile-picker
                        slot="editor"
                        .value=${this._model.profileId ?? undefined}
                        placeholder="-- No Profile --"
                        @selected=${this.#onProfileChange}
                    ></uai-profile-picker>
                </umb-property-layout>

                <umb-property-layout label="Description" description="Brief description of this prompt">
                    <uui-input
                        slot="editor"
                        .value=${this._model.description ?? ""}
                        @input=${this.#onDescriptionChange}
                        placeholder="Enter description..."
                    ></uui-input>
                </umb-property-layout>

                <umb-property-layout label="Content" description="The prompt template text">
                    <uui-textarea
                        slot="editor"
                        .value=${this._model.content}
                        @input=${this.#onContentChange}
                        placeholder="Enter prompt content..."
                        rows="12"
                    ></uui-textarea>
                </umb-property-layout>
            </uui-box>

            <uui-box headline="Scope Configuration">
                
                <umb-property-layout
                    label="Include Rules"
                    description="Prompt appears where ANY rule matches (OR logic between rules)"
                >
                    <div slot="editor" class="rules-container">
                        ${scope.includeRules.map((rule, index) => html`
                            <uai-scope-rule-editor
                                .rule=${rule}
                                @rule-change=${(e: CustomEvent<UaiScopeRule>) => this.#onIncludeRuleChange(index, e.detail)}
                                @remove=${() => this.#onRemoveIncludeRule(index)}
                            ></uai-scope-rule-editor>
                        `)}
                        <uui-button
                            look="placeholder"
                            @click=${this.#onAddIncludeRule}
                        >
                            <uui-icon name="icon-add"></uui-icon>
                            Add Include Rule
                        </uui-button>
                    </div>
                </umb-property-layout>

                <umb-property-layout
                        label="Exclude Rules"
                        description="Prompt is hidden where ANY rule matches (overrides includes)"
                >
                    <div slot="editor" class="rules-container">
                        ${scope.excludeRules.map((rule, index) => html`
                            <uai-scope-rule-editor
                                .rule=${rule}
                                @rule-change=${(e: CustomEvent<UaiScopeRule>) => this.#onExcludeRuleChange(index, e.detail)}
                                @remove=${() => this.#onRemoveExcludeRule(index)}
                            ></uai-scope-rule-editor>
                        `)}
                        <uui-button
                                look="placeholder"
                                @click=${this.#onAddExcludeRule}
                        >
                            <uui-icon name="icon-add"></uui-icon>
                            Add Exclude Rule
                        </uui-button>
                    </div>
                </umb-property-layout>
                
            </uui-box>

            ${this._model.tags.length > 0 ? html`
                <uui-box headline="Tags">
                    <div class="tags-container">
                        ${this._model.tags.map((tag) => html`<uui-tag>${tag}</uui-tag>`)}
                    </div>
                </uui-box>
            ` : nothing}
        `;
    }

    #renderRightColumn() {
        if (!this._model) return null;

        return html`
            <uui-box headline="Info">
                <umb-property-layout label="Id" orientation="vertical">
                    <div slot="editor">${this._model.unique === UAI_EMPTY_GUID
                        ? html`<uui-tag color="default" look="placeholder">Unsaved</uui-tag>`
                        : this._model.unique}</div>
                </umb-property-layout>
                <umb-property-layout label="Active" orientation="vertical">
                    <uui-toggle
                        slot="editor"
                        ?checked=${this._model.isActive}
                        @change=${this.#onIsActiveChange}
                    ></uui-toggle>
                </umb-property-layout>
            </uui-box>
        `;
    }

    static styles = [
        UmbTextStyles,
        css`
            :host {
                display: block;
                padding: var(--uui-size-layout-1);
            }

            .layout {
                display: grid;
                grid-template-columns: 1fr 350px;
                gap: var(--uui-size-layout-1);
            }

            .main-column {
                min-width: 0;
            }

            .aside-column {
                min-width: 0;
            }

            @media (max-width: 1024px) {
                .layout {
                    grid-template-columns: 1fr;
                }
            }

            uui-box {
                --uui-box-default-padding: 0 var(--uui-size-space-5);
            }
            uui-box:not(:first-child) {
                margin-top: var(--uui-size-layout-1);
            }

            .exclude-box {
                --uui-box-header-color: var(--uui-color-danger);
            }

            uui-input,
            uui-textarea {
                width: 100%;
            }

            .rules-container {
                display: flex;
                flex-direction: column;
                gap: var(--uui-size-space-3);
            }

            .rules-container uui-button[look="placeholder"] {
                width: 100%;
            }

            .tags-container {
                display: flex;
                flex-wrap: wrap;
                gap: var(--uui-size-space-2);
                padding: var(--uui-size-space-3) 0;
            }

            umb-property-layout[orientation="vertical"]:not(:last-child) {
                padding-bottom: 0;
            }

            uui-loader {
                display: block;
                margin: auto;
                position: absolute;
                top: 50%;
                left: 50%;
                transform: translate(-50%, -50%);
            }
        `,
    ];
}

export default UaiPromptDetailsWorkspaceViewElement;

declare global {
    interface HTMLElementTagNameMap {
        "uai-prompt-details-workspace-view": UaiPromptDetailsWorkspaceViewElement;
    }
}
