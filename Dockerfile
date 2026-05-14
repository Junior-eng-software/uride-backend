# 1. Etapa de construcción (Usa el SDK completo para compilar)
FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /app

# Copiamos todo el código de tu PC al servidor
COPY . ./

# Compilamos específicamente el proyecto API
RUN dotnet publish "URide.API/URide.API.csproj" -c Release -o out

# 2. Etapa de producción (Versión ligera solo para ejecutar)
FROM mcr.microsoft.com/dotnet/aspnet:8.0
WORKDIR /app
COPY --from=build /app/out .

# Le decimos a .NET que escuche en el puerto de Railway
ENV ASPNETCORE_URLS=http://+:8080
EXPOSE 8080

# Arrancamos el motor
ENTRYPOINT ["dotnet", "URide.API.dll"]