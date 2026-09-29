Add-Type -AssemblyName System.Drawing

$srcPath = Join-Path (Get-Location) "public\campus-hero.jpg"
$destPath = Join-Path (Get-Location) "public\campus-hero-web.jpg"

if (Test-Path $srcPath) {
    $img = [System.Drawing.Image]::FromFile($srcPath)
    $newWidth = 1920
    $newHeight = [int]($img.Height * ($newWidth / $img.Width))
    
    $bmp = New-Object System.Drawing.Bitmap $newWidth, $newHeight
    $graph = [System.Drawing.Graphics]::FromImage($bmp)
    $graph.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
    $graph.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::HighQuality
    $graph.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality
    $graph.CompositingQuality = [System.Drawing.Drawing2D.CompositingQuality]::HighQuality
    
    $graph.DrawImage($img, 0, 0, $newWidth, $newHeight)
    
    $codec = [System.Drawing.Imaging.ImageCodecInfo]::GetImageEncoders() | Where-Object { $_.MimeType -eq 'image/jpeg' }
    $encoderParams = New-Object System.Drawing.Imaging.EncoderParameters(1)
    $encoderParams.Param[0] = New-Object System.Drawing.Imaging.EncoderParameter([System.Drawing.Imaging.Encoder]::Quality, [long]92)
    
    $bmp.Save($destPath, $codec, $encoderParams)
    
    $graph.Dispose()
    $bmp.Dispose()
    $img.Dispose()
    
    Write-Host "Created campus-hero-web.jpg, size:" (Get-Item $destPath).Length
}
