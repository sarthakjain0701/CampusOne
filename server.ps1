$port = 5000
$listener = New-Object System.Net.HttpListener
$listener.Prefixes.Add("http://localhost:$port/")
$listener.Prefixes.Add("http://127.0.0.1:$port/")
try { $listener.Start() } catch { Write-Host "Server already running or starting on port $port" }
Write-Host "PAMS Web Server listening on http://localhost:$port/ and http://127.0.0.1:$port/ (ngrok ready)"

$root = $PSScriptRoot

while ($listener.IsListening) {
    $context = $listener.GetContext()
    $request = $context.Request
    $response = $context.Response
    $response.Headers.Add("Access-Control-Allow-Origin", "*")
    $response.Headers.Add("Access-Control-Allow-Methods", "GET, POST, OPTIONS")

    $urlPath = $request.Url.LocalPath
    if ($urlPath -eq '/') { $urlPath = '/index.html' }
    
    $localPath = Join-Path $root $urlPath.Replace('/', '\')

    if (Test-Path $localPath -PathType Leaf) {
        $content = [System.IO.File]::ReadAllBytes($localPath)
        
        $ext = [System.IO.Path]::GetExtension($localPath).ToLower()
        switch ($ext) {
            '.html' { $response.ContentType = 'text/html; charset=utf-8' }
            '.css'  { $response.ContentType = 'text/css' }
            '.js'   { $response.ContentType = 'application/javascript' }
            '.png'  { $response.ContentType = 'image/png' }
            '.jpg'  { $response.ContentType = 'image/jpeg' }
            '.json' { $response.ContentType = 'application/json' }
            default { $response.ContentType = 'application/octet-stream' }
        }

        $response.ContentLength64 = $content.Length
        $response.OutputStream.Write($content, 0, $content.Length)
    } else {
        $response.StatusCode = 404
        $buffer = [System.Text.Encoding]::UTF8.GetBytes("404 - File Not Found")
        $response.ContentLength64 = $buffer.Length
        $response.OutputStream.Write($buffer, 0, $buffer.Length)
    }
    $response.Close()
}
