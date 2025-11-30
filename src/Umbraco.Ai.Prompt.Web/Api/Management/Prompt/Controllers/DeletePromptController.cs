using Asp.Versioning;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Umbraco.Ai.Prompt.Core.Prompts;
using Umbraco.Ai.Prompt.Extensions;
using Umbraco.Ai.Web.Api.Common.Models;

namespace Umbraco.Ai.Prompt.Web.Api.Management.Prompt.Controllers;

/// <summary>
/// Controller for deleting prompts.
/// </summary>
[ApiVersion("1.0")]
public class DeletePromptController : PromptControllerBase
{
    private readonly IPromptService _promptService;

    /// <summary>
    /// Creates a new instance of the controller.
    /// </summary>
    public DeletePromptController(IPromptService promptService)
    {
        _promptService = promptService;
    }

    /// <summary>
    /// Deletes a prompt.
    /// </summary>
    /// <param name="promptIdOrAlias">The prompt ID (GUID) or alias (string).</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>No content if successful.</returns>
    [HttpDelete($"{{{nameof(promptIdOrAlias)}}}")]
    [MapToApiVersion("1.0")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status404NotFound)]
    public async Task<IActionResult> Delete(
        IdOrAlias promptIdOrAlias,
        CancellationToken cancellationToken = default)
    {
        var promptId = await _promptService.TryGetPromptIdAsync(promptIdOrAlias, cancellationToken);
        if (promptId is null)
        {
            return PromptNotFound();
        }

        var deleted = await _promptService.DeleteAsync(promptId.Value, cancellationToken);
        if (!deleted)
        {
            return PromptNotFound();
        }

        return NoContent();
    }
}
