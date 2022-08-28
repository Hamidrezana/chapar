import Chapar from '../src';

describe('Chapar Tests', () => {
  it('Chapar should work correctly', async () => {
    const chapar = new Chapar({
      baseUrl: { main: 'https://jsonplaceholder.typicode.com' },
    });
    chapar.setupInterceptors({
      on404Callback: res => console.log(res.success),
    });

    const response = await chapar.sendChapar('todos/1', {
      baseUrlType: 'main',
    });
    expect(response.success).toEqual(true);
  });
});
