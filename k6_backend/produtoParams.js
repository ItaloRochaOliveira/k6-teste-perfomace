// Parâmetros do teste de PRODUTO (apenas dados, sem lógica).
//   k6 run -e TESTE=produto k6_backend/config.js
export const produtoParams = {
  nome: 'produto',
  baseUrl: 'http://localhost:3006',
  mode: 'sequential',

  // Use { vus, duration } ou { stages: [{ duration: '30s', target: 20 }, ...] }
  carga: { vus: 10, duration: '30s' },

  thresholds: {
    http_req_failed: ['rate<0.01'],
    http_req_duration: ['p(95)<800'],
  },

  thinkTime: 1,

  // Cadastro/login uma única vez no setup(); o Bearer é enviado nas rotas
  login: true,
  usuario: { name: 'K6 Usuario', email: 'k6@teste.com', password: '123456' },
  paths: { signup: '/auth/signup', login: '/auth/login' },

  routes: [
    {
      name: 'criar_produto',
      method: 'POST',
      path: '/products',
      expectedStatus: [201],
      body: {
        name: 'Produto k6 {{runId}}-{{vu}}-{{iter}}',
        description: 'Criado pelo teste de carga',
        price: '{{randomPrice}}',
        stock: '{{randomStock}}',
      },
      save: { productId: 'id' },
    },
    {
      name: 'listar_produtos',
      method: 'GET',
      path: '/products?page=1&pageSize=10&sortBy=createdAt&sortOrder=desc',
      expectedStatus: [200],
    },
    {
      name: 'buscar_produtos',
      method: 'GET',
      path: '/products?search=Produto%20k6',
      expectedStatus: [200],
    },
    {
      name: 'buscar_produto_por_id',
      method: 'GET',
      path: '/products/{{productId}}',
      expectedStatus: [200],
    },
    {
      name: 'atualizar_produto',
      method: 'PUT',
      path: '/products/{{productId}}',
      expectedStatus: [204],
      body: {
        name: 'Produto k6 atualizado {{random}}',
        description: 'Atualizado pelo teste de carga',
        price: '{{randomPrice}}',
        stock: '{{randomStock}}',
      },
    },
    {
      name: 'excluir_produto',
      method: 'DELETE',
      path: '/products/{{productId}}',
      expectedStatus: [204],
    },
  ],
};
