// Global variables
let map;
let shapefileLayer;
let globcoverLayer;
let glwdLayer;
let swampsLayer;
let isShapefileVisible = true;
let isGlobcoverVisible = true;
let isGlwdVisible = true;
let isSwampsVisible = true;

// Initialize the map when the page loads
document.addEventListener('DOMContentLoaded', function() {
    initializeMap();
    loadShapefile();
    loadGlobcover();
    loadGLWD();
    loadSWAMPs();
    setupEventListeners();
});

// Initialize Leaflet map with Google Maps terrain basemap
function initializeMap() {
    // Create the map
    map = L.map('map', {
        center: [7.0, 30.0], // Center on South Sudan approximately
        zoom: 6,
        minZoom: 2,
        maxZoom: 18,
        zoomControl: true
    });

    // Add Google Maps terrain layer
    const googleTerrain = L.tileLayer('https://mt{s}.google.com/vt/lyrs=p&x={x}&y={y}&z={z}', {
        attribution: '© Google Maps Terrain',
        subdomains: ['0', '1', '2', '3'],
        maxZoom: 20
    });

    // Add the terrain layer to the map
    googleTerrain.addTo(map);

    // Add loading events
    map.on('movestart', function() {
        document.body.classList.add('loading');
    });

    map.on('moveend', function() {
        document.body.classList.remove('loading');
    });
}

// Load and display the shapefile (GeoJSON)
async function loadShapefile() {
    try {
        // Update status
        updateFeatureCount('Loading shapefile...');
        
        // Load the GeoJSON file
        const response = await fetch('./Shapefile/ssd_admbnda_adm0_imwg_nbs_20180817.geojson');
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const geojsonData = await response.json();
        
        // Create Leaflet GeoJSON layer with styling and popup
        shapefileLayer = L.geoJSON(geojsonData, {
            style: function(feature) {
                return {
                    color: '#FF6B6B',
                    weight: 2,
                    opacity: 1,
                    fillColor: '#FF6B6B',
                    fillOpacity: 0.1,
                    dashArray: '5, 5'
                };
            },
            onEachFeature: function(feature, layer) {
                // Add popup with feature information
                if (feature.properties) {
                    let popupContent = '<div style="max-width: 200px;"><h4>Feature Information</h4>';
                    
                    // Display feature properties
                    Object.keys(feature.properties).forEach(key => {
                        popupContent += `<p><strong>${key}:</strong> ${feature.properties[key]}</p>`;
                    });
                    
                    popupContent += '</div>';
                    layer.bindPopup(popupContent);
                }

                // Add hover effects
                layer.on({
                    mouseover: function(e) {
                        const layer = e.target;
                        layer.setStyle({
                            weight: 3,
                            color: '#FF4757',
                            fillOpacity: 0.2
                        });
                        layer.bringToFront();
                    },
                    mouseout: function(e) {
                        shapefileLayer.resetStyle(e.target);
                    }
                });
            }
        });

        // Add layer to map
        shapefileLayer.addTo(map);

        // Fit map to shapefile bounds
        if (shapefileLayer.getBounds().isValid()) {
            map.fitBounds(shapefileLayer.getBounds(), {
                padding: [20, 20]
            });
        }

        // Update feature count
        const featureCount = Object.keys(geojsonData.features).length;
        updateFeatureCount(`Shapefile: ${featureCount} feature${featureCount !== 1 ? 's' : ''} loaded`);

    } catch (error) {
        console.error('Error loading shapefile:', error);
        updateFeatureCount('Error loading shapefile');
        
        // Show user-friendly error message
        showErrorMessage('Failed to load shapefile. Please check if the file exists and is accessible.');
    }
}

// Load and display the Globcover TIFF data
async function loadGlobcover() {
    try {
        updateFeatureCount('Loading Globcover data...');
        
        // Use the clipped version which is smaller and faster to load
        const tiffPath = './Globcover/clipped_GLOBCOVER_L4_200901_200912_V2.3.color.tif';
        
        console.log('Attempting to load:', tiffPath);
        
        const response = await fetch(tiffPath);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const tiffData = await response.arrayBuffer();
        console.log('TIFF data loaded, size:', tiffData.byteLength, 'bytes');
        
        // Parse the GeoTIFF
        const tiff = await GeoTIFF.fromArrayBuffer(tiffData);
        const image = await tiff.getImage();
        const rasters = await image.readRasters();
        
        // Get image metadata
        const width = image.getWidth();
        const height = image.getHeight();
        const bbox = image.getBoundingBox();
        
        console.log('Image dimensions:', width, 'x', height);
        console.log('Bounding box:', bbox);
        
        // Create canvas for rendering
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        
        // Create image data from raster
        const imageData = ctx.createImageData(width, height);
        const data = rasters[0]; // Use first band
        
        console.log('Processing', data.length, 'pixels...');
        
        // Apply Globcover color scheme
        for (let i = 0; i < data.length; i++) {
            const value = data[i];
            const color = getGlobcoverColor(value);
            const pixelIndex = i * 4;
            
            imageData.data[pixelIndex] = color.r;     // Red
            imageData.data[pixelIndex + 1] = color.g; // Green
            imageData.data[pixelIndex + 2] = color.b; // Blue
            imageData.data[pixelIndex + 3] = color.a; // Alpha
        }
        
        ctx.putImageData(imageData, 0, 0);
        
        // Create Leaflet image overlay
        const bounds = [
            [bbox[1], bbox[0]], // Southwest corner [lat, lng]
            [bbox[3], bbox[2]]  // Northeast corner [lat, lng]
        ];
        
        console.log('Creating overlay with bounds:', bounds);
        
        globcoverLayer = L.imageOverlay(canvas.toDataURL(), bounds, {
            opacity: 0.7,
            interactive: false
        });
        
        // Add to map
        globcoverLayer.addTo(map);
        
        updateFeatureCount('Globcover: Clipped land cover data loaded successfully');
        console.log('Globcover layer added to map');
        
    } catch (error) {
        console.error('Error loading Globcover:', error);
        
        // Fallback: Try to create a WMS service or provide alternative
        loadGlobcoverFallback();
    }
}

// Fallback method for Globcover loading
function loadGlobcoverFallback() {
    try {
        // Create a placeholder or try alternative loading method
        console.log('Using fallback method for Globcover...');
        
        // You could implement a tile server here or use a converted version
        // For now, we'll create a simple overlay to indicate the area
        
        const bounds = [
            [3.0, 24.0],  // Approximate South Sudan bounds
            [12.0, 39.0]
        ];
        
        // Create a simple colored overlay as placeholder
        const canvas = document.createElement('canvas');
        canvas.width = 100;
        canvas.height = 100;
        const ctx = canvas.getContext('2d');
        
        // Create a gradient representing land cover
        const gradient = ctx.createLinearGradient(0, 0, 100, 100);
        gradient.addColorStop(0, 'rgba(34, 139, 34, 0.3)');   // Forest green
        gradient.addColorStop(0.5, 'rgba(255, 215, 0, 0.3)'); // Gold (cropland)
        gradient.addColorStop(1, 'rgba(210, 180, 140, 0.3)'); // Tan (grassland)
        
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, 100, 100);
        
        globcoverLayer = L.imageOverlay(canvas.toDataURL(), bounds, {
            opacity: 0.5,
            interactive: false
        });
        
        globcoverLayer.addTo(map);
        
        updateFeatureCount('Globcover: Placeholder loaded (TIFF conversion needed)');
        
        // Show info message
        showInfoMessage('Globcover TIFF files need to be converted for web display. A placeholder is shown.');
        
    } catch (error) {
        console.error('Fallback method also failed:', error);
        updateFeatureCount('Globcover: Failed to load');
    }
}

// Get color for Globcover land cover classes
function getGlobcoverColor(value) {
    // Simplified Globcover color scheme
    const colors = {
        11: {r: 170, g: 240, b: 240, a: 255}, // Post-flooding or irrigated croplands
        14: {r: 255, g: 255, b: 100, a: 255}, // Rainfed croplands
        20: {r: 220, g: 240, b: 100, a: 255}, // Mosaic cropland/vegetation
        30: {r: 205, g: 205, b: 102, a: 255}, // Mosaic vegetation/cropland
        40: {r: 0, g: 100, b: 0, a: 255},     // Closed to open broadleaved forest
        50: {r: 0, g: 160, b: 0, a: 255},     // Closed broadleaved forest
        60: {r: 170, g: 200, b: 0, a: 255},   // Open broadleaved forest
        70: {r: 0, g: 60, b: 0, a: 255},      // Closed needleleaved forest
        90: {r: 40, g: 80, b: 0, a: 255},     // Open needleleaved forest
        100: {r: 120, g: 130, b: 0, a: 255},  // Closed to open mixed forest
        110: {r: 140, g: 160, b: 0, a: 255},  // Mosaic forest/shrubland
        120: {r: 190, g: 150, b: 0, a: 255},  // Mosaic grassland/forest
        130: {r: 150, g: 100, b: 0, a: 255},  // Closed to open shrubland
        140: {r: 255, g: 180, b: 50, a: 255}, // Closed to open grassland
        150: {r: 255, g: 235, b: 175, a: 255}, // Sparse vegetation
        160: {r: 0, g: 120, b: 90, a: 255},   // Closed to open forest flooded
        170: {r: 0, g: 150, b: 120, a: 255},  // Closed forest or shrubland flooded
        180: {r: 0, g: 220, b: 130, a: 255},  // Closed to open grassland flooded
        190: {r: 195, g: 20, b: 0, a: 255},   // Artificial surfaces
        200: {r: 255, g: 245, b: 215, a: 255}, // Bare areas
        210: {r: 0, g: 70, b: 200, a: 255},   // Water bodies
        220: {r: 255, g: 255, b: 255, a: 255}, // Permanent snow and ice
        230: {r: 128, g: 128, b: 128, a: 0}   // No data (transparent)
    };
    
    return colors[value] || {r: 128, g: 128, b: 128, a: 100}; // Default gray
}

// Load and display the GLWD (Global Lakes and Wetlands Database) data
async function loadGLWD() {
    try {
        updateFeatureCount('Loading GLWD data...');
        
        const tiffPath = './GLWD_geotiff/clipped_glwd_3.tif';
        console.log('Attempting to load GLWD:', tiffPath);
        
        const response = await fetch(tiffPath);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const tiffData = await response.arrayBuffer();
        console.log('GLWD data loaded, size:', tiffData.byteLength, 'bytes');
        
        // Parse the GeoTIFF
        const tiff = await GeoTIFF.fromArrayBuffer(tiffData);
        const image = await tiff.getImage();
        const rasters = await image.readRasters();
        
        // Get image metadata
        const width = image.getWidth();
        const height = image.getHeight();
        const bbox = image.getBoundingBox();
        
        console.log('GLWD dimensions:', width, 'x', height);
        console.log('GLWD bounding box:', bbox);
        
        // Create canvas for rendering
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        
        // Create image data from raster
        const imageData = ctx.createImageData(width, height);
        const data = rasters[0]; // Use first band
        
        console.log('Processing GLWD', data.length, 'pixels...');
        
        // Apply GLWD color scheme
        for (let i = 0; i < data.length; i++) {
            const value = data[i];
            const color = getGLWDColor(value);
            const pixelIndex = i * 4;
            
            imageData.data[pixelIndex] = color.r;     // Red
            imageData.data[pixelIndex + 1] = color.g; // Green
            imageData.data[pixelIndex + 2] = color.b; // Blue
            imageData.data[pixelIndex + 3] = color.a; // Alpha
        }
        
        ctx.putImageData(imageData, 0, 0);
        
        // Create Leaflet image overlay
        const bounds = [
            [bbox[1], bbox[0]], // Southwest corner [lat, lng]
            [bbox[3], bbox[2]]  // Northeast corner [lat, lng]
        ];
        
        console.log('Creating GLWD overlay with bounds:', bounds);
        
        glwdLayer = L.imageOverlay(canvas.toDataURL(), bounds, {
            opacity: 0.9,
            interactive: false
        });
        
        // Add to map
        glwdLayer.addTo(map);
        
        updateFeatureCount('GLWD: Lakes and wetlands data loaded');
        console.log('GLWD layer added to map');
        
        // Add legend for GLWD
        addGLWDLegend();
        
    } catch (error) {
        console.error('Error loading GLWD:', error);
        updateFeatureCount('GLWD: Failed to load');
    }
}

// Load and display the SWAMPs (Tropical/Subtropical Wetlands) data
async function loadSWAMPs() {
    try {
        updateFeatureCount('Loading SWAMPs data...');
        
        const tiffPath = './SWAMPs/clipped_TROP-SUBTROP_WetlandV3b_2016_CIFOR.tif';
        console.log('Attempting to load SWAMPs:', tiffPath);
        
        const response = await fetch(tiffPath);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const tiffData = await response.arrayBuffer();
        console.log('SWAMPs data loaded, size:', tiffData.byteLength, 'bytes');
        
        // Parse the GeoTIFF
        const tiff = await GeoTIFF.fromArrayBuffer(tiffData);
        const image = await tiff.getImage();
        const rasters = await image.readRasters();
        
        // Get image metadata
        const width = image.getWidth();
        const height = image.getHeight();
        const bbox = image.getBoundingBox();
        
        console.log('SWAMPs dimensions:', width, 'x', height);
        console.log('SWAMPs bounding box:', bbox);
        
        // Create canvas for rendering
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        
        // Create image data from raster
        const imageData = ctx.createImageData(width, height);
        const data = rasters[0]; // Use first band
        
        console.log('Processing SWAMPs', data.length, 'pixels...');
        
        // Apply SWAMPs color scheme
        for (let i = 0; i < data.length; i++) {
            const value = data[i];
            const color = getSWAMPsColor(value);
            const pixelIndex = i * 4;
            
            imageData.data[pixelIndex] = color.r;     // Red
            imageData.data[pixelIndex + 1] = color.g; // Green
            imageData.data[pixelIndex + 2] = color.b; // Blue
            imageData.data[pixelIndex + 3] = color.a; // Alpha
        }
        
        ctx.putImageData(imageData, 0, 0);
        
        // Create Leaflet image overlay
        const bounds = [
            [bbox[1], bbox[0]], // Southwest corner [lat, lng]
            [bbox[3], bbox[2]]  // Northeast corner [lat, lng]
        ];
        
        console.log('Creating SWAMPs overlay with bounds:', bounds);
        
        swampsLayer = L.imageOverlay(canvas.toDataURL(), bounds, {
            opacity: 0.85,
            interactive: false
        });
        
        // Add to map
        swampsLayer.addTo(map);
        
        updateFeatureCount('SWAMPs: Tropical wetlands data loaded');
        console.log('SWAMPs layer added to map');
        
        // Add legend for SWAMPs
        addSWAMPsLegend();
        
    } catch (error) {
        console.error('Error loading SWAMPs:', error);
        updateFeatureCount('SWAMPs: Failed to load');
    }
}

// Get color for GLWD (Global Lakes and Wetlands Database) classes
function getGLWDColor(value) {
    // GLWD darker, more vibrant JET-like color scheme for better visibility
    const colors = {
        0: {r: 0, g: 0, b: 0, a: 0},        // No data (transparent)
        1: {r: 0, g: 0, b: 139, a: 255},    // Lake - Dark Blue
        2: {r: 0, g: 50, b: 200, a: 255},   // Reservoir - Royal Blue
        3: {r: 0, g: 100, b: 255, a: 255},  // River - Bright Blue
        4: {r: 0, g: 150, b: 150, a: 255},  // Freshwater marsh - Dark Cyan
        5: {r: 0, g: 180, b: 50, a: 255},   // Swamp forest - Dark Green
        6: {r: 50, g: 200, b: 0, a: 255},   // Flooded grassland - Forest Green
        7: {r: 150, g: 200, b: 0, a: 255},  // Saline wetland - Yellow-Green
        8: {r: 200, g: 150, b: 0, a: 255},  // Mangrove - Dark Yellow
        9: {r: 255, g: 100, b: 0, a: 255},  // Salt marsh - Dark Orange
        10: {r: 200, g: 50, b: 0, a: 255},  // Intermittent wetland - Red-Orange
        11: {r: 180, g: 0, b: 0, a: 255},   // 50-100% wetland - Dark Red
        12: {r: 139, g: 0, b: 50, a: 255}   // 25-50% wetland - Maroon
    };
    
    return colors[value] || {r: 128, g: 128, b: 128, a: 0}; // Default transparent
}

// Get color for SWAMPs (Tropical/Subtropical Wetlands) classes
function getSWAMPsColor(value) {
    // SWAMPs darker, more vibrant JET-like color scheme for tropical wetlands
    const colors = {
        0: {r: 0, g: 0, b: 0, a: 0},        // No data (transparent)
        1: {r: 75, g: 0, b: 130, a: 255},   // Swamp forest - Indigo
        2: {r: 0, g: 0, b: 200, a: 255},    // Fresh water swamp - Dark Blue
        3: {r: 0, g: 50, b: 255, a: 255},   // Mangrove - Blue
        4: {r: 0, g: 100, b: 200, a: 255},  // Peat swamp - Steel Blue
        5: {r: 0, g: 150, b: 150, a: 255},  // Palm swamp - Teal
        6: {r: 0, g: 180, b: 100, a: 255},  // Seasonal wetland - Sea Green
        7: {r: 0, g: 150, b: 0, a: 255},    // Brackish wetland - Dark Green
        8: {r: 100, g: 180, b: 0, a: 255},  // Riparian wetland - Olive Green
        9: {r: 180, g: 180, b: 0, a: 255},  // Floodplain wetland - Dark Yellow
        10: {r: 200, g: 100, b: 0, a: 255}, // Other wetland types - Dark Orange
        11: {r: 180, g: 50, b: 0, a: 255},  // Additional class - Red-Orange
        12: {r: 150, g: 0, b: 0, a: 255},   // Additional class - Dark Red
        13: {r: 180, g: 0, b: 100, a: 255}, // Additional class - Dark Pink
        14: {r: 150, g: 0, b: 150, a: 255}, // Additional class - Dark Magenta
        15: {r: 100, g: 0, b: 150, a: 255}  // Additional class - Dark Purple
    };
    
    return colors[value] || {r: 128, g: 128, b: 128, a: 0}; // Default transparent
}

// Add GLWD legend
function addGLWDLegend() {
    const legendData = [
        {value: 1, color: 'rgb(0,0,255)', label: 'Lake'},
        {value: 2, color: 'rgb(0,100,255)', label: 'Reservoir'},
        {value: 3, color: 'rgb(0,200,255)', label: 'River'},
        {value: 4, color: 'rgb(0,255,200)', label: 'Freshwater Marsh'},
        {value: 5, color: 'rgb(0,255,100)', label: 'Swamp Forest'},
        {value: 6, color: 'rgb(0,255,0)', label: 'Flooded Grassland'},
        {value: 7, color: 'rgb(100,255,0)', label: 'Saline Wetland'},
        {value: 8, color: 'rgb(200,255,0)', label: 'Mangrove'},
        {value: 9, color: 'rgb(255,200,0)', label: 'Salt Marsh'},
        {value: 10, color: 'rgb(255,100,0)', label: 'Intermittent Wetland'},
        {value: 11, color: 'rgb(255,0,0)', label: '50-100% Wetland'},
        {value: 12, color: 'rgb(200,0,100)', label: '25-50% Wetland'}
    ];
    
    console.log('GLWD Legend data prepared:', legendData);
}

// Add SWAMPs legend
function addSWAMPsLegend() {
    const legendData = [
        {value: 1, color: 'rgb(128,0,128)', label: 'Swamp Forest'},
        {value: 2, color: 'rgb(0,0,255)', label: 'Fresh Water Swamp'},
        {value: 3, color: 'rgb(0,100,255)', label: 'Mangrove'},
        {value: 4, color: 'rgb(0,200,255)', label: 'Peat Swamp'},
        {value: 5, color: 'rgb(0,255,200)', label: 'Palm Swamp'},
        {value: 6, color: 'rgb(0,255,100)', label: 'Seasonal Wetland'},
        {value: 7, color: 'rgb(0,255,0)', label: 'Brackish Wetland'},
        {value: 8, color: 'rgb(150,255,0)', label: 'Riparian Wetland'},
        {value: 9, color: 'rgb(255,255,0)', label: 'Floodplain Wetland'},
        {value: 10, color: 'rgb(255,150,0)', label: 'Other Wetlands'}
    ];
    
    console.log('SWAMPs Legend data prepared:', legendData);
}

// Setup event listeners
function setupEventListeners() {
    const toggleButton = document.getElementById('toggle-shapefile');
    const buttonText = document.getElementById('button-text');
    const toggleGlobcoverButton = document.getElementById('toggle-globcover');
    const globcoverText = document.getElementById('globcover-text');
    const toggleGlwdButton = document.getElementById('toggle-glwd');
    const glwdText = document.getElementById('glwd-text');
    const toggleSwampsButton = document.getElementById('toggle-swamps');
    const swampsText = document.getElementById('swamps-text');

    // Shapefile toggle
    toggleButton.addEventListener('click', function() {
        if (shapefileLayer) {
            if (isShapefileVisible) {
                map.removeLayer(shapefileLayer);
                buttonText.textContent = 'Show Shapefile';
                toggleButton.classList.add('off');
                isShapefileVisible = false;
            } else {
                shapefileLayer.addTo(map);
                buttonText.textContent = 'Hide Shapefile';
                toggleButton.classList.remove('off');
                isShapefileVisible = true;
            }
        }
    });

    // Globcover toggle
    toggleGlobcoverButton.addEventListener('click', function() {
        if (globcoverLayer) {
            if (isGlobcoverVisible) {
                map.removeLayer(globcoverLayer);
                globcoverText.textContent = 'Show Globcover';
                toggleGlobcoverButton.classList.add('off');
                isGlobcoverVisible = false;
            } else {
                globcoverLayer.addTo(map);
                globcoverText.textContent = 'Hide Globcover';
                toggleGlobcoverButton.classList.remove('off');
                isGlobcoverVisible = true;
            }
        }
    });

    // GLWD toggle
    toggleGlwdButton.addEventListener('click', function() {
        if (glwdLayer) {
            if (isGlwdVisible) {
                map.removeLayer(glwdLayer);
                glwdText.textContent = 'Show GLWD';
                toggleGlwdButton.classList.add('off');
                isGlwdVisible = false;
            } else {
                glwdLayer.addTo(map);
                glwdText.textContent = 'Hide GLWD';
                toggleGlwdButton.classList.remove('off');
                isGlwdVisible = true;
            }
        }
    });

    // SWAMPs toggle
    toggleSwampsButton.addEventListener('click', function() {
        if (swampsLayer) {
            if (isSwampsVisible) {
                map.removeLayer(swampsLayer);
                swampsText.textContent = 'Show SWAMPs';
                toggleSwampsButton.classList.add('off');
                isSwampsVisible = false;
            } else {
                swampsLayer.addTo(map);
                swampsText.textContent = 'Hide SWAMPs';
                toggleSwampsButton.classList.remove('off');
                isSwampsVisible = true;
            }
        }
    });

    // Handle window resize
    window.addEventListener('resize', function() {
        if (map) {
            map.invalidateSize();
        }
    });
}

// Update feature count display
function updateFeatureCount(text) {
    const featureCountElement = document.getElementById('feature-count');
    if (featureCountElement) {
        featureCountElement.textContent = text;
    }
}

// Show error message
function showErrorMessage(message) {
    const errorDiv = document.createElement('div');
    errorDiv.style.cssText = `
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        background: #ff4757;
        color: white;
        padding: 20px;
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.3);
        z-index: 2000;
        max-width: 300px;
        text-align: center;
        font-family: 'Segoe UI', sans-serif;
    `;
    errorDiv.textContent = message;
    
    document.body.appendChild(errorDiv);
    
    // Auto-remove after 5 seconds
    setTimeout(() => {
        if (errorDiv.parentNode) {
            errorDiv.remove();
        }
    }, 5000);
}

// Show info message
function showInfoMessage(message) {
    const infoDiv = document.createElement('div');
    infoDiv.style.cssText = `
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        background: #3742fa;
        color: white;
        padding: 20px;
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.3);
        z-index: 2000;
        max-width: 350px;
        text-align: center;
        font-family: 'Segoe UI', sans-serif;
    `;
    infoDiv.textContent = message;
    
    document.body.appendChild(infoDiv);
    
    // Auto-remove after 7 seconds
    setTimeout(() => {
        if (infoDiv.parentNode) {
            infoDiv.remove();
        }
    }, 7000);
}

// Utility functions for debugging
function getMap() {
    return map;
}

function getShapefileLayer() {
    return shapefileLayer;
}

// Add basemap switching functionality (bonus feature)
function addBasemapSwitcher() {
    const basemaps = {
        'Satellite': L.tileLayer('https://mt{s}.google.com/vt/lyrs=s&x={x}&y={y}&z={z}', {
            attribution: '© Google Maps',
            subdomains: ['0', '1', '2', '3']
        }),
        'Streets': L.tileLayer('https://mt{s}.google.com/vt/lyrs=m&x={x}&y={y}&z={z}', {
            attribution: '© Google Maps',
            subdomains: ['0', '1', '2', '3']
        }),
        'Terrain': L.tileLayer('https://mt{s}.google.com/vt/lyrs=p&x={x}&y={y}&z={z}', {
            attribution: '© Google Maps',
            subdomains: ['0', '1', '2', '3']
        })
    };

    L.control.layers(basemaps).addTo(map);
}
