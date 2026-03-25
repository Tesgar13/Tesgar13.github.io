param(
  [string]$BucketName = "tesgar13-private-media",
  [string]$ManifestPath = "private-assets-manifest.json"
)

$workspaceRoot = Split-Path -Parent $PSScriptRoot
$resolvedManifest = Join-Path $workspaceRoot $ManifestPath

if (-not (Test-Path $resolvedManifest)) {
  throw "No se ha encontrado el manifiesto: $resolvedManifest"
}

$items = Get-Content -Raw $resolvedManifest | ConvertFrom-Json

foreach ($item in $items) {
  $sourcePath = Join-Path $workspaceRoot $item.source

  if (-not (Test-Path $sourcePath)) {
    throw "Falta el fichero local: $sourcePath"
  }

  Write-Host "Subiendo $($item.source) -> $($item.key)"
  npx wrangler r2 object put "$BucketName/$($item.key)" --file="$sourcePath" --content-type="$($item.contentType)"

  if ($LASTEXITCODE -ne 0) {
    throw "La subida ha fallado para $($item.key)"
  }
}
