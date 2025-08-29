
// Web-optimized version for GitHub Pages deployment
// This version loads PNG images instead of TIFF files

// Updated load functions for web deployment
async function loadGlobcoverWeb() {
    try {
        updateFeatureCount('Loading Globcover data...');
        console.log('Loading Globcover from web_data...');
        
        // Load metadata
        const metadataResponse = await fetch('./web_data/globcover_metadata.json');
        const metadata = await metadataResponse.json();
        
        console.log('Globcover metadata:', metadata);
        
        // Create image overlay using the bounds from metadata
        const imagePath = `./web_data/${metadata.png_file}`;
        const bounds = [
            [metadata.bounds[1], metadata.bounds[0]], // SW [lat, lng]
            [metadata.bounds[3], metadata.bounds[2]]  // NE [lat, lng]
        ];
        
        console.log('Globcover bounds:', bounds);
        console.log('Globcover image path:', imagePath);
        
        globcoverLayer = L.imageOverlay(imagePath, bounds, {
            opacity: 0.7,
            interactive: false
        });
        
        globcoverLayer.addTo(map);
        updateFeatureCount('Globcover: Web-optimized PNG data loaded');
        console.log('Globcover layer added successfully');
        
    } catch (error) {
        console.error('Error loading Globcover:', error);
        updateFeatureCount('Globcover: Failed to load PNG data');
    }
}

async function loadGLWDWeb() {
    try {
        updateFeatureCount('Loading GLWD data...');
        console.log('Loading GLWD from web_data...');
        
        const metadataResponse = await fetch('./web_data/glwd_metadata.json');
        const metadata = await metadataResponse.json();
        
        console.log('GLWD metadata:', metadata);
        
        const imagePath = `./web_data/${metadata.png_file}`;
        const bounds = [
            [metadata.bounds[1], metadata.bounds[0]], // SW [lat, lng]
            [metadata.bounds[3], metadata.bounds[2]]  // NE [lat, lng]
        ];
        
        console.log('GLWD bounds:', bounds);
        
        glwdLayer = L.imageOverlay(imagePath, bounds, {
            opacity: 0.9,
            interactive: false
        });
        
        glwdLayer.addTo(map);
        updateFeatureCount('GLWD: Web-optimized PNG data loaded');
        console.log('GLWD layer added successfully');
        
    } catch (error) {
        console.error('Error loading GLWD:', error);
        updateFeatureCount('GLWD: Failed to load PNG data');
    }
}

async function loadSWAMPsWeb() {
    try {
        updateFeatureCount('Loading SWAMPs data...');
        console.log('Loading SWAMPs from web_data...');
        
        const metadataResponse = await fetch('./web_data/swamps_metadata.json');
        const metadata = await metadataResponse.json();
        
        console.log('SWAMPs metadata:', metadata);
        
        const imagePath = `./web_data/${metadata.png_file}`;
        const bounds = [
            [metadata.bounds[1], metadata.bounds[0]], // SW [lat, lng]
            [metadata.bounds[3], metadata.bounds[2]]  // NE [lat, lng]
        ];
        
        console.log('SWAMPs bounds:', bounds);
        
        swampsLayer = L.imageOverlay(imagePath, bounds, {
            opacity: 0.85,
            interactive: false
        });
        
        swampsLayer.addTo(map);
        updateFeatureCount('SWAMPs: Web-optimized PNG data loaded');
        console.log('SWAMPs layer added successfully');
        
    } catch (error) {
        console.error('Error loading SWAMPs:', error);
        updateFeatureCount('SWAMPs: Failed to load PNG data');
    }
}
