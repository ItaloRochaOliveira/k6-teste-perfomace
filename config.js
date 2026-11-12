// Script GLOBAL do k6 (motor único para todas as aplicações).
// Os valores vêm de um JSON na pasta de cada aplicação (<APP>/parametros/<TESTE>.json).
// Este arquivo fica FORA das pastas das aplicações e é compartilhado por todas:
//
//   k6 run -e APP=k6_teste_perfomace -e TESTE=auth config.js
//        -> lê k6_teste_perfomace/parametros/auth.json e grava em k6_teste_perfomace/historico/
//   k6 run -e PARAMS_DIR=/caminho/parametros -e HISTORY_DIR=/caminho/historico -e TESTE=auth config.js
//   k6 run -e PARAMS=/caminho/parametros/auth.json config.js   (caminho direto do JSON)
//
// Para uma nova aplicação não é preciso mexer aqui. Caminhos relativos valem a partir deste arquivo.
//
// Cada JSON tem:
//   { nome, baseUrl, carga: { vus, duration } | { stages } | [ { duration, target } ], thresholds, thinkTime,
//     mode: 'sequential' | 'independent', login: true|false, usuario,
//     routes: [{ name, method, path, body, headers, auth, expectedStatus, save, load, sleep }] }
//
// Variáveis nos caminhos/corpos: {{runId}} {{vu}} {{iter}} {{random}} {{randomPrice}}
// {{randomStock}} {{token}} e qualquer chave criada por `save`.
import http from 'k6/http';
import { check, fail, group, sleep } from 'k6';

//   APP        = pasta da aplicação (usa APP/parametros e APP/historico)
//   PARAMS_DIR = pasta dos JSON (substitui APP/parametros; relativa a este arquivo ou absoluta)
//   TESTE      = nome do arquivo sem .json
//   PARAMS     = caminho completo do JSON (substitui PARAMS_DIR + TESTE)
const pastaParams = __ENV.PARAMS_DIR || (__ENV.APP ? __ENV.APP + '/parametros' : '');
const arquivo =
  __ENV.PARAMS ||
  (__ENV.TESTE && pastaParams ? pastaParams.replace(/[\/\\]$/, '') + '/' + __ENV.TESTE + '.json' : '');
if (!arquivo) {
  throw new Error(
    'Informe o teste: k6 run -e APP=<pasta-da-app> -e TESTE=<teste> config.js  (ou PARAMS_DIR + TESTE, ou PARAMS=<caminho.json>)',
  );
}
const absoluto = /^([\/\\]|[A-Za-z]:)/.test(arquivo);
// (remove o BOM que alguns editores do Windows colocam no início do JSON)
const values = JSON.parse(open(absoluto ? arquivo : './' + arquivo).replace(/^﻿/, ''));

const JSON_HEADERS = { 'Content-Type': 'application/json' };
const baseUrl = String(__ENV.BASE_URL || values.baseUrl).replace(/\/$/, '');
const routes = values.routes || [];
const thinkTime = values.thinkTime || 0;
const historicoDir = __ENV.HISTORY_DIR || values.historicoDir || (__ENV.APP ? __ENV.APP + '/historico' : 'historico');
const runId = Date.now();

function pick(obj, path) {
  if (obj === null || obj === undefined || !path) return undefined;
  return String(path)
    .split('.')
    .reduce((acc, key) => (acc === null || acc === undefined ? undefined : acc[key]), obj);
}

function render(value, ctx) {
  if (typeof value === 'string') {
    const whole = value.match(/^\{\{\s*([\w.]+)\s*\}\}$/);
    if (whole && ctx[whole[1]] !== undefined) return ctx[whole[1]]; // preserva o tipo (número etc.)
    return value.replace(/\{\{\s*([\w.]+)\s*\}\}/g, (m, key) =>
      ctx[key] === undefined ? m : String(ctx[key]),
    );
  }
  if (Array.isArray(value)) return value.map((item) => render(item, ctx));
  if (value && typeof value === 'object') {
    const out = {};
    Object.keys(value).forEach((key) => {
      out[key] = render(value[key], ctx);
    });
    return out;
  }
  return value;
}

function buildContext(token) {
  return {
    runId: runId,
    vu: __VU,
    iter: __ITER,
    token: token,
    random: Math.floor(Math.random() * 1e9),
    randomPrice: Math.round(Math.random() * 49900 + 100) / 100,
    randomStock: Math.floor(Math.random() * 500),
  };
}

function runRoute(route, ctx, token) {
  const headers = Object.assign({}, JSON_HEADERS, route.headers || {});
  const useAuth = route.auth !== undefined ? route.auth : Boolean(token);
  if (useAuth && token) headers.Authorization = 'Bearer ' + token;

  const url = baseUrl + render(route.path, ctx);
  const body = route.body !== undefined ? JSON.stringify(render(route.body, ctx)) : null;
  const expected = route.expectedStatus || [200, 201, 204];

  const res = http.request(route.method || 'GET', url, body, {
    headers: headers,
    tags: { name: route.name },
    // status esperado não conta como falha em http_req_failed (ex.: 409 esperado)
    responseCallback: http.expectedStatuses.apply(null, expected),
  });

  const checks = {};
  checks[route.name + ' status esperado'] = (r) => expected.indexOf(r.status) !== -1;
  check(res, checks);

  if (route.save) {
    let json;
    try {
      json = res.json();
    } catch (e) {
      json = undefined;
    }
    Object.keys(route.save).forEach((key) => {
      ctx[key] = pick(json, route.save[key]);
    });
  }
  if (route.sleep) sleep(route.sleep);
}

// ---- options (carga e thresholds vêm do arquivo de parâmetros) ---------------
function buildOptions() {
  // carga pode ser { vus, duration }, { stages } ou uma lista de etapas [{ duration, target }]
  const lista = Array.isArray(values.carga) ? values.carga : null;
  const cargaObj = lista ? {} : values.carga || {};
  const carga = {
    vus: Number(__ENV.VUS || cargaObj.vus || 10),
    duration: __ENV.DURATION || cargaObj.duration || '30s',
  };
  const options = { thresholds: Object.assign({}, values.thresholds) };

  // Um limite "vazio" por rota faz o k6 calcular o tempo de resposta de cada rota (aparece no resumo).
  routes.forEach((route) => {
    const key = 'http_req_duration{name:' + route.name + '}';
    if (!options.thresholds[key]) options.thresholds[key] = ['max>=0'];
  });

  if (lista) {
    options.stages = lista.map((etapa) => ({ duration: etapa.duration, target: etapa.target }));
  } else if (cargaObj.stages) {
    options.stages = cargaObj.stages;
  } else if (values.mode !== 'independent') {
    options.vus = carga.vus;
    options.duration = carga.duration;
  }

  if (values.mode === 'independent') {
    const scenarios = {};
    routes.forEach((route, index) => {
      const load = Object.assign({ executor: 'constant-vus' }, carga, route.load || {});
      scenarios[route.name || 'rota_' + index] = Object.assign({}, load, {
        exec: 'routeScenario',
        env: { ROUTE_INDEX: String(index) },
      });
    });
    options.scenarios = scenarios;
  }
  return Object.assign(options, values.options || {});
}

export const options = buildOptions();

// ---- setup: cadastra (se preciso) e faz login uma única vez ------------------
export function setup() {
  if (!values.login) return { token: null };
  const user = values.usuario;

  // 201 = criado, 409 = já existia; ambos servem.
  http.post(baseUrl + values.paths.signup, JSON.stringify(user), {
    headers: JSON_HEADERS,
    tags: { name: 'setup_signup' },
    responseCallback: http.expectedStatuses(201, 409),
  });
  const res = http.post(
    baseUrl + values.paths.login,
    JSON.stringify({ email: user.email, password: user.password }),
    { headers: JSON_HEADERS, tags: { name: 'setup_login' } },
  );
  if (res.status !== 200) fail('Login do setup falhou: HTTP ' + res.status + ' ' + res.body);
  return { token: pick(res.json(), values.tokenPath || 'accessToken') };
}

// ---- execução ---------------------------------------------------------------
export default function (data) {
  const token = data && data.token;
  const ctx = buildContext(token);
  routes.forEach((route) => {
    group(route.name, () => runRoute(route, ctx, token));
  });
  if (thinkTime) sleep(thinkTime);
}

// Modo independent: cada cenário executa uma única rota (ROUTE_INDEX vem do cenário).
export function routeScenario(data) {
  const token = data && data.token;
  const route = routes[Number(__ENV.ROUTE_INDEX)];
  const ctx = buildContext(token);
  group(route.name, () => runRoute(route, ctx, token));
  if (thinkTime) sleep(thinkTime);
}

// ---- resumo em português -----------------------------------------------------
function num(n, casas) {
  return Number(n || 0).toFixed(casas === undefined ? 2 : casas).replace('.', ',');
}

function ms(n) {
  return num(n, n >= 100 ? 0 : 1) + ' ms';
}

function bytes(n) {
  n = Number(n || 0);
  if (n >= 1048576) return num(n / 1048576) + ' MB';
  if (n >= 1024) return num(n / 1024) + ' kB';
  return num(n, 0) + ' B';
}

function pad(text, size) {
  text = String(text);
  while (text.length < size) text += ' ';
  return text;
}

function resumoPt(data) {
  const m = data.metrics;
  const v = (nome, campo) => (m[nome] && m[nome].values ? m[nome].values[campo] : 0);
  const seg = (data.state.testRunDurationMs || 0) / 1000;
  const linhas = [];

  linhas.push('');
  linhas.push('=== Resultado do teste: ' + values.nome + ' ===');
  linhas.push('Duração total ................ ' + num(seg, 1) + ' s');
  linhas.push('Usuários virtuais (máx.) ..... ' + num(v('vus_max', 'max'), 0));
  linhas.push(
    'Iterações .................... ' + num(v('iterations', 'count'), 0) + ' (' + num(v('iterations', 'rate')) + '/s)',
  );
  linhas.push(
    'Requisições HTTP ............. ' + num(v('http_reqs', 'count'), 0) + ' (' + num(v('http_reqs', 'rate')) + '/s)',
  );
  linhas.push(
    'Requisições com falha ........ ' +
      num(v('http_req_failed', 'rate') * 100) +
      '% (' + num(v('http_req_failed', 'passes'), 0) + ' de ' + num(v('http_reqs', 'count'), 0) + ')',
  );
  linhas.push(
    'Verificações (checks) ........ ' +
      num(v('checks', 'rate') * 100) +
      '% (' + num(v('checks', 'passes'), 0) + ' ok, ' + num(v('checks', 'fails'), 0) + ' com falha)',
  );
  linhas.push('Dados recebidos / enviados ... ' + bytes(v('data_received', 'count')) + ' / ' + bytes(v('data_sent', 'count')));

  linhas.push('');
  linhas.push('Tempo de resposta (geral)');
  linhas.push(
    '  média ' + ms(v('http_req_duration', 'avg')) +
      ' | mediana ' + ms(v('http_req_duration', 'med')) +
      ' | p90 ' + ms(v('http_req_duration', 'p(90)')) +
      ' | p95 ' + ms(v('http_req_duration', 'p(95)')) +
      ' | mín ' + ms(v('http_req_duration', 'min')) +
      ' | máx ' + ms(v('http_req_duration', 'max')),
  );

  // Por rota (métricas http_req_duration{name:...})
  const porRota = routes
    .map((route) => ({ nome: route.name, valores: (m['http_req_duration{name:' + route.name + '}'] || {}).values }))
    .filter((r) => r.valores);
  if (porRota.length) {
    linhas.push('');
    linhas.push('Tempo de resposta por rota');
    linhas.push('  ' + pad('rota', 26) + pad('média', 11) + pad('mediana', 11) + pad('p95', 11) + 'máx');
    porRota.forEach((r) => {
      linhas.push(
        '  ' + pad(r.nome, 26) + pad(ms(r.valores.avg), 11) + pad(ms(r.valores.med), 11) +
          pad(ms(r.valores['p(95)']), 11) + ms(r.valores.max),
      );
    });
  }

  // Verificações que falharam
  const falhas = [];
  (data.root_group.groups || []).forEach((grupo) => {
    (grupo.checks || []).forEach((c) => {
      if (c.fails > 0) falhas.push('  x ' + c.name + ': ' + c.fails + ' falha(s) de ' + (c.passes + c.fails));
    });
  });
  if (falhas.length) {
    linhas.push('');
    linhas.push('Verificações com falha');
    falhas.forEach((f) => linhas.push(f));
  }

  // Limites (thresholds) definidos no arquivo de parâmetros
  const limites = [];
  let aprovado = true;
  Object.keys(m).forEach((nome) => {
    const t = m[nome].thresholds;
    if (!t || nome.indexOf('{name:') !== -1) return; // ignora os limites "vazios" por rota
    Object.keys(t).forEach((expr) => {
      if (!t[expr].ok) aprovado = false;
      limites.push('  ' + (t[expr].ok ? '[ok]    ' : '[FALHOU]') + ' ' + nome + '  ' + expr);
    });
  });
  if (limites.length) {
    linhas.push('');
    linhas.push('Limites (thresholds)');
    limites.forEach((l) => linhas.push(l));
  }

  linhas.push('');
  linhas.push(aprovado ? 'RESULTADO: APROVADO - todos os limites foram atendidos.' : 'RESULTADO: REPROVADO - algum limite foi ultrapassado.');
  linhas.push('');
  return linhas.join('\n');
}

// ---- histórico: um JSON por execução + resumo em português no terminal --------
// Obs.: o k6 não cria pastas; a pasta de histórico precisa existir (k6_backend/historico).
export function handleSummary(data) {
  const stamp = new Date().toISOString().replace(/[:.]/g, '-');
  const out = { stdout: resumoPt(data) };
  out[historicoDir + '/' + values.nome + '-' + stamp + '.json'] = JSON.stringify(data, null, 2);
  return out;
}
