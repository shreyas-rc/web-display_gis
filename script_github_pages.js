// GitHub Pages Compatible Script - Only loads GeoJSON data
// TIFF files cannot be loaded directly due to browser/CORS restrictions

let map;
let shapefileLayer;
let isShapefileVisible = true;

// Initialize the map when the page loads
document.addEventListener('DOMContentLoaded', function() {
    initializeMap();
    loadShapefile();
    setupEventListeners();
    showGitHubPagesInfo();
});

// Initialize Leaflet map with Google Maps terrain basemap
function initializeMap() {
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

    googleTerrain.addTo(map);

    // Add loading events
    map.on('movestart', function() {
        document.body.classList.add('loading');
    });

    map.on('moveend', function() {
        document.body.classList.remove('loading');
    });
}

// Load and display the shapefile (GeoJSON) - This will work on GitHub Pages
async function loadShapefile() {
    try {
        updateFeatureCount('Loading shapefile...');
        
        const response = await fetch('./Shapefile/ssd_admbnda_adm0_imwg_nbs_20180817.geojson');
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const geojsonData = await response.json();
        
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
                if (feature.properties) {
                    let popupContent = '<div style="max-width: 200px;"><h4>Feature Information</h4>';
                    
                    Object.keys(feature.properties).forEach(key => {
                        popupContent += `<p><strong>${key}:</strong> ${feature.properties[key]}</p>`;
                    });
                    
                    popupContent += '</div>';
                    layer.bindPopup(popupContent);
                }

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

        shapefileLayer.addTo(map);

        if (shapefileLayer.getBounds().isValid()) {
            map.fitBounds(shapefileLayer.getBounds(), {
                padding: [20, 20]
            });
        }

        const featureCount = Object.keys(geojsonData.features).length;
        updateFeatureCount(`Shapefile: ${featureCount} feature${featureCount !== 1 ? 's' : ''} loaded`);

    } catch (error) {
        console.error('Error loading shapefile:', error);
        updateFeatureCount('Error loading shapefile');
        showErrorMessage('Failed to load shapefile. Please check if the file exists and is accessible.');
    }
}

// Setup event listeners
function setupEventListeners() {
    const toggleButton = document.getElementById('toggle-shapefile');
    const buttonText = document.getElementById('button-text');

    toggleButton.addEventListener('click', function() {
        if (shapefileLayer) {
            if (isShapefileVisible) {
                map.removeLayer(shapefileLayer);
                buttonText.textContent = 'Show Boundaries';
                toggleButton.classList.add('off');
                isShapefileVisible = false;
            } else {
                shapefileLayer.addTo(map);
                buttonText.textContent = 'Hide Boundaries';
                toggleButton.classList.remove('off');
                isShapefileVisible = true;
            }
        }
    });

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
    
    setTimeout(() => {
        if (errorDiv.parentNode) {
            errorDiv.remove();
        }
    }, 5000);
}

// Show GitHub Pages specific information
function showGitHubPagesInfo() {
    console.log("🔍 GitHub Pages Deployment Info:");
    console.log("✅ GeoJSON files will work fine");
    console.log("❌ TIFF files cannot be loaded directly");
    console.log("💡 Consider converting TIFF to PNG or using a tile server");
    console.log("📖 See documentation for conversion options");
}

// Utility functions
function getMap() {
    return map;
}

function getShapefileLayer() {
    return shapefileLayer;
}
