import { UMB_PROPERTY_CONTEXT } from '@umbraco-cms/backoffice/property';
import { UMB_PROPERTY_STRUCTURE_WORKSPACE_CONTEXT } from '@umbraco-cms/backoffice/content-type';
import type { UmbControllerHost } from '@umbraco-cms/backoffice/controller-api';
import type { UmbConditionConfigBase, UmbConditionControllerArguments, UmbExtensionCondition } from '@umbraco-cms/backoffice/extension-api';
import { UmbConditionBase } from '@umbraco-cms/backoffice/extension-registry';
import { shouldShowPrompt, type PropertyActionContext } from './prompt-visibility-matcher.js';
import type { UaiPromptVisibility } from './types.js';

/**
 * Condition configuration for prompt visibility filtering.
 */
export interface UaiPromptVisibilityConditionConfig extends UmbConditionConfigBase {
    visibility: UaiPromptVisibility | null;
}

const PropertyContextSymbol = Symbol();
const ContentTypeSymbol = Symbol();

/**
 * Condition that determines if a prompt should appear based on its visibility configuration.
 */
export class UaiPromptVisibilityCondition
    extends UmbConditionBase<UaiPromptVisibilityConditionConfig>
    implements UmbExtensionCondition
{
    #propertyEditorUiAlias: string | null = null;
    #propertyAlias: string | null = null;
    #documentTypeAliases: string[] = [];

    constructor(host: UmbControllerHost, args: UmbConditionControllerArguments<UaiPromptVisibilityConditionConfig>) {
        super(host, args);

        // Get property context for property editor UI alias and property alias
        this.consumeContext(UMB_PROPERTY_CONTEXT, (context) => {
            if (!context) {
                this.#propertyEditorUiAlias = null;
                this.#propertyAlias = null;
                this.#updatePermitted();
                return;
            }

            // Observe the editor manifest for property editor UI alias
            this.observe(
                context.editorManifest,
                (manifest) => {
                    this.#propertyEditorUiAlias = manifest?.alias ?? null;
                    this.#updatePermitted();
                },
                PropertyContextSymbol
            );

            // Get the property alias
            this.#propertyAlias = context.getAlias() ?? null;
            this.#updatePermitted();
        });

        // Get content type context for document type alias
        this.consumeContext(UMB_PROPERTY_STRUCTURE_WORKSPACE_CONTEXT, (context) => {
            if (!context) {
                this.#documentTypeAliases = [];
                this.#updatePermitted();
                return;
            }

            this.observe(
                context.structure.contentTypeAliases,
                (aliases) => {
                    this.#documentTypeAliases = aliases ?? [];
                    this.#updatePermitted();
                },
                ContentTypeSymbol
            );
        });
    }

    #updatePermitted(): void {
        // If we don't have the basic context yet, don't show
        if (!this.#propertyEditorUiAlias || !this.#propertyAlias) {
            this.permitted = false;
            return;
        }

        const context: PropertyActionContext = {
            propertyEditorUiAlias: this.#propertyEditorUiAlias,
            propertyAlias: this.#propertyAlias,
            documentTypeAliases: this.#documentTypeAliases,
        };

        this.permitted = shouldShowPrompt(this.config.visibility, context);
    }
}

export { UaiPromptVisibilityCondition as api };
