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
    private readonly IPromptService _promptService;

    /// <summary>
    /// Creates a new instance of the controller.
    /// </summary>
    public UpdatePromptController(IPromptService promptService)
    {
        _promptService = promptService;
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
    [ProducesResponseType(typeof(PromptResponseModel), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status404NotFound)]
    [ProducesResponseType(typeof(ValidationProblemDetails), StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> Update(
        IdOrAlias promptIdOrAlias,
        [FromBody] UpdatePromptRequestModel model,
        CancellationToken cancellationToken = default)
    {
        var promptId = await _promptService.TryGetPromptIdAsync(promptIdOrAlias, cancellationToken);
        if (promptId is null)
        {
            return PromptNotFound();
        }

        var prompt = await _promptService.UpdateAsync(
            promptId.Value,
            model.Name,
            model.Content,
            model.Description,
            model.ProfileId,
            model.Tags,
            model.IsActive,
            cancellationToken);

        if (prompt is null)
        {
            return PromptNotFound();
        }

        return Ok(new PromptResponseModel
        {
            Id = prompt.Id,
            Alias = prompt.Alias,
            Name = prompt.Name,
            Description = prompt.Description,
            Content = prompt.Content,
            ProfileId = prompt.ProfileId,
            Tags = prompt.Tags,
            IsActive = prompt.IsActive,
            DateCreated = prompt.DateCreated,
            DateModified = prompt.DateModified
        });
    }
}
