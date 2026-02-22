# Google Search Console Redirect Issues - Fixed

## Problem Summary
Google Search Console was reporting **"Page with redirect"** errors for your website (usa-graphene.com). The validation failed with 6 URLs still affected by this issue.

## Root Causes Identified

### 1. **Absolute URLs in Redirects**
The `next.config.js` file was using absolute URLs (e.g., `https://www.usa-graphene.com/blog/...`) instead of relative paths in all redirect rules. This caused Google to view them as external redirects, creating unnecessary redirect chains.

### 2. **Middleware Redirect Chain**
The `middleware.ts` file was redirecting both:
- `graphene2026.com` → `www.usa-graphene.com` ✅ (correct)
- `usa-graphene.com` → `www.usa-graphene.com` ❌ (unnecessary)

This created a redirect chain when combined with the absolute URL redirects.

## Fixes Applied

### ✅ 1. Updated `next.config.js`
**Changed ALL redirect destinations from absolute URLs to relative paths:**

**Before:**
```javascript
async redirects() {
  const baseUrl = 'https://www.usa-graphene.com'
  return [
    { source: '/765', destination: `${baseUrl}/blog/765`, permanent: true },
    // ... etc
  ]
}
```

**After:**
```javascript
async redirects() {
  return [
    { source: '/765', destination: '/blog/765/', permanent: true },
    // ... etc
  ]
}
```

This change was applied to **all 88 redirect rules** in the configuration.

### ✅ 2. Simplified `middleware.ts`
**Removed the non-www to www redirect for usa-graphene.com:**

**Before:**
```typescript
if (host.includes('graphene2026.com') || host === 'usa-graphene.com') {
    url.host = 'www.usa-graphene.com'
    url.protocol = 'https'
    return NextResponse.redirect(url.toString(), 301)
}
```

**After:**
```typescript
// Only redirect the old domain (graphene2026.com) to the new domain
// Canonical tags will handle www vs non-www preference
if (host.includes('graphene2026.com')) {
    url.host = 'www.usa-graphene.com'
    url.protocol = 'https'
    return NextResponse.redirect(url.toString(), 301)
}
```

**Why this works:** Your canonical tags already specify the preferred `www.usa-graphene.com` version, so Google will understand that as the canonical URL without needing a redirect.

## Benefits

1. ✅ **No redirect chains** - All redirects are now single-hop, internal redirects
2. ✅ **Faster page loads** - Fewer HTTP round trips
3. ✅ **Better SEO** - Google prefers clean, direct redirects
4. ✅ **Cleaner code** - Removed the unnecessary `baseUrl` variable
5. ✅ **GSC compliance** - Addresses the "Page with redirect" validation failures

## Deployment Status

✅ **Changes deployed successfully to production!**
- Committed to main branch: `f36f443`
- Build completed successfully
- Live at: https://www.usa-graphene.com

## Next Steps for You

### 1. **Request Re-validation in Google Search Console**
1. Go to [Google Search Console](https://search.google.com/search-console)
2. Navigate to the "Page indexing" issue report
3. Find the "Page with redirect" issue
4. Click **"Validate Fix"**

### 2. **Monitor the Validation**
- Google will take **a few days to a week** to re-crawl and validate
- You should see the pending count decrease as Google validates the fixes
- Check back in 3-5 days to see progress

### 3. **Expected Results**
After validation completes, you should see:
- ✅ All 6 failed URLs should pass validation
- ✅ The 28 pending URLs should be properly indexed
- ✅ No more "Page with redirect" warnings

## Technical Details

### URLs That Were Failing (examples from screenshot):
- `https://usa-graphene.com/blog/`
- `http://usa-graphene.com/`
- `http://www.usa-graphene.com/`
- Various blog post URLs

### Why They Were Failing:
1. HTTP → HTTPS redirect (handled by Vercel)
2. Non-www → www redirect (handled by middleware)
3. Absolute URL redirect (handled by next.config.js)

This created a **3-hop redirect chain** that Google flagged as problematic.

### After the Fix:
1. HTTP → HTTPS redirect (handled by Vercel) ✅
2. ~~Non-www → www redirect~~ (removed, canonical tags handle this) ✅
3. ~~Absolute URL redirect~~ (now relative, no redirect) ✅

Result: **Single-hop redirect maximum** for any URL.

## Questions?

If you see any issues or have questions about the fixes, let me know!

---

**Fixed on:** February 2, 2026  
**Deployed to:** Production (Vercel)  
**Commit:** f36f443
