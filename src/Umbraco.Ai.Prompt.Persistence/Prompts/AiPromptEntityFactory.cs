using System.Text.Json;
using Umbraco.Ai.Prompt.Core.Prompts;

namespace Umbraco.Ai.Prompt.Persistence.Prompts;

/// <summary>
/// Factory for converting between <see cref="AiPrompt"/> domain model and <see cref="AiPromptEntity"/>.
/// </summary>
internal static class AiPromptEntityFactory
{
    private static readonly JsonSerializerOptions JsonOptions = new()
    {
        PropertyNamingPolicy = JsonNamingPolicy.CamelCase
    };

    /// <summary>
    /// Builds a domain model from an entity.
    /// </summary>
    public static Core.Prompts.AiPrompt BuildDomain(AiPromptEntity entity)
    {
        var tags = DeserializeTags(entity.Tags);
        var visibility = DeserializeVisibility(entity.VisibilityConfig);

        return new Core.Prompts.AiPrompt
        {
            Id = entity.Id,
            Alias = entity.Alias,
            Name = entity.Name,
            Description = entity.Description,
            Content = entity.Content,
            ProfileId = entity.ProfileId,
            Tags = tags,
            IsActive = entity.IsActive,
            Visibility = visibility,
            DateCreated = entity.DateCreated,
            DateModified = entity.DateModified
        };
    }

    /// <summary>
    /// Builds an entity from a domain model.
    /// </summary>
    public static AiPromptEntity BuildEntity(Core.Prompts.AiPrompt aiPrompt)
    {
        return new AiPromptEntity
        {
            Id = aiPrompt.Id,
            Alias = aiPrompt.Alias,
            Name = aiPrompt.Name,
            Description = aiPrompt.Description,
            Content = aiPrompt.Content,
            ProfileId = aiPrompt.ProfileId,
            Tags = SerializeTags(aiPrompt.Tags),
            IsActive = aiPrompt.IsActive,
            VisibilityConfig = SerializeVisibility(aiPrompt.Visibility),
            DateCreated = aiPrompt.DateCreated,
            DateModified = aiPrompt.DateModified
        };
    }

    /// <summary>
    /// Updates an existing entity from a domain model.
    /// </summary>
    public static void UpdateEntity(AiPromptEntity entity, Core.Prompts.AiPrompt aiPrompt)
    {
        entity.Alias = aiPrompt.Alias;
        entity.Name = aiPrompt.Name;
        entity.Description = aiPrompt.Description;
        entity.Content = aiPrompt.Content;
        entity.ProfileId = aiPrompt.ProfileId;
        entity.Tags = SerializeTags(aiPrompt.Tags);
        entity.IsActive = aiPrompt.IsActive;
        entity.VisibilityConfig = SerializeVisibility(aiPrompt.Visibility);
        entity.DateModified = aiPrompt.DateModified;
    }

    private static string? SerializeTags(IReadOnlyList<string> tags)
    {
        return tags.Count == 0 ? null : string.Join(',', tags);
    }

    private static IReadOnlyList<string> DeserializeTags(string? tags)
    {
        return string.IsNullOrWhiteSpace(tags) ? [] : tags.Split(',', StringSplitOptions.RemoveEmptyEntries | StringSplitOptions.TrimEntries);
    }

    private static string? SerializeVisibility(AiPromptVisibility? visibility)
    {
        if (visibility is null)
        {
            return null;
        }

        // Don't store empty visibility as JSON - treat as null
        if (visibility.ShowRules.Count == 0 && visibility.HideRules.Count == 0)
        {
            return null;
        }

        return JsonSerializer.Serialize(visibility, JsonOptions);
    }

    private static AiPromptVisibility? DeserializeVisibility(string? json)
    {
        if (string.IsNullOrWhiteSpace(json))
        {
            return null;
        }

        try
        {
            return JsonSerializer.Deserialize<AiPromptVisibility>(json, JsonOptions);
        }
        catch
        {
            return null;
        }
    }
}
