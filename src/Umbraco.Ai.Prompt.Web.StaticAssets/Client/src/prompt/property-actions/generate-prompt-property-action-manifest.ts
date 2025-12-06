import type { ManifestPropertyAction } from '@umbraco-cms/backoffice/property-action';
import { TEXT_BASED_PROPERTY_EDITOR_UIS, UAI_PROMPT_PROPERTY_ACTION_PREFIX, UAI_PROMPT_VISIBILITY_CONDITION_ALIAS } from './constants.js';
import type { UaiPromptRegistrationModel, UaiPromptPropertyActionMeta } from './types.js';
import type { UaiPromptVisibilityConditionConfig } from './prompt-visibility.condition.js';

/**
 * Gets the property editor UIs that a prompt should appear on based on its visibility.
 * This is used for initial filtering - detailed filtering by doc type and property alias
 * is handled by the visibility condition.
 */
function getPropertyEditorUisForVisibility(prompt: UaiPromptRegistrationModel): string[] {
    // If no visibility, prompt doesn't appear anywhere
    if (!prompt.visibility) {
        return [];
    }

    // If no show rules, prompt doesn't appear anywhere
    if (prompt.visibility.showRules.length === 0) {
        return [];
    }

    // Collect all property editor UI aliases from show rules
    const editorAliases = new Set<string>();
    for (const rule of prompt.visibility.showRules) {
        if (rule.propertyEditorUiAliases && rule.propertyEditorUiAliases.length > 0) {
            rule.propertyEditorUiAliases.forEach((alias) => editorAliases.add(alias));
        }
    }

    // If no specific editors defined, the visibility applies to all text-based editors
    // (filtered further by document type or property alias via the condition)
    if (editorAliases.size === 0) {
        return [...TEXT_BASED_PROPERTY_EDITOR_UIS];
    }

    return Array.from(editorAliases);
}

/**
 * Generates a property action manifest for a prompt.
 * The manifest registers a property action that will appear based on visibility configuration.
 *
 * Uses a combination of:
 * - forPropertyEditorUis: Initial filtering by property editor type
 * - conditions: Full visibility filtering including document type and property alias
 */
export function generatePromptPropertyActionManifest(
    prompt: UaiPromptRegistrationModel,
    weight: number = 100
): ManifestPropertyAction<UaiPromptPropertyActionMeta> | null {
    const propertyEditorUis = getPropertyEditorUisForVisibility(prompt);

    // If no property editors to show on, don't create a manifest
    if (propertyEditorUis.length === 0) {
        return null;
    }

    return {
        type: 'propertyAction',
        kind: 'default',
        alias: `${UAI_PROMPT_PROPERTY_ACTION_PREFIX}.${prompt.alias}`,
        name: `Insert Prompt: ${prompt.name}`,
        forPropertyEditorUis: propertyEditorUis,
        api: () => import('./prompt-insert.property-action.js'),
        weight,
        meta: {
            icon: "icon-wand",
            label: prompt.name,
            promptUnique: prompt.unique,
            promptDescription: prompt.description,
            promptVisibility: prompt.visibility,
        },
        conditions: [
            {
                alias: UAI_PROMPT_VISIBILITY_CONDITION_ALIAS,
                visibility: prompt.visibility,
            } as UaiPromptVisibilityConditionConfig,
        ],
    };
}
