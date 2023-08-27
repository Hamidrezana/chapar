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
  it('Add Response Template', async () => {
    const chapar = new Chapar<string, { status: number; data: unknown }>({
      baseUrl: 'https://publicapi.ramzinex.com/exchange/api/v1.0/exchange',
      successKey: 'status',
      dataKey: 'data',
      checkStatusFunc: (_statusCode, response) => response.status === 0,
    });

    const response = await chapar.sendChapar('pairs', { method: 'get' });
    expect(response.success).toEqual(true);
  });
});
