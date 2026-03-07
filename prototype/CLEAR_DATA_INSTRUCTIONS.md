# Clear Mock Data Instructions

## Problem
You're seeing old "Test Worker" data instead of the new 8 mock applications.

## Solution - Clear Browser Data

### Method 1: Browser Console (Recommended)
1. Open the application in your browser (http://localhost:5174)
2. Press `F12` to open Developer Tools
3. Go to the **Console** tab
4. Copy and paste this command:
```javascript
localStorage.clear(); sessionStorage.clear(); location.reload();
```
5. Press Enter

### Method 2: Application Tab
1. Press `F12` to open Developer Tools
2. Go to the **Application** tab (or **Storage** in Firefox)
3. In the left sidebar, expand **Local Storage**
4. Click on `http://localhost:5174`
5. Right-click and select "Clear"
6. Do the same for **Session Storage**
7. Refresh the page (`Ctrl+R` or `F5`)

### Method 3: Hard Refresh
1. Press `Ctrl + Shift + R` (Windows/Linux)
2. Or `Cmd + Shift + R` (Mac)
3. Or right-click the refresh button and select "Empty Cache and Hard Reload"

## Expected Result After Clearing

You should see **8 applications** with these counts:
- **Total Applications**: 8
- **Pending**: 3 (Construction Worker, Carpenter, Construction Helper)
- **Reviewed**: 2 (Plumber, Mason)
- **Accepted**: 2 (Electrician, Welder) - **These will have "Rate Worker" button**
- **Rejected**: 1 (Painter)

## Rating System Location

The rating system is now **INSIDE** the Applications section:
1. Go to **Applications** in the sidebar
2. Click on the **Accepted (2)** tab
3. You'll see 2 accepted applications (Electrician and Welder)
4. Each accepted application has a **"⭐ Rate Worker"** button
5. Click the button to open the rating modal
6. Rate the worker on various aspects
7. After rating, the button changes to **"✅ Rated"**

## Job Categories in Mock Data

The new mock data includes realistic job categories:
1. Construction Worker - Building and masonry
2. Plumber - Plumbing and pipe work
3. Electrician - Electrical wiring
4. Carpenter - Woodwork and furniture
5. Painter - Painting and finishing
6. Welder - Metal welding
7. Mason - Masonry and tile work
8. Construction Helper - General labor

All workers are from Jharkhand (Jamshedpur, Ranchi, Bokaro, Dhanbad).
