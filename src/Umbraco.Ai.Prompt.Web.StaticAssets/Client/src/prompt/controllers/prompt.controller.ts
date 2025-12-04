import { UmbControllerBase } from "@umbraco-cms/backoffice/class-api";
import type { UmbControllerHost } from "@umbraco-cms/backoffice/controller-api";
import { UaiChatController, type UaiChatMessage } from "@umbraco-ai/core";

/**
 * Options for prompt execution.
 */
export interface UaiPromptExecuteOptions {
    /** Optional profile ID or alias to use for the AI completion. */
    profileIdOrAlias?: string;
    /** Optional abort signal for cancellation. */
    signal?: AbortSignal;
}

/**
 * Result of prompt execution.
 */
export interface UaiPromptExecuteResult {
    /** The generated response content. */
    content: string;
}

/**
 * Controller for executing AI prompts.
 * Wraps the UaiChatController to provide a simpler API for prompt execution.
 * @public
 */
export class UaiPromptController extends UmbControllerBase {
    #chatController: UaiChatController;

    constructor(host: UmbControllerHost) {
        super(host);
        this.#chatController = new UaiChatController(this);
    }

    /**
     * Executes a prompt and returns the AI response.
     * @param promptContent - The prompt content to execute.
     * @param options - Optional configuration (profile ID/alias, abort signal).
     * @returns The AI response content or error.
     */
    async execute(
        promptContent: string,
        options?: UaiPromptExecuteOptions
    ): Promise<{ data?: UaiPromptExecuteResult; error?: Error }> {
        const messages: UaiChatMessage[] = [
            { role: 'user', content: promptContent }
        ];

        try {
            const { data, error } = await this.#chatController.complete(messages, {
                profileIdOrAlias: options?.profileIdOrAlias,
                signal: options?.signal,
            });

            if (error) {
                return {
                    error: error instanceof Error
                        ? error
                        : new Error('Failed to execute prompt')
                };
            }

            if (data) {
                return {
                    data: { content: data.message.content }
                };
            }

            return { error: new Error('No response received') };
        } catch (err) {
            if ((err as Error)?.name === 'AbortError') {
                return { error: err as Error };
            }
            return {
                error: err instanceof Error
                    ? err
                    : new Error('Failed to execute prompt')
            };
        }
    }
}
