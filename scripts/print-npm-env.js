/*
  Script de diagnóstico: imprime variables relacionadas con NPM que pueden causar E401 en Vercel.
  No expone tokens completos; solo reporta presencia y longitud aproximada.
*/
const keys = [
  'NPM_TOKEN',
  'NODE_AUTH_TOKEN',
  'NPM_AUTH_TOKEN',
  'NPM_CONFIG__AUTH',
  'NPM_CONFIG__AUTH_TOKEN',
  'NPM_CONFIG_REGISTRY',
  'npm_config_registry',
  'npm_config_always_auth',
];

function mask(v){
  if(!v) return 'not set';
  if(typeof v !== 'string') v = String(v);
  const len = v.length;
  if(len <= 6) return '*'.repeat(len);
  return v.slice(0,3) + '...' + v.slice(-3) + ` (len:${len})`;
}

console.log('--- NPM env diagnostics (preinstall) ---');
keys.forEach(k => console.log(`${k} = ${mask(process.env[k])}`));
console.log('---------------------------------------');
