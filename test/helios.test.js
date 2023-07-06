import Configuration from '../src/Configuration.js';
import { Helios } from '../src/API/helios';
Configuration.helios_api_url = 'http://127.0.0.1:5000/';

test('Saving a scene', async () => {
    let testLayers = [{
        source: 13,
        start: new Date(),
        end: new Date(),
        cadence: 86400,
        scale: 0.6
    }];
    let result = await Helios.SaveScene(testLayers);
    expect(result).not.toHaveProperty('error');
    expect(typeof result).toBe('number');
})

test('Loading a scene', async () => {
    let result = await Helios.LoadScene(1);
    expect(result).not.toHaveProperty('error');
    expect(result).toHaveProperty('id');
    expect(result).toHaveProperty('layers');
    expect(result['layers'].length).toBeGreaterThan(0);
})