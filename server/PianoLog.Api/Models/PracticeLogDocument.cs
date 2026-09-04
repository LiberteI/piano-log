using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;

namespace PianoLog.Api.Models;

public sealed class PracticeLogDocument
{
    [BsonId]
    public ObjectId Id { get; set; }

    public required string PracticeDate { get; init; }
    public required PracticeTime PracticeTime { get; init; }
    public required List<FundamentalLogItem> Fundamentals { get; init; }
    public required List<PieceLogItem> Pieces { get; init; }
    public ReflectionLogItem? Reflection { get; init; }
    public string? ArchiveMarkdown { get; init; }
    public DateTime CreatedAtUtc { get; init; }

    public static PracticeLogDocument FromRequest(CreatePracticeLogRequest request) => new()
    {
        PracticeDate = request.PracticeDate,
        PracticeTime = request.PracticeTime,
        Fundamentals = request.Fundamentals ?? [],
        Pieces = request.Pieces ?? [],
        Reflection = request.Reflection,
        CreatedAtUtc = DateTime.UtcNow,
    };
}

public sealed record CreatePracticeLogRequest(
    string PracticeDate,
    PracticeTime PracticeTime,
    List<FundamentalLogItem>? Fundamentals,
    List<PieceLogItem>? Pieces,
    ReflectionLogItem? Reflection);

public sealed record PracticeTime(int Hours, int Minutes);

public sealed record FundamentalLogItem(
    string? Key,
    int? Bpm,
    int? TimeOfFocusMinutes,
    string? Problem,
    List<string>? Types = null);

public sealed record PieceLogItem(
    string? Name,
    int? Bpm,
    int? TimeOfFocusMinutes,
    string? Problem,
    string? Category = null,
    string? TechniqueFocus = null,
    string? SectionPracticed = null,
    string? Note = null);

public sealed record ReflectionLogItem(string? TodaysWin, string? TomorrowsFocus);
