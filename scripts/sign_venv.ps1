$cert = Get-ChildItem Cert:\CurrentUser\My -CodeSigningCert | Where-Object { $_.Subject -eq "CN=ReguLensLocalDev" } | Select-Object -First 1

if (-not $cert) {
    $cert = New-SelfSignedCertificate -Type CodeSigningCert -Subject "CN=ReguLensLocalDev" -CertStoreLocation "Cert:\CurrentUser\My"
}

$pubStore = Get-Item "Cert:\CurrentUser\TrustedPublisher"
$pubStore.Open([System.Security.Cryptography.X509Certificates.OpenFlags]::ReadWrite)
$pubStore.Add($cert)
$pubStore.Close()
Write-Output "Certificate registered in TrustedPublisher."

$files = Get-ChildItem -Path "backend/.venv" -Recurse | Where-Object { $_.Extension -eq ".pyd" -or $_.Extension -eq ".dll" }

Write-Output "Signing $($files.Count) binary files..."
$count = 0
foreach ($file in $files) {
    Set-AuthenticodeSignature -Certificate $cert -FilePath $file.FullName | Out-Null
    $count++
}

Write-Output "Successfully signed $count binary files."
