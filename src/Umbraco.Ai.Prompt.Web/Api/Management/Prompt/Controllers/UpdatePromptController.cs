using Asp.Versioning;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Umbraco.Ai.Prompt.Core.Prompts;
using Umbraco.Ai.Prompt.Extensions;
using Umbraco.Ai.Prompt.Web.Api.Management.Prompt.Models;
using Umbraco.Ai.Web.Api.Common.Models;

namespace Umbraco.Ai.Prompt.Web.Api.Management.Prompt.Controllers;

/// <summary>
/// Controller for updating prompts.
/// </summary>
[ApiVersion("1.0")]
public class UpdatePromptController : PromptControllerBase
{
    private readonly IAiPromptService _aiPromptService;

    /// <summary>
    /// Creates a new instance of the controller.
    /// </summary>
    public UpdatePromptController(IAiPromptService aiPromptService)
    {
        _aiPromptService = aiPromptService;
    }

    /// <summary>
    /// Updates an existing prompt.
    /// </summary>
    /// <param name="promptIdOrAlias">The prompt ID (GUID) or alias (string).</param>
    /// <param name="model">The prompt update request.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>The updated prompt.</returns>
    [HttpPut($"{{{nameof(promptIdOrAlias)}}}")]
    [MapToApiVersion("1.0")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status404NotFound)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> UpdatePrompt(
        IdOrAlias promptIdOrAlias,
        [FromBody] UpdatePromptRequestModel model,
        CancellationToken cancellationToken = default)
    {
        var existing = await _aiPromptService.GetPromptAsync(promptIdOrAlias, cancellationToken);
        if (existing is null)
        {
            return PromptNotFound();
        }

        var prompt = new AiPrompt
        {
            Id = existing.Id,
            Alias = existing.Alias, // Alias cannot be changed after creation
            Name = model.Name,
            Content = model.Content,
            Description = model.Description,
            ProfileId = model.ProfileId,
            Tags = model.Tags?.ToList() ?? [],
            IsActive = model.IsActive,
            DateCreated = existing.DateCreated // Preserve original creation date
        };

        await _aiPromptService.SavePromptAsync(prompt, cancellationToken);
        return Ok();
    }
}
