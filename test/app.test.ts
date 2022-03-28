import Chapar from '../src';

describe('Chapar Tests', () => {
  it('Chapar should work correctly', async () => {
    const chapar = new Chapar('https://jsonplaceholder.typicode.com');
    chapar.baseUrl;
    const url = chapar.createUrl({ baseUrlType: 'https://jsonplaceholder.typicode.com', url: '/' });

    const response = await chapar.sendChapar('todos/1');
    expect(response.success).toEqual(true);
  });
});
