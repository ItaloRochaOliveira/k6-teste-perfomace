// Parâmetros do teste de AUTH (apenas dados, sem lógica).
//   k6 run -e TESTE=auth k6_backend/config.js
export const authParams = {
  nome: 'auth',
  baseUrl: 'http://localhost:3006',
  mode: 'sequential', // 'sequential' = rotas em fluxo | 'independent' = cada rota como cenário próprio

  // Use { vus, duration } ou { stages: [{ duration: '30s', target: 20 }, ...] }
  carga: { vus: 10, duration: '30s' },

  thresholds: {
    http_req_failed: ['rate<0.01'],
    http_req_duration: ['p(95)<800'],
  },

  thinkTime: 1, // segundos entre iterações de cada usuário virtual
  login: false, // cadastro e login são justamente as rotas testadas

  paths: { signup: '/auth/signup', login: '/auth/login' },

  routes: [
    {
      name: 'signup',
      method: 'POST',
      path: '/auth/signup',
      auth: false,
      expectedStatus: [201],
      // e-mail único por usuário virtual/iteração para nunca cair em 409
      body: {
        name: 'K6 {{vu}}',
        email: 'k6-{{runId}}-{{vu}}-{{iter}}@teste.com',
        password: '123456',
      },
      save: { signupEmail: 'email' },
      // load: { vus: 5, duration: '30s' },   // só no modo independent
    },
    {
      name: 'login',
      method: 'POST',
      path: '/auth/login',
      auth: false,
      expectedStatus: [200],
      body: { email: '{{signupEmail}}', password: '123456' },
    },
  ],
};
