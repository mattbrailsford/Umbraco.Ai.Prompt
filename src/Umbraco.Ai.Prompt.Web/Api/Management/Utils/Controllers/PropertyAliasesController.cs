using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Umbraco.Cms.Core.Services;

namespace Umbraco.Ai.Prompt.Web.Api.Management.Utils.Controllers;

/// <summary>
/// Controller for retrieving property aliases.
/// </summary>
public class PropertyAliasesController : UtilsControllerBase
{
    private readonly IContentTypeService _contentTypeService;

    /// <summary>
    /// Initializes a new instance of the <see cref="PropertyAliasesController"/> class.
    /// </summary>
    public PropertyAliasesController(IContentTypeService contentTypeService)
    {
        _contentTypeService = contentTypeService;
    }

    /// <summary>
    /// Gets all property aliases, optionally filtered by a search query.
    /// </summary>
    /// <param name="query">Optional search query to filter aliases.</param>
    /// <returns>A list of property aliases.</returns>
    [HttpGet("property-aliases")]
    [ProducesResponseType<IEnumerable<string>>(StatusCodes.Status200OK)]
    public IActionResult GetPropertyAliases([FromQuery] string? query = null)
    {
        var allAliases = _contentTypeService.GetAllPropertyTypeAliases();

        if (!string.IsNullOrEmpty(query))
        {
            allAliases = allAliases.Where(a =>
                a.Contains(query, StringComparison.InvariantCultureIgnoreCase));
        }

        return Ok(allAliases.OrderBy(x => x).Take(20));
    }
}
