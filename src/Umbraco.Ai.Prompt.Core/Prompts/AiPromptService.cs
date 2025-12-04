using Umbraco.Cms.Core.Models;

namespace Umbraco.Ai.Prompt.Core.Prompts;

/// <summary>
/// Service implementation for prompt management operations.
/// </summary>
internal sealed class AiPromptService : IAiPromptService
{
    private readonly IAiPromptRepository _repository;

    public AiPromptService(IAiPromptRepository repository)
    {
        _repository = repository;
    }

    /// <inheritdoc />
    public Task<AiPrompt?> GetAsync(Guid id, CancellationToken cancellationToken = default)
        => _repository.GetByIdAsync(id, cancellationToken);

    /// <inheritdoc />
    public Task<AiPrompt?> GetByAliasAsync(string alias, CancellationToken cancellationToken = default)
        => _repository.GetByAliasAsync(alias, cancellationToken);

    /// <inheritdoc />
    public Task<IEnumerable<AiPrompt>> GetAllAsync(CancellationToken cancellationToken = default)
        => _repository.GetAllAsync(cancellationToken);

    /// <inheritdoc />
    public Task<PagedModel<AiPrompt>> GetPagedAsync(
        int skip,
        int take,
        string? filter = null,
        Guid? profileId = null,
        CancellationToken cancellationToken = default)
        => _repository.GetPagedAsync(skip, take, filter, profileId, cancellationToken);

    /// <inheritdoc />
    public async Task<AiPrompt> SavePromptAsync(AiPrompt prompt, CancellationToken cancellationToken = default)
    {
        ArgumentNullException.ThrowIfNull(prompt);
        ArgumentException.ThrowIfNullOrWhiteSpace(prompt.Alias);
        ArgumentException.ThrowIfNullOrWhiteSpace(prompt.Name);
        ArgumentException.ThrowIfNullOrWhiteSpace(prompt.Content);

        // Generate new ID if needed
        if (prompt.Id == Guid.Empty)
        {
            prompt = new AiPrompt
            {
                Id = Guid.NewGuid(),
                Alias = prompt.Alias,
                Name = prompt.Name,
                Content = prompt.Content,
                Description = prompt.Description,
                ProfileId = prompt.ProfileId,
                Tags = prompt.Tags,
                IsActive = prompt.IsActive,
                DateCreated = prompt.DateCreated,
                DateModified = prompt.DateModified
            };
        }

        // Check for alias uniqueness
        var existingByAlias = await _repository.GetByAliasAsync(prompt.Alias, cancellationToken);
        if (existingByAlias is not null && existingByAlias.Id != prompt.Id)
        {
            throw new InvalidOperationException($"A prompt with alias '{prompt.Alias}' already exists.");
        }

        // Update timestamp
        prompt.DateModified = DateTime.UtcNow;

        return await _repository.SaveAsync(prompt, cancellationToken);
    }

    /// <inheritdoc />
    public Task<bool> DeleteAsync(Guid id, CancellationToken cancellationToken = default)
        => _repository.DeleteAsync(id, cancellationToken);

    /// <inheritdoc />
    public Task<bool> AliasExistsAsync(string alias, Guid? excludeId = null, CancellationToken cancellationToken = default)
        => _repository.AliasExistsAsync(alias, excludeId, cancellationToken);
}
