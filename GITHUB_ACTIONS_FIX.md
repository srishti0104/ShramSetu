# GitHub Actions Caching Error Fix

## Error Summary

```
Error: Some specified paths were not resolved, unable to cache dependencies.
```

**Location:** `infrastructure-test` job in `.github/workflows/deploy.yml`

## Root Cause

The GitHub Actions workflow tries to cache npm dependencies using:
```yaml
cache: 'npm'
cache-dependency-path: infrastructure/package-lock.json
```

But `infrastructure/package-lock.json` **does not exist**, causing the cache setup to fail.

## Impact

- ⚠️ **Non-blocking:** The workflow continues but without caching
- 🐌 **Slower builds:** Every run downloads dependencies from scratch
- 💰 **Higher costs:** More bandwidth usage and longer CI/CD times

## Solutions (Choose One)

### Option 1: Generate package-lock.json (Recommended)

This is the **best practice** for reproducible builds.

**Steps:**

1. Navigate to infrastructure directory:
```bash
cd infrastructure
```

2. Generate package-lock.json:
```bash
npm install
```

3. Commit the file:
```bash
git add package-lock.json
git commit -m "Add infrastructure package-lock.json for CI caching"
git push
```

**Pros:**
- ✅ Enables npm caching (faster CI/CD)
- ✅ Ensures reproducible builds
- ✅ Locks dependency versions
- ✅ Prevents supply chain attacks

**Cons:**
- None (this is best practice)

---

### Option 2: Remove cache configuration

If you don't want to commit package-lock.json (not recommended).

**Edit `.github/workflows/deploy.yml`:**

```yaml
# BEFORE (lines 48-52)
- name: Setup Node.js
  uses: actions/setup-node@v4
  with:
    node-version: ${{ env.NODE_VERSION }}
    cache: 'npm'
    cache-dependency-path: infrastructure/package-lock.json

# AFTER
- name: Setup Node.js
  uses: actions/setup-node@v4
  with:
    node-version: ${{ env.NODE_VERSION }}
    # No caching
```

**Pros:**
- ✅ Fixes the error immediately

**Cons:**
- ❌ No caching (slower builds)
- ❌ Non-reproducible builds
- ❌ Potential version drift

---

### Option 3: Use wildcard cache path

Cache both root and infrastructure package-lock.json files.

**Edit `.github/workflows/deploy.yml`:**

```yaml
# BEFORE (lines 48-52)
- name: Setup Node.js
  uses: actions/setup-node@v4
  with:
    node-version: ${{ env.NODE_VERSION }}
    cache: 'npm'
    cache-dependency-path: infrastructure/package-lock.json

# AFTER
- name: Setup Node.js
  uses: actions/setup-node@v4
  with:
    node-version: ${{ env.NODE_VERSION }}
    cache: 'npm'
    cache-dependency-path: '**/package-lock.json'
```

**Pros:**
- ✅ Works even if package-lock.json is missing
- ✅ Caches all package-lock.json files in the repo

**Cons:**
- ⚠️ Still requires package-lock.json to exist for caching to work
- ⚠️ Less specific (may cache unintended files)

---

## Recommended Action Plan

**Step 1:** Generate package-lock.json (Option 1)
```bash
cd infrastructure
npm install
git add package-lock.json
git commit -m "Add infrastructure package-lock.json for CI caching"
git push
```

**Step 2:** Verify the fix
- Push to GitHub
- Check Actions tab
- Verify "Setup Node.js" step succeeds with caching

**Step 3:** (Optional) Optimize workflow
Consider using wildcard pattern for future-proofing:

```yaml
cache-dependency-path: |
  package-lock.json
  infrastructure/package-lock.json
```

## Additional Improvements

### 1. Add .npmrc for consistent behavior

Create `infrastructure/.npmrc`:
```
package-lock=true
save-exact=true
```

### 2. Update .gitignore

Ensure package-lock.json is NOT ignored:
```bash
# Check .gitignore doesn't have:
# package-lock.json  # ❌ Remove this line if present
```

### 3. Add npm ci validation

Update infrastructure package.json scripts:
```json
{
  "scripts": {
    "preinstall": "npx only-allow npm",
    "postinstall": "npm run build"
  }
}
```

### 4. Cache validation in workflow

Add a step to verify cache is working:

```yaml
- name: Setup Node.js
  uses: actions/setup-node@v4
  with:
    node-version: ${{ env.NODE_VERSION }}
    cache: 'npm'
    cache-dependency-path: infrastructure/package-lock.json

- name: Verify cache
  run: |
    if [ -f infrastructure/package-lock.json ]; then
      echo "✅ package-lock.json found"
    else
      echo "❌ package-lock.json missing"
      exit 1
    fi
```

## Why This Matters

### Without package-lock.json:
- 🐌 Each CI run: ~2-3 minutes to download dependencies
- 💰 Higher GitHub Actions minutes usage
- ⚠️ Risk of version drift between runs
- ⚠️ Potential breaking changes from dependency updates

### With package-lock.json + caching:
- ⚡ Each CI run: ~10-20 seconds for cached dependencies
- 💰 Lower GitHub Actions minutes usage
- ✅ Reproducible builds
- ✅ Locked dependency versions

## Testing the Fix

After implementing Option 1:

1. **First run (cache miss):**
```
Setup Node.js
  Cache not found for input keys: ...
  Installing dependencies...
  Post job cleanup: Saving cache...
```

2. **Second run (cache hit):**
```
Setup Node.js
  Cache restored from key: ...
  Dependencies restored from cache
```

## Common Issues

### Issue 1: Cache still not working
**Solution:** Ensure package-lock.json is committed and pushed

### Issue 2: Cache key mismatch
**Solution:** Delete and regenerate package-lock.json:
```bash
rm package-lock.json
npm install
```

### Issue 3: Different npm versions
**Solution:** Specify npm version in workflow:
```yaml
- name: Setup Node.js
  uses: actions/setup-node@v4
  with:
    node-version: ${{ env.NODE_VERSION }}
    cache: 'npm'

- name: Use specific npm version
  run: npm install -g npm@10.2.4
```

## Summary

**Quick Fix (5 minutes):**
```bash
cd infrastructure
npm install
git add package-lock.json
git commit -m "Add package-lock.json for CI caching"
git push
```

**Result:**
- ✅ Fixes GitHub Actions caching error
- ✅ Speeds up CI/CD by 80-90%
- ✅ Ensures reproducible builds
- ✅ Follows npm best practices
