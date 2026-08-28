using MongoDB.Driver;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddOpenApi();
builder.Services.AddCors(options =>
{
    options.AddPolicy("client", policy =>
        policy.WithOrigins("http://localhost:5173")
            .AllowAnyHeader()
            .AllowAnyMethod());
});

var connectionString = builder.Configuration.GetConnectionString("MongoDb")
    ?? throw new InvalidOperationException("ConnectionStrings:MongoDb is required.");

builder.Services.AddSingleton<IMongoClient>(_ => new MongoClient(connectionString));

var app = builder.Build();

if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
}

app.UseCors("client");

app.MapGet("/api/health", () => Results.Ok(new { status = "ok" }))
    .WithName("GetHealth");

app.Run();
