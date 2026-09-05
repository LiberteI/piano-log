using Google.Apis.Auth;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;
using MongoDB.Driver;
using PianoLog.Api.Models;
using PianoLog.Api.Scripts;
using System.Globalization;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using System.Text.Json;

var builder = WebApplication.CreateBuilder(args);
const string jwtIssuer = "PianoLog.Api";
const string jwtAudience = "PianoLog.Client";

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

var googleClientId = builder.Configuration["Google:ClientId"]
    ?? builder.Configuration["GOOGLE_CLIENT_ID"]
    ?? throw new InvalidOperationException("Google:ClientId is required.");
var allowedEmail = builder.Configuration["Google:AllowedEmail"]
    ?? builder.Configuration["GOOGLE_ALLOWED_EMAIL"]
    ?? throw new InvalidOperationException("Google:AllowedEmail is required.");
var jwtSigningKey = builder.Configuration["Jwt:SigningKey"]
    ?? builder.Configuration["JWT_SIGNING_KEY"]
    ?? throw new InvalidOperationException("Jwt:SigningKey is required.");
if (jwtSigningKey.Length < 32)
{
    throw new InvalidOperationException("Jwt:SigningKey must be at least 32 characters.");
}

var signingKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtSigningKey));
builder.Services
    .AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuerSigningKey = true,
            IssuerSigningKey = signingKey,
            ValidateIssuer = true,
            ValidIssuer = jwtIssuer,
            ValidateAudience = true,
            ValidAudience = jwtAudience,
            ValidateLifetime = true,
            ClockSkew = TimeSpan.FromMinutes(1),
        };
    });
builder.Services.AddAuthorization();

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
app.UseAuthentication();
app.UseAuthorization();

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

app.MapPost("/api/auth/google", async (GoogleCredentialRequest request) =>
{
    if (string.IsNullOrWhiteSpace(request.Credential)) return Results.Unauthorized();

    GoogleJsonWebSignature.Payload googleIdentity;
    try
    {
        googleIdentity = await GoogleJsonWebSignature.ValidateAsync(
            request.Credential,
            new GoogleJsonWebSignature.ValidationSettings { Audience = [googleClientId] });
    }
    catch (InvalidJwtException)
    {
        return Results.Unauthorized();
    }

    if (!googleIdentity.EmailVerified ||
        !string.Equals(googleIdentity.Email, allowedEmail, StringComparison.OrdinalIgnoreCase))
    {
        return Results.Forbid();
    }

    var expiresAtUtc = DateTime.UtcNow.AddHours(8);
    var token = new JwtSecurityToken(
        issuer: jwtIssuer,
        audience: jwtAudience,
        claims:
        [
            new Claim(JwtRegisteredClaimNames.Sub, googleIdentity.Subject),
            new Claim(JwtRegisteredClaimNames.Email, googleIdentity.Email),
        ],
        notBefore: DateTime.UtcNow,
        expires: expiresAtUtc,
        signingCredentials: new SigningCredentials(signingKey, SecurityAlgorithms.HmacSha256));

    return Results.Ok(new
    {
        accessToken = new JwtSecurityTokenHandler().WriteToken(token),
        expiresAtUtc,
    });
});

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
}).RequireAuthorization();

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
}).RequireAuthorization();

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
}).RequireAuthorization();

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
}).RequireAuthorization();

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
}).RequireAuthorization();

app.MapDelete("/api/logs/{practiceDate}", async (string practiceDate, CancellationToken cancellationToken) =>
{
    var result = await practiceLogs.DeleteOneAsync(log => log.PracticeDate == practiceDate, cancellationToken);
    return result.DeletedCount == 0 ? Results.NotFound() : Results.NoContent();
}).RequireAuthorization();

app.Run();

sealed record GoogleCredentialRequest(string Credential);
