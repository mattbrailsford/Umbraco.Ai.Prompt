import { css, html, customElement, property } from "@umbraco-cms/backoffice/external/lit";
import { UmbLitElement } from "@umbraco-cms/backoffice/lit-element";
import { UmbTextStyles } from "@umbraco-cms/backoffice/style";
import type { UaiVisibilityRule } from "../../property-actions/types.js";
import { createEmptyRule } from "./visibility-rule-editor.element.js";
import "./visibility-rule-editor.element.js";

/**
 * Editor for managing a list of visibility rules (show or hide).
 * Handles adding, removing, and updating rules.
 *
 * @fires rules-change - Fires when the rules array changes
 */
@customElement("uai-visibility-rules-editor")
export class UaiVisibilityRulesEditorElement extends UmbLitElement {
    @property({ type: Array })
    rules: UaiVisibilityRule[] = [];

    @property({ type: String })
    addButtonLabel = "Add Rule";

    #onAddRule() {
        const newRules = [...this.rules, createEmptyRule()];
        this.#dispatchChange(newRules);
    }

    #onRemoveRule(index: number) {
        const newRules = this.rules.filter((_, i) => i !== index);
        this.#dispatchChange(newRules);
    }

    #onRuleChange(index: number, rule: UaiVisibilityRule) {
        const newRules = [...this.rules];
        newRules[index] = rule;
        this.#dispatchChange(newRules);
    }

    #dispatchChange(rules: UaiVisibilityRule[]) {
        this.dispatchEvent(new CustomEvent<UaiVisibilityRule[]>("rules-change", {
            detail: rules,
            bubbles: true,
            composed: true,
        }));
    }

    render() {
        return html`
            <div class="rules-container">
                ${this.rules.map((rule, index) => html`
                    <uai-visibility-rule-editor
                        .rule=${rule}
                        @rule-change=${(e: CustomEvent<UaiVisibilityRule>) => this.#onRuleChange(index, e.detail)}
                        @remove=${() => this.#onRemoveRule(index)}
                    ></uai-visibility-rule-editor>
                `)}
                <uui-button
                    look="placeholder"
                    @click=${this.#onAddRule}
                >
                    <uui-icon name="icon-add"></uui-icon>
                    ${this.addButtonLabel}
                </uui-button>
            </div>
        `;
    }

    static styles = [
        UmbTextStyles,
        css`
            :host {
                display: block;
            }

            .rules-container {
                display: flex;
                flex-direction: column;
                gap: var(--uui-size-space-3);
            }

            .rules-container uui-button[look="placeholder"] {
                width: 100%;
            }
        `,
    ];
}

export default UaiVisibilityRulesEditorElement;

declare global {
    interface HTMLElementTagNameMap {
        "uai-visibility-rules-editor": UaiVisibilityRulesEditorElement;
    }
}
