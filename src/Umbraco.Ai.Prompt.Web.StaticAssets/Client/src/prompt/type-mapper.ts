import type { PromptResponseModel, PromptItemResponseModel, VisibilityModel } from "../api/types.gen.js";
import { UAI_PROMPT_ENTITY_TYPE } from "./constants.js";
import type { UaiPromptVisibility, UaiVisibilityRule } from "./property-actions/types.js";
import type { UaiPromptDetailModel, UaiPromptItemModel } from "./types.js";

/**
 * Maps API visibility model to internal visibility model.
 */
function mapVisibilityFromApi(apiVisibility: VisibilityModel | null | undefined): UaiPromptVisibility | null {
    if (!apiVisibility) return null;

    return {
        showRules: (apiVisibility.showRules ?? []).map(mapVisibilityRuleFromApi),
        hideRules: (apiVisibility.hideRules ?? []).map(mapVisibilityRuleFromApi),
    };
}

function mapVisibilityRuleFromApi(rule: { propertyEditorUiAliases?: string[] | null; propertyAliases?: string[] | null; documentTypeAliases?: string[] | null }): UaiVisibilityRule {
    return {
        propertyEditorUiAliases: rule.propertyEditorUiAliases ?? null,
        propertyAliases: rule.propertyAliases ?? null,
        documentTypeAliases: rule.documentTypeAliases ?? null,
    };
}

/**
 * Maps internal visibility model to API visibility model.
 */
function mapVisibilityToApi(visibility: UaiPromptVisibility | null): VisibilityModel | null {
    if (!visibility) return null;

    return {
        showRules: visibility.showRules.map(rule => ({
            propertyEditorUiAliases: rule.propertyEditorUiAliases,
            propertyAliases: rule.propertyAliases,
            documentTypeAliases: rule.documentTypeAliases,
        })),
        hideRules: visibility.hideRules.map(rule => ({
            propertyEditorUiAliases: rule.propertyEditorUiAliases,
            propertyAliases: rule.propertyAliases,
            documentTypeAliases: rule.documentTypeAliases,
        })),
    };
}

export const UaiPromptTypeMapper = {
    toDetailModel(response: PromptResponseModel): UaiPromptDetailModel {
        return {
            unique: response.id,
            entityType: UAI_PROMPT_ENTITY_TYPE,
            alias: response.alias,
            name: response.name,
            description: response.description ?? null,
            content: response.content,
            profileId: response.profileId ?? null,
            tags: response.tags ?? [],
            visibility: mapVisibilityFromApi(response.visibility),
            isActive: response.isActive,
        };
    },

    toItemModel(response: PromptItemResponseModel): UaiPromptItemModel {
        return {
            unique: response.id,
            entityType: UAI_PROMPT_ENTITY_TYPE,
            alias: response.alias,
            name: response.name,
            description: response.description ?? null,
            isActive: response.isActive,
        };
    },

    toCreateRequest(model: UaiPromptDetailModel) {
        return {
            alias: model.alias,
            name: model.name,
            content: model.content,
            description: model.description,
            profileId: model.profileId,
            tags: model.tags,
            visibility: mapVisibilityToApi(model.visibility),
        };
    },

    toUpdateRequest(model: UaiPromptDetailModel) {
        return {
            alias: model.alias,
            name: model.name,
            content: model.content,
            description: model.description,
            profileId: model.profileId,
            tags: model.tags,
            visibility: mapVisibilityToApi(model.visibility),
            isActive: model.isActive,
        };
    },
};
