const config = {
    testPathIgnorePatterns: [
        "node_modules",
        "geometry_service.test.js", // Geometry service is not used anymore
        "position_finder.test.js"   // Position finder server runs on localhost, not available under test environment
    ],
    moduleNameMapper: {
        '\\.(jpg|jpeg|png|gif|eot|otf|webp|svg|ttf|woff|woff2|mp4|webm|wav|mp3|m4a|aac|oga)$':
          '<rootDir>/__mocks__/fileMock.js',
        '\\.(css|less)$': 'identity-obj-proxy',
      },
}

module.exports = config;
