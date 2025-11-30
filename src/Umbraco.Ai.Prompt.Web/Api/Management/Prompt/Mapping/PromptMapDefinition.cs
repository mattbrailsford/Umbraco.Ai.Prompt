using Umbraco.Ai.Prompt.Web.Api.Management.Prompt.Models;
using Umbraco.Cms.Core.Mapping;

namespace Umbraco.Ai.Prompt.Web.Api.Management.Prompt.Mapping;

/// <summary>
/// UmbracoMapper definitions for prompt models.
/// </summary>
public class PromptMapDefinition : IMapDefinition
{
    /// <inheritdoc />
    public void DefineMaps(IUmbracoMapper mapper)
    {
        mapper.Define<Core.Prompts.Prompt, PromptResponseModel>((_, _) => new PromptResponseModel(), Map);
        mapper.Define<Core.Prompts.Prompt, PromptItemResponseModel>((_, _) => new PromptItemResponseModel(), MapItem);
    }

    // Umbraco.Code.MapAll
    private static void Map(Core.Prompts.Prompt source, PromptResponseModel target, MapperContext context)
    {
        target.Id = source.Id;
        target.Alias = source.Alias;
        target.Name = source.Name;
        target.Description = source.Description;
        target.Content = source.Content;
        target.ProfileId = source.ProfileId;
        target.Tags = source.Tags;
        target.IsActive = source.IsActive;
        target.DateCreated = source.DateCreated;
        target.DateModified = source.DateModified;
    }

    // Umbraco.Code.MapAll
    private static void MapItem(Core.Prompts.Prompt source, PromptItemResponseModel target, MapperContext context)
    {
        target.Id = source.Id;
        target.Alias = source.Alias;
        target.Name = source.Name;
        target.Description = source.Description;
        target.ProfileId = source.ProfileId;
        target.IsActive = source.IsActive;
    }
}
