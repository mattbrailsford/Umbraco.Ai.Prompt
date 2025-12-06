import type { UaiPromptVisibility, UaiVisibilityRule } from './types.js';

/**
 * Context information available when determining if a prompt should appear.
 */
export interface PropertyActionContext {
    /** The property editor UI alias (e.g., 'Umb.PropertyEditorUi.TextBox'). */
    propertyEditorUiAlias: string;
    /** The property alias (e.g., 'pageTitle'). */
    propertyAlias: string;
    /** The document type aliases including compositions (e.g., ['article', 'seoMixin']). */
    documentTypeAliases: string[];
}

/**
 * Determines if a prompt should appear for the given context.
 *
 * Logic:
 * - No visibility or empty showRules = don't show (hidden by default)
 * - If any hideRule matches = don't show
 * - If any showRule matches = show
 */
export function shouldShowPrompt(
    visibility: UaiPromptVisibility | null,
    context: PropertyActionContext
): boolean {
    // No visibility = doesn't appear anywhere (hidden by default)
    if (!visibility) {
        return false;
    }

    // No show rules = doesn't appear anywhere
    if (visibility.showRules.length === 0) {
        return false;
    }

    // Check hide rules first (hide takes precedence)
    if (visibility.hideRules.length > 0) {
        const isHidden = visibility.hideRules.some((ruleSet) => matchesRule(ruleSet, context));
        if (isHidden) {
            return false;
        }
    }

    // Check show rules (OR logic between rules)
    return visibility.showRules.some((rule) => matchesRule(rule, context));
}

/**
 * Checks if a single rule matches the context.
 * All non-null/non-empty properties must match (AND logic between properties).
 * For array properties, any value matching = that property matches (OR within array).
 */
function matchesRule(rule: UaiVisibilityRule, context: PropertyActionContext): boolean {
    // Check property editor UI alias
    if (rule.propertyEditorUiAliases && rule.propertyEditorUiAliases.length > 0) {
        if (!rule.propertyEditorUiAliases.includes(context.propertyEditorUiAlias)) {
            return false;
        }
    }

    // Check property alias
    if (rule.propertyAliases && rule.propertyAliases.length > 0) {
        if (!rule.propertyAliases.includes(context.propertyAlias)) {
            return false;
        }
    }

    // Check document type alias (match if any context alias is in the rule's aliases)
    if (rule.documentTypeAliases && rule.documentTypeAliases.length > 0) {
        const hasMatch = context.documentTypeAliases.some((alias) => rule.documentTypeAliases!.includes(alias));
        if (!hasMatch) {
            return false;
        }
    }

    return true;
}
