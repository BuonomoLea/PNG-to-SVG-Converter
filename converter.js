// Redimensionne le PNG à une taille fixe
function resizeImage(file, targetSize = 400) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = targetSize;
      canvas.height = targetSize;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(img, 0, 0, targetSize, targetSize);
      resolve(canvas.toDataURL('image/png'));
    };
    img.onerror = reject;
    img.src = URL.createObjectURL(file);
  });
}

// Fusionne tous les paths restants en un seul, arrondi les coordonnées
function simplifySvg(svgString) {
  const parser = new DOMParser();
  const doc = parser.parseFromString(svgString, 'image/svg+xml');

  const vbAttr = doc.documentElement.getAttribute('viewBox') || '0 0 400 400';
  const vbParts = vbAttr.split(/\s+/).map(Number);

  // Supprimer le path de fond
  const paths = Array.from(doc.querySelectorAll('path')).filter(p => {
    const d = p.getAttribute('d') || '';
    const norm = d.replace(/\s+/g, ' ').trim();
    const rectPattern = `M 0 0 L ${vbParts[2]} 0 L ${vbParts[2]} ${vbParts[3]} L 0 ${vbParts[3]} L 0 0 Z`;
    const opacity = parseFloat(p.getAttribute('opacity') || '1');
    return norm !== rectPattern && opacity > 0.01;
  });

  if (paths.length === 0) return svgString;

  // Fusionner les tracés
  let mergedD = paths.map(p => p.getAttribute('d')).join(' ');

  // Arrondir les nombres
  mergedD = mergedD.replace(/-?\d+(\.\d+)?/g, n => {
    const v = parseFloat(n);
    if (Number.isNaN(v)) return n;
    const s = v.toFixed(1);
    return s.endsWith('.0') ? s.slice(0, -2) : s;
  });

  // SVG minimal noir
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${vbAttr}"><path d="${mergedD}" fill="currentColor"></path></svg>`;
}

export async function convertPngToSvg(file, options = {}) {
  const resizedDataUrl = await resizeImage(file, 400);

  return new Promise((resolve, reject) => {
    ImageTracer.imageToSVG(
      resizedDataUrl,
      function(svgString) {
        if (!svgString || typeof svgString !== 'string') {
          reject(new Error("SVG vide ou invalide"));
          return;
        }
        const simplified = simplifySvg(svgString);
        resolve(simplified);
      },
      options
    );
  });
}
