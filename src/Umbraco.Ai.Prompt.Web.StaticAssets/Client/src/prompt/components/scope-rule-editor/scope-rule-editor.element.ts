import { css, html, customElement, property, state } from "@umbraco-cms/backoffice/external/lit";
import { UmbLitElement } from "@umbraco-cms/backoffice/lit-element";
import { UmbTextStyles } from "@umbraco-cms/backoffice/style";
import type { UaiScopeRule } from "../../property-actions/types.js";
import "../../../core/components/doctype-tags-input/doctype-tags-input.element.js";
import "../../../core/components/property-tags-input/property-tags-input.element.js";
import "../../../core/components/property-editor-ui-tags-input/property-editor-ui-tags-input.element.js";

/**
 * Creates an empty scope rule.
 */
export function createEmptyRule(): UaiScopeRule {
    return {
        propertyEditorUiAliases: null,
        propertyAliases: null,
        documentTypeAliases: null,
    };
}

/**
 * Generates a human-readable summary for a scope rule.
 */
function getRuleSummary(rule: UaiScopeRule): string {
    const parts: string[] = [];

    if (rule.documentTypeAliases && rule.documentTypeAliases.length > 0) {
        parts.push(`Doc type: ${rule.documentTypeAliases.join(" | ")}`);
    }
    if (rule.propertyAliases && rule.propertyAliases.length > 0) {
        parts.push(`Property: ${rule.propertyAliases.join(" | ")}`);
    }
    if (rule.propertyEditorUiAliases && rule.propertyEditorUiAliases.length > 0) {
        const simplified = rule.propertyEditorUiAliases.map(a => a.replace("Umb.PropertyEditorUi.", ""));
        parts.push(`Editor: ${simplified.join(" | ")}`);
    }

    if (parts.length === 0) {
        return "Matches everything";
    }

    return parts.join(" AND ");
}

/**
 * Individual scope rule editor with collapsible UI.
 * Uses tag inputs for document types, properties, and property editor UIs.
 *
 * @fires rule-change - Fires when the rule is modified
 * @fires remove - Fires when the remove button is clicked
 */
@customElement("uai-scope-rule-editor")
export class UaiScopeRuleEditorElement extends UmbLitElement {
    @property({ type: Object })
    rule: UaiScopeRule = createEmptyRule();

    @state()
    private _collapsed = true;

    #toggleCollapsed() {
        this._collapsed = !this._collapsed;
    }

    #onDocumentTypeAliasesChange(event: Event) {
        event.stopPropagation();
        const target = event.target as HTMLElement & { items: string[] };
        this.#dispatchChange({
            ...this.rule,
            documentTypeAliases: target.items.length > 0 ? target.items : null,
        });
    }

    #onPropertyAliasesChange(event: Event) {
        event.stopPropagation();
        const target = event.target as HTMLElement & { items: string[] };
        this.#dispatchChange({
            ...this.rule,
            propertyAliases: target.items.length > 0 ? target.items : null,
        });
    }

    #onPropertyEditorUisChange(event: Event) {
        event.stopPropagation();
        const target = event.target as HTMLElement & { items: string[] };
        this.#dispatchChange({
            ...this.rule,
            propertyEditorUiAliases: target.items.length > 0 ? target.items : null,
        });
    }

    #onRemove(event: Event) {
        event.stopPropagation();
        this.dispatchEvent(new Event("remove", { bubbles: true, composed: true }));
    }

    #dispatchChange(rule: UaiScopeRule) {
        this.dispatchEvent(new CustomEvent<UaiScopeRule>("rule-change", {
            detail: rule,
            bubbles: true,
            composed: true,
        }));
    }

    render() {
        const summary = getRuleSummary(this.rule);

        return html`
            <div class="rule-card">
                <button
                    type="button"
                    class="rule-header"
                    @click=${this.#toggleCollapsed}
                    aria-expanded=${!this._collapsed}
                >
                    <uui-symbol-expand ?open=${!this._collapsed}></uui-symbol-expand>
                    <span class="rule-summary">${summary}</span>
                    <uui-button
                        look="secondary"
                        color="danger"
                        compact
                        @click=${this.#onRemove}
                        label="Remove rule"
                    >
                        <uui-icon name="icon-trash"></uui-icon>
                    </uui-button>
                </button>

                <div class="rule-content" ?hidden=${this._collapsed}>
                    <umb-property-layout
                        label="Document Type Aliases"
                        description="Select document types where this rule applies. Empty = any."
                        orientation="vertical"
                    >
                        <uai-doctype-tags-input
                            slot="editor"
                            .items=${this.rule.documentTypeAliases ?? []}
                            placeholder="Any document type"
                            @change=${this.#onDocumentTypeAliasesChange}
                        ></uai-doctype-tags-input>
                    </umb-property-layout>

                    <umb-property-layout
                        label="Property Aliases"
                        description="Select properties where this rule applies. Empty = any."
                        orientation="vertical"
                    >
                        <uai-property-tags-input
                            slot="editor"
                            .items=${this.rule.propertyAliases ?? []}
                            placeholder="Any property"
                            @change=${this.#onPropertyAliasesChange}
                        ></uai-property-tags-input>
                    </umb-property-layout>

                    <umb-property-layout
                        label="Property Editor UIs"
                        description="Select text-based editors where this rule applies. Empty = any."
                        orientation="vertical"
                    >
                        <uai-property-editor-ui-tags-input
                            slot="editor"
                            .items=${this.rule.propertyEditorUiAliases ?? []}
                            placeholder="Any property editor"
                            @change=${this.#onPropertyEditorUisChange}
                        ></uai-property-editor-ui-tags-input>
                    </umb-property-layout>
                </div>
            </div>
        `;
    }

    static styles = [
        UmbTextStyles,
        css`
            :host {
                display: block;
            }

            .rule-card {
                border: 1px solid var(--uui-color-border);
                border-radius: var(--uui-border-radius);
                background: var(--uui-color-surface);
                overflow: hidden;
            }

            .rule-header {
                display: flex;
                align-items: center;
                gap: var(--uui-size-space-3);
                width: 100%;
                padding: var(--uui-size-space-3) var(--uui-size-space-4);
                background: transparent;
                border: none;
                cursor: pointer;
                text-align: left;
                font: inherit;
                color: inherit;
            }

            .rule-header:hover {
                background: var(--uui-color-surface-alt);
            }

            .rule-header:focus {
                outline: 2px solid var(--uui-color-focus);
                outline-offset: -2px;
            }

            .rule-summary {
                flex: 1;
                font-size: var(--uui-type-small-size);
                color: var(--uui-color-text-alt);
                overflow: hidden;
                text-overflow: ellipsis;
                white-space: nowrap;
            }

            .rule-content {
                padding: var(--uui-size-space-4);
                padding-top: 0;
                display: flex;
                flex-direction: column;
                gap: var(--uui-size-space-2);
            }

            .rule-content[hidden] {
                display: none;
            }

            .rule-content umb-property-layout {
                --uui-size-layout-1: 0;
            }

            uui-symbol-expand {
                flex-shrink: 0;
            }
        `,
    ];
}

export default UaiScopeRuleEditorElement;

declare global {
    interface HTMLElementTagNameMap {
        "uai-scope-rule-editor": UaiScopeRuleEditorElement;
    }
}
