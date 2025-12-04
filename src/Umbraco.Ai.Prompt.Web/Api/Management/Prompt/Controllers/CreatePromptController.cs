using Asp.Versioning;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Umbraco.Ai.Prompt.Core.Prompts;
using Umbraco.Ai.Prompt.Web.Api.Management.Prompt.Models;

namespace Umbraco.Ai.Prompt.Web.Api.Management.Prompt.Controllers;

/// <summary>
/// Controller for creating prompts.
/// </summary>
[ApiVersion("1.0")]
public class CreatePromptController : PromptControllerBase
{
    private readonly IAiPromptService _aiPromptService;

    /// <summary>
    /// Creates a new instance of the controller.
    /// </summary>
    public CreatePromptController(IAiPromptService aiPromptService)
    {
        _aiPromptService = aiPromptService;
    }

    /// <summary>
    /// Creates a new prompt.
    /// </summary>
    /// <param name="model">The prompt creation request.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>The created prompt.</returns>
    [HttpPost]
    [MapToApiVersion("1.0")]
    [ProducesResponseType(typeof(PromptResponseModel), StatusCodes.Status201Created)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status409Conflict)]
    [ProducesResponseType(typeof(ValidationProblemDetails), StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> CreatePrompt(
        [FromBody] CreatePromptRequestModel model,
        CancellationToken cancellationToken = default)
    {
        if (await _aiPromptService.AliasExistsAsync(model.Alias, cancellationToken: cancellationToken))
        {
            return AliasAlreadyExists(model.Alias);
        }

        var prompt = await _aiPromptService.CreateAsync(
            model.Alias,
            model.Name,
            model.Content,
            model.Description,
            model.ProfileId,
            model.Tags,
            cancellationToken);

        var response = new PromptResponseModel
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
        };

        return CreatedAtAction(
            nameof(ByIdOrAliasPromptController.GetPromptByIdOrAlias),
            "ByIdOrAliasPrompt",
            new { promptIdOrAlias = prompt.Id },
            response);
    }
}
