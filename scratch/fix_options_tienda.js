import fs from 'fs';

const path = 'tienda.html';
let content = fs.readFileSync(path, 'utf8');

content = content.replace(
  '<option>Retiro por la tienda</option>',
  '<option value="Retiro en el local">Retiro en el local</option>'
);

content = content.replace(
  '<option>Envío a domicilio</option>',
  '<option value="Envío a domicilio">Envío a domicilio (propio)</option>'
);

fs.writeFileSync(path, content, 'utf8');
console.log('Options updated in tienda.html');
