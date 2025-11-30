using Asp.Versioning;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Umbraco.Ai.Prompt.Core.Prompts;
using Umbraco.Ai.Prompt.Extensions;
using Umbraco.Ai.Prompt.Web.Api.Management.Prompt.Models;
using Umbraco.Ai.Web.Api.Common.Models;

namespace Umbraco.Ai.Prompt.Web.Api.Management.Prompt.Controllers;

/// <summary>
/// Controller for retrieving a prompt by ID or alias.
/// </summary>
[ApiVersion("1.0")]
public class ByIdOrAliasPromptController : PromptControllerBase
{
    private readonly IPromptService _promptService;

    /// <summary>
    /// Creates a new instance of the controller.
    /// </summary>
    public ByIdOrAliasPromptController(IPromptService promptService)
    {
        _promptService = promptService;
    }

    /// <summary>
    /// Gets a prompt by its ID or alias.
    /// </summary>
    /// <param name="promptIdOrAlias">The prompt ID (GUID) or alias (string).</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>The prompt if found.</returns>
    [HttpGet($"{{{nameof(promptIdOrAlias)}}}")]
    [MapToApiVersion("1.0")]
    [ProducesResponseType(typeof(PromptResponseModel), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status404NotFound)]
    public async Task<IActionResult> GetPromptByIdOrAlias(
        IdOrAlias promptIdOrAlias,
        CancellationToken cancellationToken = default)
    {
        var prompt = await _promptService.GetPromptAsync(promptIdOrAlias, cancellationToken);
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
