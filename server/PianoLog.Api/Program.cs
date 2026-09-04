using MongoDB.Driver;
using PianoLog.Api.Models;
using PianoLog.Api.Scripts;
using System.Globalization;
using System.Text.Json;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddOpenApi();
var clientOrigins = (builder.Configuration["ClientOrigin"] ?? "http://localhost:5173")
    .Split(',', StringSplitOptions.TrimEntries | StringSplitOptions.RemoveEmptyEntries);
builder.Services.AddCors(options =>
{
    options.AddPolicy("client", policy =>
        policy.WithOrigins(clientOrigins)
            .AllowAnyHeader()
            .AllowAnyMethod());
});

var connectionString = builder.Configuration.GetConnectionString("MongoDb")
    ?? throw new InvalidOperationException("ConnectionStrings:MongoDb is required.");

builder.Services.AddSingleton<IMongoClient>(_ => new MongoClient(connectionString));
builder.Services.AddSingleton<IMongoDatabase>(services =>
{
    var mongoUrl = MongoUrl.Create(connectionString);
    var mongoClient = services.GetRequiredService<IMongoClient>();
    return mongoClient.GetDatabase(mongoUrl.DatabaseName ?? "piano-log");
});

var app = builder.Build();

if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
}

app.UseCors("client");

var practiceLogs = app.Services.GetRequiredService<IMongoDatabase>()
    .GetCollection<PracticeLogDocument>("practiceLogs");

await practiceLogs.Indexes.CreateOneAsync(new CreateIndexModel<PracticeLogDocument>(
    Builders<PracticeLogDocument>.IndexKeys.Ascending(log => log.PracticeDate),
    new CreateIndexOptions { Name = "practice-date", Unique = true }));

if (args.Contains("--import-archive", StringComparer.Ordinal))
{
    var archiveDirectory = Path.GetFullPath(Path.Combine(
        app.Environment.ContentRootPath,
        "../../archive/markdown-workflow/logs"));
    var result = await ArchivedPracticeLogImporter.ImportAsync(practiceLogs, archiveDirectory);

    Console.WriteLine($"Archive import complete: {result.Imported} imported, {result.Skipped} skipped.");
    return;
}

app.MapGet("/api/health", () => Results.Ok(new { status = "ok" }))
    .WithName("GetHealth");

app.MapGet("/api/logs", async (CancellationToken cancellationToken) =>
{
    var logs = await practiceLogs
        .Find(Builders<PracticeLogDocument>.Filter.Empty)
        .Sort(Builders<PracticeLogDocument>.Sort.Descending(log => log.PracticeDate))
        .ToListAsync(cancellationToken);

    return Results.Ok(logs.Select(log => new
    {
        log.PracticeDate,
        log.PracticeTime,
        log.Fundamentals,
        log.Pieces,
        log.Reflection,
        log.ArchiveMarkdown,
    }));
});

app.MapGet("/api/exports/practice-days", async (CancellationToken cancellationToken) =>
{
    var practiceDays = await practiceLogs
        .Find(Builders<PracticeLogDocument>.Filter.Empty)
        .Sort(Builders<PracticeLogDocument>.Sort.Ascending(log => log.PracticeDate))
        .Project(log => new
        {
            date = log.PracticeDate,
            practiceTime = log.PracticeTime.Hours * 60 + log.PracticeTime.Minutes,
        })
        .ToListAsync(cancellationToken);

    var json = JsonSerializer.Serialize(practiceDays, new JsonSerializerOptions { WriteIndented = true });
    return Results.File(
        System.Text.Encoding.UTF8.GetBytes(json),
        contentType: "application/json",
        fileDownloadName: "practice-days.json");
});

app.MapGet("/api/logs/{practiceDate}", async (string practiceDate, CancellationToken cancellationToken) =>
{
    var log = await practiceLogs.Find(log => log.PracticeDate == practiceDate).FirstOrDefaultAsync(cancellationToken);
    return log is null ? Results.NotFound() : Results.Ok(new
    {
        log.PracticeDate,
        log.PracticeTime,
        log.Fundamentals,
        log.Pieces,
        log.Reflection,
    });
});

app.MapPost("/api/logs", async (CreatePracticeLogRequest request, CancellationToken cancellationToken) =>
{
    if (!DateOnly.TryParseExact(
            request.PracticeDate,
            "yyyy-MM-dd",
            CultureInfo.InvariantCulture,
            DateTimeStyles.None,
            out var practiceDate) || practiceDate > DateOnly.FromDateTime(DateTime.Today))
    {
        return Results.ValidationProblem(new Dictionary<string, string[]>
        {
            ["practiceDate"] = ["Practice date must be today or earlier."],
        });
    }

    if (request.PracticeTime is null ||
        request.PracticeTime.Hours is < 0 or > 12 ||
        request.PracticeTime.Minutes is < 0 or > 59 ||
        request.PracticeTime.Hours == 0 && request.PracticeTime.Minutes == 0)
    {
        return Results.ValidationProblem(new Dictionary<string, string[]>
        {
            ["practiceTime"] = ["Practice time must be greater than zero."],
        });
    }

    var log = PracticeLogDocument.FromRequest(request);

    try
    {
        await practiceLogs.InsertOneAsync(log, cancellationToken: cancellationToken);
    }
    catch (MongoWriteException exception) when (exception.WriteError?.Category == ServerErrorCategory.DuplicateKey)
    {
        return Results.Conflict(new { message = "A log already exists for this practice date." });
    }

    return Results.Created($"/api/logs/{log.Id}", new { id = log.Id.ToString(), log.PracticeDate });
});

app.MapPut("/api/logs/{originalPracticeDate}", async (
    string originalPracticeDate,
    CreatePracticeLogRequest request,
    CancellationToken cancellationToken) =>
{
    if (!DateOnly.TryParseExact(
            request.PracticeDate,
            "yyyy-MM-dd",
            CultureInfo.InvariantCulture,
            DateTimeStyles.None,
            out var practiceDate) || practiceDate > DateOnly.FromDateTime(DateTime.Today))
    {
        return Results.ValidationProblem(new Dictionary<string, string[]>
        {
            ["practiceDate"] = ["Practice date must be today or earlier."],
        });
    }

    if (request.PracticeTime is null ||
        request.PracticeTime.Hours is < 0 or > 12 ||
        request.PracticeTime.Minutes is < 0 or > 59 ||
        request.PracticeTime.Hours == 0 && request.PracticeTime.Minutes == 0)
    {
        return Results.ValidationProblem(new Dictionary<string, string[]>
        {
            ["practiceTime"] = ["Practice time must be greater than zero."],
        });
    }

    var existingLog = await practiceLogs
        .Find(log => log.PracticeDate == originalPracticeDate)
        .FirstOrDefaultAsync(cancellationToken);
    if (existingLog is null) return Results.NotFound();

    var updatedLog = PracticeLogDocument.FromRequest(request, existingLog.CreatedAtUtc, existingLog.ArchiveMarkdown);
    updatedLog.Id = existingLog.Id;

    try
    {
        await practiceLogs.ReplaceOneAsync(log => log.Id == existingLog.Id, updatedLog, cancellationToken: cancellationToken);
    }
    catch (MongoWriteException exception) when (exception.WriteError?.Category == ServerErrorCategory.DuplicateKey)
    {
        return Results.Conflict(new { message = "A log already exists for this practice date." });
    }

    return Results.Ok(new { updatedLog.PracticeDate });
});

app.MapDelete("/api/logs/{practiceDate}", async (string practiceDate, CancellationToken cancellationToken) =>
{
    var result = await practiceLogs.DeleteOneAsync(log => log.PracticeDate == practiceDate, cancellationToken);
    return result.DeletedCount == 0 ? Results.NotFound() : Results.NoContent();
});

app.Run();
