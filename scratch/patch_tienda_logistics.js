import fs from 'fs';

const path = 'tienda.html';
let content = fs.readFileSync(path, 'utf8');

// 1. Update select options in #f-logistica
const targetSelect = `<select class="form-control" id="f-logistica" aria-label="Seleccionar método de logística" onchange="toggleDireccion(this.value)">
          <option value="">Seleccioná...</option>
          <option>Retiro por la tienda</option>
          <option>Envío a domicilio</option>
        </select>`;

const newSelect = `<select class="form-control" id="f-logistica" aria-label="Seleccionar método de logística" onchange="toggleDireccion(this.value)">
          <option value="">Seleccioná...</option>
          <option value="Retiro en el local">Retiro en el local</option>
          <option value="Envío a domicilio">Envío a domicilio (propio)</option>
        </select>`;

content = content.replace(targetSelect, newSelect);

// 2. Update toggleDireccion to support any delivery string
const targetToggle = `function toggleDireccion(val) {
  document.getElementById('f-dir-wrap').style.display = val==='Envío a domicilio' ? 'block' : 'none';
}`;

const newToggle = `function toggleDireccion(val) {
  document.getElementById('f-dir-wrap').style.display = (val === 'Envío a domicilio' || val.includes('domicilio')) ? 'block' : 'none';
}`;

content = content.replace(targetToggle, newToggle);

// 3. Remove Dale!QueVoy references in modal PIN and comanda text
content = content.replace(
  '<i class="bi bi-shield-lock-fill"></i> Entrega Segura Dale!QueVoy',
  '<i class="bi bi-shield-lock-fill"></i> Entrega Segura a Domicilio'
);

content = content.replace(
  '_(El cliente dictará este PIN de 4 dígitos al repartidor de Dale!QueVoy al recibir su paquete)_',
  '_(El cliente dictará este PIN de 4 dígitos al repartidor al recibir su paquete)_'
);

// 4. Update check logis in enviarWhatsApp
content = content.replace(
  "if (logis==='Envío a domicilio'&&!dir)",
  "if ((logis === 'Envío a domicilio' || logis.includes('domicilio')) && !dir)"
);

content = content.replace(
  "if (logis === 'Envío a domicilio') {",
  "if (logis === 'Envío a domicilio' || logis.includes('domicilio')) {"
);

content = content.replace(
  "delivery_type: logis === 'Envío a domicilio' ? 'delivery' : 'retiro',",
  "delivery_type: (logis === 'Envío a domicilio' || logis.includes('domicilio')) ? 'delivery' : 'retiro',"
);

fs.writeFileSync(path, content, 'utf8');
console.log('tienda.html logistics and hidden modales patched successfully');
