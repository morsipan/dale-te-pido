import fs from 'fs';

const path = 'dashboard.html';
let content = fs.readFileSync(path, 'utf8');

const targetFn = `    /* ═══════════════════════════════════════════ MARCA DE AGUA */
    async function applyWatermark(file) {
      return new Promise((resolve, reject) => {
        // Obtener logo guardado
        const logoData = localStorage.getItem('storeapp_logo_' + STORE_ID);

        const img = new Image();
        const reader = new FileReader();

        reader.onload = (e) => {
          img.onload = () => {
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');

            canvas.width = img.width;
            canvas.height = img.height;

            // Dibujar imagen original
            ctx.drawImage(img, 0, 0);

            // Si hay logo, aplicar marca de agua
            if (logoData) {
              const logo = new Image();
              logo.onload = () => {
                // Posicionar logo en esquina inferior derecha
                const logoSize = Math.min(img.width, img.height) * 0.15; // 15% del tamaño
                const logoWidth = logoSize;
                const logoHeight = (logo.height / logo.width) * logoSize;
                const padding = 20;

                // Fondo semi-transparente para el logo
                ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
                ctx.fillRect(
                  canvas.width - logoWidth - padding - 10,
                  canvas.height - logoHeight - padding - 10,
                  logoWidth + 20,
                  logoHeight + 20
                );

                // Dibujar logo
                ctx.globalAlpha = 0.8;
                ctx.drawImage(
                  logo,
                  canvas.width - logoWidth - padding,
                  canvas.height - logoHeight - padding,
                  logoWidth,
                  logoHeight
                );
                ctx.globalAlpha = 1.0;

                // Convertir a blob
                canvas.toBlob((blob) => {
                  const watermarkedFile = new File([blob], file.name, { type: file.type });
                  resolve(watermarkedFile);
                }, file.type, 0.95);
              };
              logo.onerror = () => {
                // Si falla el logo, devolver original
                resolve(file);
              };
              logo.src = logoData;
            } else {
              // Sin logo, devolver imagen original
              canvas.toBlob((blob) => {
                const originalFile = new File([blob], file.name, { type: file.type });
                resolve(originalFile);
              }, file.type, 0.95);
            }
          };
          img.onerror = () => reject(new Error('Error al cargar la imagen'));
          img.src = e.target.result;
        };

        reader.onerror = () => reject(new Error('Error al leer el archivo'));
        reader.readAsDataURL(file);
      });
    }`;

const replacementFn = `    /* ═══════════════════════════════════════════ PREPROCESAMIENTO, REDIMENSIÓN & COMPRESIÓN DE IMAGEN */
    async function applyWatermark(file) {
      return new Promise((resolve, reject) => {
        // Obtener logo guardado
        const logoData = localStorage.getItem('storeapp_logo_' + STORE_ID);

        const img = new Image();
        const reader = new FileReader();

        reader.onload = (e) => {
          img.onload = () => {
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');

            // 1. Redimensionado Proporcional en Cliente (Máximo 1200px de ancho para fotos pesadas de cámara)
            const MAX_WIDTH = 1200;
            let targetWidth = img.width;
            let targetHeight = img.height;
            if (targetWidth > MAX_WIDTH) {
              targetHeight = Math.round((targetHeight * MAX_WIDTH) / targetWidth);
              targetWidth = MAX_WIDTH;
            }

            canvas.width = targetWidth;
            canvas.height = targetHeight;

            // Dibujar imagen redimensionada con suavizado de alta calidad
            ctx.imageSmoothingEnabled = true;
            ctx.imageSmoothingQuality = 'high';
            ctx.drawImage(img, 0, 0, targetWidth, targetHeight);

            const deliverOptimizedBlob = () => {
              // Si el navegador soporta WebP, usamos image/webp al 80% (payload < 600KB garantizado)
              const outputMime = 'image/webp';
              const quality = 0.80;

              canvas.toBlob((blob) => {
                if (blob) {
                  const cleanName = file.name.replace(/\\.[^.]+$/, '') + '.webp';
                  const optimizedFile = new File([blob], cleanName, { type: 'image/webp' });
                  resolve(optimizedFile);
                } else {
                  // Fallback a JPEG 80%
                  canvas.toBlob((fallbackBlob) => {
                    const cleanName = file.name.replace(/\\.[^.]+$/, '') + '.jpg';
                    const finalFile = new File([fallbackBlob || file], cleanName, { type: 'image/jpeg' });
                    resolve(finalFile);
                  }, 'image/jpeg', 0.80);
                }
              }, outputMime, quality);
            };

            // 2. Si hay logo configurado, aplicar marca de agua
            if (logoData) {
              const logo = new Image();
              logo.onload = () => {
                const logoSize = Math.min(targetWidth, targetHeight) * 0.15; // 15% del tamaño escalado
                const logoWidth = logoSize;
                const logoHeight = (logo.height / logo.width) * logoSize;
                const padding = Math.max(10, Math.round(targetWidth * 0.02));

                ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
                ctx.fillRect(
                  canvas.width - logoWidth - padding - 8,
                  canvas.height - logoHeight - padding - 8,
                  logoWidth + 16,
                  logoHeight + 16
                );

                ctx.globalAlpha = 0.85;
                ctx.drawImage(
                  logo,
                  canvas.width - logoWidth - padding,
                  canvas.height - logoHeight - padding,
                  logoWidth,
                  logoHeight
                );
                ctx.globalAlpha = 1.0;

                deliverOptimizedBlob();
              };
              logo.onerror = () => {
                deliverOptimizedBlob();
              };
              logo.src = logoData;
            } else {
              deliverOptimizedBlob();
            }
          };
          img.onerror = () => reject(new Error('Error al cargar la imagen'));
          img.src = e.target.result;
        };

        reader.onerror = () => reject(new Error('Error al leer el archivo'));
        reader.readAsDataURL(file);
      });
    }`;

// Replace ignoring \r
const normalize = s => s.replace(/\r\n/g, '\n');
if (normalize(content).includes(normalize(targetFn))) {
  const isCrlf = content.includes('\r\n');
  const targetToReplace = isCrlf ? targetFn.replace(/\n/g, '\r\n') : targetFn;
  const repText = isCrlf ? replacementFn.replace(/\n/g, '\r\n') : replacementFn;
  content = content.replace(targetToReplace, repText);
  fs.writeFileSync(path, content, 'utf8');
  console.log('dashboard.html image compression patched successfully');
} else {
  console.error('targetFn not found in dashboard.html');
}
