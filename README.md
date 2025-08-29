# 🗺️ Interactive Map Viewer

A web-based map viewer for displaying geospatial data including shapefiles, land cover data, and wetlands information.

## 📋 Current Status

### ✅ What Works on GitHub Pages:
- **Administrative Boundaries** (GeoJSON) - ✅ Fully supported
- **Interactive features** - ✅ Click for details, hover effects
- **Google Terrain basemap** - ✅ Works perfectly
- **Responsive design** - ✅ Mobile-friendly

### ❌ What Doesn't Work on GitHub Pages:
- **TIFF Files** (Globcover, GLWD, SWAMPs) - ❌ Browser security restrictions
- **Direct GeoTIFF loading** - ❌ CORS and MIME type issues

## 🚀 Deployment Options

### Option 1: GitHub Pages (Limited)
**Use `index_github_pages.html`** - Only shows administrative boundaries

1. Push code to GitHub repository
2. Go to repository Settings → Pages
3. Select source branch (usually `main`)
4. Your site will be at: `https://username.github.io/repository-name`

**Limitations:** Only GeoJSON data will display

### Option 2: Full Local Development
**Use `index.html`** - Shows all datasets

1. Run a local web server:
   ```bash
   # Python
   python -m http.server 8000
   
   # Node.js
   npx serve .
   
   # PHP
   php -S localhost:8000
   ```

2. Open `http://localhost:8000`

### Option 3: Convert TIFF to Web Format
**Run the conversion script** to make TIFF data web-compatible:

```bash
# Install dependencies
pip install rasterio pillow

# Convert TIFF files
python prepare_for_github_pages.py
```

This creates PNG versions of your TIFF files that will work on GitHub Pages.

## 📁 File Structure

```
├── index.html                     # Full version (local only)
├── index_github_pages.html        # GitHub Pages version
├── script.js                      # Full functionality
├── script_github_pages.js         # GitHub Pages compatible
├── styles.css                     # Shared styles
├── prepare_for_github_pages.py    # TIFF conversion script
├── Shapefile/                     # GeoJSON data (works on GitHub Pages)
├── Globcover/                     # TIFF data (needs conversion)
├── GLWD_geotiff/                  # TIFF data (needs conversion)
└── SWAMPs/                        # TIFF data (needs conversion)
```

## 🛠️ Technical Issues with GitHub Pages

### Why TIFF Files Don't Work:
1. **CORS Restrictions** - Browsers block cross-origin TIFF requests
2. **MIME Type Issues** - GitHub doesn't serve .tif files properly
3. **File Size** - TIFF files are often too large for web browsers
4. **JavaScript Libraries** - GeoTIFF.js may fail over HTTPS

### Solutions:
1. **Convert to PNG** - Use the provided Python script
2. **Use Tile Server** - Services like MapTiler or GeoServer
3. **Different Hosting** - Platforms that support custom MIME types
4. **Cloud Storage** - AWS S3, Google Cloud with proper CORS setup

## 🎨 Features

- **Google Terrain Basemap** - Perfect for environmental data
- **Multiple Dataset Support** - Boundaries, land cover, wetlands
- **Interactive Controls** - Toggle layers on/off
- **Responsive Design** - Works on desktop and mobile
- **Color-Coded Visualization** - JET color scheme for scientific data

## 🔧 Customization

### Adding New Datasets:
1. Place GeoJSON files in appropriate folders
2. Update the loading functions in JavaScript
3. Add new toggle buttons in HTML
4. Style with appropriate colors in CSS

### Changing Basemaps:
```javascript
// Satellite
'https://mt{s}.google.com/vt/lyrs=s&x={x}&y={y}&z={z}'

// Streets
'https://mt{s}.google.com/vt/lyrs=m&x={x}&y={y}&z={z}'

// Terrain (current)
'https://mt{s}.google.com/vt/lyrs=p&x={x}&y={y}&z={z}'
```

## 📝 Notes

- For best results with TIFF data, use local development environment
- GitHub Pages is perfect for GeoJSON-based projects
- Consider using PostGIS + tile server for large datasets
- Always test locally before deploying to GitHub Pages

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch
3. Test both local and GitHub Pages versions
4. Submit a pull request

## 📄 License

This project is open source and available under the [MIT License](LICENSE).
