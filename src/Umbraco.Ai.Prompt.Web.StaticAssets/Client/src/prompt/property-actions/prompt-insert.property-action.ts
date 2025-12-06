import type { UmbControllerHost } from '@umbraco-cms/backoffice/controller-api';
import { UmbPropertyActionBase, type UmbPropertyActionArgs } from '@umbraco-cms/backoffice/property-action';
import { UMB_PROPERTY_CONTEXT } from '@umbraco-cms/backoffice/property';
import { UMB_CONTENT_WORKSPACE_CONTEXT } from '@umbraco-cms/backoffice/content';
import { umbOpenModal } from '@umbraco-cms/backoffice/modal';
import { UAI_PROMPT_PREVIEW_MODAL } from './prompt-preview-modal.token.js';
import type { UaiPromptPropertyActionMeta } from './types.js';

/**
 * Property action that opens a modal to preview and insert prompt content.
 */
export class UaiPromptInsertPropertyAction extends UmbPropertyActionBase<UaiPromptPropertyActionMeta> {
    #propertyContext?: typeof UMB_PROPERTY_CONTEXT.TYPE;
    #workspaceContext?: typeof UMB_CONTENT_WORKSPACE_CONTEXT.TYPE;
    #init: Promise<unknown>;

    constructor(host: UmbControllerHost, args: UmbPropertyActionArgs<UaiPromptPropertyActionMeta>) {
        super(host, args);

        this.#init = Promise.all([
            this.consumeContext(UMB_PROPERTY_CONTEXT, (context) => {
                this.#propertyContext = context;
            }).asPromise({ preventTimeout: true }),
            this.consumeContext(UMB_CONTENT_WORKSPACE_CONTEXT, (context) => {
                this.#workspaceContext = context;
            }).asPromise({ preventTimeout: true }),
        ]);
    }

    override async execute() {
        await this.#init;

        if (!this.#propertyContext) {
            throw new Error('Property context is not available');
        }

        const meta = this.args.meta;
        if (!meta) {
            throw new Error('Property action meta is not available');
        }

        try {
            const result = await umbOpenModal(this, UAI_PROMPT_PREVIEW_MODAL, {
                data: {
                    promptUnique: meta.promptUnique,
                    promptName: meta.label,
                    promptDescription: meta.promptDescription,
                    // Pass entity context from workspace and property for server-side execution
                    entityId: this.#workspaceContext?.getUnique() ?? undefined,
                    entityType: this.#workspaceContext?.getEntityType() ?? undefined,
                    propertyAlias: this.#propertyContext.getAlias(),
                    culture: this.#propertyContext.getVariantId?.()?.culture ?? undefined,
                    segment: this.#propertyContext.getVariantId?.()?.segment ?? undefined,
                },
            });

            if (result.action === 'insert' && result.content) {
                this.#propertyContext.setValue(result.content);
            }
        } catch {
            // Modal was rejected/cancelled - do nothing
        }
    }
}

export { UaiPromptInsertPropertyAction as api };
