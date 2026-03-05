# Push all .env.local variables to Vercel (production)
# Run this from the project folder in PowerShell after linking with: vercel link
# Fill in your actual values before running — do NOT commit real secrets here.

$vars = @{
  "NEXT_PUBLIC_SUPABASE_URL"            = "https://YOUR-PROJECT.supabase.co"
  "NEXT_PUBLIC_SUPABASE_ANON_KEY"       = "YOUR_SUPABASE_ANON_KEY"
  "SUPABASE_SERVICE_ROLE_KEY"           = "YOUR_SUPABASE_SERVICE_ROLE_KEY"
  "DATABASE_URL"                        = "postgresql://postgres:YOUR_PASSWORD@pooler.supabase.com:6543/postgres?pgbouncer=true"
  "DIRECT_URL"                          = "postgresql://postgres:YOUR_PASSWORD@db.YOUR-PROJECT.supabase.co:5432/postgres"
  "MICROSOFT_CLIENT_ID"                 = "YOUR_MICROSOFT_CLIENT_ID"
  "MICROSOFT_CLIENT_SECRET"             = "YOUR_MICROSOFT_CLIENT_SECRET"
  "MICROSOFT_TENANT_ID"                 = "common"
  "NEXT_PUBLIC_MICROSOFT_CLIENT_ID"     = "YOUR_MICROSOFT_CLIENT_ID"
  "NEXT_PUBLIC_MICROSOFT_TENANT_ID"     = "common"
  "ANTHROPIC_API_KEY"                   = "YOUR_ANTHROPIC_API_KEY"
  "CRON_SECRET"                         = "YOUR_CRON_SECRET"
}

# NOTE: Set these AFTER you know your Vercel deployment URL:
# MICROSOFT_REDIRECT_URI         = https://YOUR-APP.vercel.app/api/auth/microsoft/callback
# NEXT_PUBLIC_MICROSOFT_REDIRECT_URI = https://YOUR-APP.vercel.app/api/auth/microsoft/callback
# NEXT_PUBLIC_APP_URL            = https://YOUR-APP.vercel.app

foreach ($key in $vars.Keys) {
  $value = $vars[$key]
  Write-Host "Adding $key ..." -ForegroundColor Cyan
  $value | vercel env add $key production --force
}

Write-Host ""
Write-Host "Done! Now set the 3 redirect URI vars manually in the Vercel dashboard:" -ForegroundColor Yellow
Write-Host "  MICROSOFT_REDIRECT_URI" -ForegroundColor Yellow
Write-Host "  NEXT_PUBLIC_MICROSOFT_REDIRECT_URI" -ForegroundColor Yellow
Write-Host "  NEXT_PUBLIC_APP_URL" -ForegroundColor Yellow
Write-Host "All 3 should point to your Vercel deployment URL." -ForegroundColor Yellow
