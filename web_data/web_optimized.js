
// Web-optimized version for GitHub Pages deployment
// This version loads PNG images instead of TIFF files

// Updated load functions for web deployment
async function loadGlobcoverWeb() {
    try {
        updateFeatureCount('Loading Globcover data...');
        
        // Load metadata
        const metadataResponse = await fetch('./web_data/globcover_metadata.json');
        const metadata = await metadataResponse.json();
        
        // Create image overlay
        const imagePath = `./web_data/${metadata.png_file}`;
        const bounds = [
            [metadata.bounds[1], metadata.bounds[0]], // SW
            [metadata.bounds[3], metadata.bounds[2]]  // NE
        ];
        
        globcoverLayer = L.imageOverlay(imagePath, bounds, {
            opacity: 0.7,
            interactive: false
        });
        
        globcoverLayer.addTo(map);
        updateFeatureCount('Globcover: Web-optimized data loaded');
        
    } catch (error) {
        console.error('Error loading Globcover:', error);
        updateFeatureCount('Globcover: Failed to load');
    }
}

async function loadGLWDWeb() {
    try {
        updateFeatureCount('Loading GLWD data...');
        
        const metadataResponse = await fetch('./web_data/glwd_metadata.json');
        const metadata = await metadataResponse.json();
        
        const imagePath = `./web_data/${metadata.png_file}`;
        const bounds = [
            [metadata.bounds[1], metadata.bounds[0]],
            [metadata.bounds[3], metadata.bounds[2]]
        ];
        
        glwdLayer = L.imageOverlay(imagePath, bounds, {
            opacity: 0.9,
            interactive: false
        });
        
        glwdLayer.addTo(map);
        updateFeatureCount('GLWD: Web-optimized data loaded');
        
    } catch (error) {
        console.error('Error loading GLWD:', error);
        updateFeatureCount('GLWD: Failed to load');
    }
}

async function loadSWAMPsWeb() {
    try {
        updateFeatureCount('Loading SWAMPs data...');
        
        const metadataResponse = await fetch('./web_data/swamps_metadata.json');
        const metadata = await metadataResponse.json();
        
        const imagePath = `./web_data/${metadata.png_file}`;
        const bounds = [
            [metadata.bounds[1], metadata.bounds[0]],
            [metadata.bounds[3], metadata.bounds[2]]
        ];
        
        swampsLayer = L.imageOverlay(imagePath, bounds, {
            opacity: 0.85,
            interactive: false
        });
        
        swampsLayer.addTo(map);
        updateFeatureCount('SWAMPs: Web-optimized data loaded');
        
    } catch (error) {
        console.error('Error loading SWAMPs:', error);
        updateFeatureCount('SWAMPs: Failed to load');
    }
}
