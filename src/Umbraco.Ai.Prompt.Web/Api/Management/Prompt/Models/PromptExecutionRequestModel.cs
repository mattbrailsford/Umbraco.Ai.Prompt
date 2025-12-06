namespace Umbraco.Ai.Prompt.Web.Api.Management.Prompt.Models;

/// <summary>
/// Request model for prompt execution.
/// </summary>
public class PromptExecutionRequestModel
{
    /// <summary>
    /// The entity ID for context.
    /// </summary>
    public Guid? EntityId { get; init; }

    /// <summary>
    /// The entity type (e.g., "document", "media").
    /// </summary>
    public string? EntityType { get; init; }

    /// <summary>
    /// The property alias being edited.
    /// </summary>
    public string? PropertyAlias { get; init; }

    /// <summary>
    /// The culture variant.
    /// </summary>
    public string? Culture { get; init; }

    /// <summary>
    /// The segment variant.
    /// </summary>
    public string? Segment { get; init; }

    /// <summary>
    /// Local content model for snapshot (future use).
    /// </summary>
    public IReadOnlyDictionary<string, object?>? LocalContent { get; init; }

    /// <summary>
    /// Additional context variables.
    /// </summary>
    public IReadOnlyDictionary<string, object?>? Context { get; init; }
}
