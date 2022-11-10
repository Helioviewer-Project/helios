const config = {
    testPathIgnorePatterns: [
        "node_modules",
        "geometry_service.test.js", // Geometry service is not used anymore
        "position_finder.test.js"   // Position finder server runs on localhost, not available under test environment
    ]
}

module.exports = config;
