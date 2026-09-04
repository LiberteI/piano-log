using System.Text.RegularExpressions;
using MongoDB.Driver;
using PianoLog.Api.Models;

namespace PianoLog.Api.Scripts;

public static class ArchivedPracticeLogImporter
{
    private static readonly Regex DateFileName = new(@"^\d{4}-\d{2}-\d{2}$", RegexOptions.Compiled);
    private static readonly Regex TotalTime = new(@"^\*\*Total time:\*\*\s*~?\s*(\d+)\s*min", RegexOptions.Multiline | RegexOptions.IgnoreCase | RegexOptions.Compiled);
    private static readonly Regex Heading = new(@"^####\s+(?<title>.+?)\s*$", RegexOptions.Multiline | RegexOptions.Compiled);
    private static readonly Regex CheckedItem = new(@"^-\s+\[x\]\s+(.+)$", RegexOptions.Multiline | RegexOptions.IgnoreCase | RegexOptions.Compiled);

    public static async Task<ArchiveImportResult> ImportAsync(
        IMongoCollection<PracticeLogDocument> practiceLogs,
        string archiveDirectory,
        CancellationToken cancellationToken = default)
    {
        if (!Directory.Exists(archiveDirectory))
            throw new DirectoryNotFoundException($"Archived Markdown directory was not found: {archiveDirectory}");

        var archivedLogs = Directory.EnumerateFiles(archiveDirectory, "*.md", SearchOption.AllDirectories)
            .Where(path => DateFileName.IsMatch(Path.GetFileNameWithoutExtension(path)))
            .OrderBy(path => path, StringComparer.Ordinal)
            .Select(ParseArchiveFile)
            .ToList();

        var archivedDates = archivedLogs.Select(log => log.PracticeDate).ToList();
        var existingDates = await practiceLogs
            .Find(Builders<PracticeLogDocument>.Filter.In(log => log.PracticeDate, archivedDates))
            .Project(log => log.PracticeDate)
            .ToListAsync(cancellationToken);
        var existingDateSet = existingDates.ToHashSet(StringComparer.Ordinal);
        var logsToImport = archivedLogs.Where(log => !existingDateSet.Contains(log.PracticeDate)).ToList();

        if (logsToImport.Count > 0)
            await practiceLogs.InsertManyAsync(logsToImport, cancellationToken: cancellationToken);

        return new ArchiveImportResult(logsToImport.Count, archivedLogs.Count - logsToImport.Count);
    }

    private static PracticeLogDocument ParseArchiveFile(string path)
    {
        var practiceDate = Path.GetFileNameWithoutExtension(path);
        if (!DateOnly.TryParseExact(practiceDate, "yyyy-MM-dd", out _))
            throw new InvalidDataException($"Archive filename is not a valid date: {path}");

        var markdown = File.ReadAllText(path);
        var totalTimeMatch = TotalTime.Match(markdown);
        if (!totalTimeMatch.Success || !int.TryParse(totalTimeMatch.Groups[1].Value, out var totalMinutes) || totalMinutes <= 0)
            throw new InvalidDataException($"Archive log has no valid total time: {path}");

        var sections = GetSections(markdown);
        var fundamentals = ParseFundamentals(sections.GetValueOrDefault("fundamentals"));
        var pieces = new[]
            {
                ParsePiece(sections.GetValueOrDefault("hanon"), "Hanon"),
                ParsePiece(sections.GetValueOrDefault("etude"), "Etude"),
                ParsePiece(sections.GetValueOrDefault("repertoire"), "Repertoire"),
            }
            .OfType<PieceLogItem>()
            .ToList();

        return new PracticeLogDocument
        {
            PracticeDate = practiceDate,
            PracticeTime = new PracticeTime(totalMinutes / 60, totalMinutes % 60),
            Fundamentals = fundamentals,
            Pieces = pieces,
            Reflection = ParseReflection(
                sections.GetValueOrDefault("today's win"),
                sections.GetValueOrDefault("tomorrow's focus")),
            ArchiveMarkdown = markdown,
            CreatedAtUtc = DateTime.UtcNow,
        };
    }

    private static Dictionary<string, string> GetSections(string markdown)
    {
        var headings = Heading.Matches(markdown);
        var sections = new Dictionary<string, string>(StringComparer.OrdinalIgnoreCase);

        for (var index = 0; index < headings.Count; index++)
        {
            var start = headings[index].Index + headings[index].Length;
            var end = index + 1 < headings.Count ? headings[index + 1].Index : markdown.Length;
            sections[headings[index].Groups["title"].Value.Trim().ToLowerInvariant()] = markdown[start..end].Trim();
        }

        return sections;
    }

    private static List<FundamentalLogItem> ParseFundamentals(string? section)
    {
        if (string.IsNullOrWhiteSpace(section)) return [];

        var types = CheckedItem.Matches(section).Select(match => match.Groups[1].Value.Trim()).ToList();
        var entries = new List<FundamentalLogItem>();
        var fields = new Dictionary<string, string?>(StringComparer.OrdinalIgnoreCase);

        foreach (var line in section.Split('\n'))
        {
            var (label, value) = ParseField(line);
            if (label is null) continue;

            if (label == "key" && fields.Count > 0)
            {
                entries.Add(ToFundamental(fields, types));
                fields.Clear();
            }

            if (label is "key" or "bpm" or "problem" or "time") fields[label] = value;
        }

        if (fields.Count > 0) entries.Add(ToFundamental(fields, types));
        if (entries.Count == 0 && types.Count > 0)
            entries.Add(new FundamentalLogItem(null, null, null, null, types));

        return entries;
    }

    private static FundamentalLogItem ToFundamental(IReadOnlyDictionary<string, string?> fields, List<string> types) => new(
        fields.GetValueOrDefault("key"),
        ParseFirstInteger(fields.GetValueOrDefault("bpm")),
        ParseFirstInteger(fields.GetValueOrDefault("time")),
        fields.GetValueOrDefault("problem"),
        types.Count > 0 ? types : null);

    private static PieceLogItem? ParsePiece(string? section, string category)
    {
        if (string.IsNullOrWhiteSpace(section)) return null;

        var fields = section.Split('\n')
            .Select(ParseField)
            .Where(field => field.Label is not null)
            .ToDictionary(field => field.Label!, field => field.Value, StringComparer.OrdinalIgnoreCase);

        var name = fields.GetValueOrDefault("piece");
        var bpm = ParseFirstInteger(fields.GetValueOrDefault("bpm"));
        var time = ParseFirstInteger(fields.GetValueOrDefault("time of focus"));
        var problem = fields.GetValueOrDefault("problem");
        var techniqueFocus = fields.GetValueOrDefault("technique focus");
        var sectionPracticed = fields.GetValueOrDefault("section practiced");
        var note = fields.GetValueOrDefault("note");

        return name is null && bpm is null && time is null && problem is null && techniqueFocus is null && sectionPracticed is null && note is null
            ? null
            : new PieceLogItem(name, bpm, time, problem, category, techniqueFocus, sectionPracticed, note);
    }

    private static ReflectionLogItem? ParseReflection(string? todaysWin, string? tomorrowsFocus)
    {
        var win = CleanReflection(todaysWin);
        var focus = CleanReflection(tomorrowsFocus);
        return win is null && focus is null ? null : new ReflectionLogItem(win, focus);
    }

    private static string? CleanReflection(string? section)
    {
        if (string.IsNullOrWhiteSpace(section)) return null;
        var lines = section.Split('\n')
            .Select(line => line.Trim().TrimStart('>').Trim())
            .Where(line => !string.IsNullOrWhiteSpace(line) && !line.StartsWith("(one thing", StringComparison.OrdinalIgnoreCase));
        var value = string.Join('\n', lines).Trim();
        return value.Length == 0 ? null : value;
    }

    private static (string? Label, string? Value) ParseField(string line)
    {
        var trimmed = line.Trim();
        if (!trimmed.StartsWith("-", StringComparison.Ordinal)) return (null, null);
        var colonIndex = trimmed.IndexOf(':');
        if (colonIndex < 0) return (null, null);

        var label = trimmed[1..colonIndex].Replace("*", string.Empty).Trim().ToLowerInvariant();
        var value = CleanValue(trimmed[(colonIndex + 1)..]);
        return (label, value);
    }

    private static string? CleanValue(string value)
    {
        var cleaned = value.Trim().TrimStart('*', ':').Trim();
        return string.IsNullOrWhiteSpace(cleaned) ? null : cleaned;
    }

    private static int? ParseFirstInteger(string? value)
    {
        var match = value is null ? Match.Empty : Regex.Match(value, @"\d+");
        return match.Success && int.TryParse(match.Value, out var number) ? number : null;
    }
}

public sealed record ArchiveImportResult(int Imported, int Skipped);
