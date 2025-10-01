import { convertPngToSvg } from './converter.js';
let currentSvgString = '';

// Conversion
document.getElementById('convertBtn').addEventListener('click', async () => {
  const file = document.getElementById('fileInput').files[0];
  if (!file) {
    alert("Sélectionne un fichier PNG.");
    return;
  }

  try {
    const svgString = await convertPngToSvg(file, {
      ltres: 2,
      qtres: 2,
      numberofcolors: 2,
      pathomit: 6,
      roundcoords: 4,
      desc: false,
      viewbox: true
    });

    currentSvgString = svgString;

    // Injection du rendu SVG
    document.getElementById('svgContainer').innerHTML = svgString;
    console.log("SVG injecté dans le DOM.");

    // Affichage du code brut
    document.getElementById('svgCode').textContent = svgString;

    const paths = document.querySelectorAll('#svgContainer path');
    console.log("Nombre de <path> trouvés :", paths.length);

    if (paths.length === 0) {
      console.warn("Aucun <path> trouvé.");
    }
  } catch (err) {
    console.error("Erreur pendant la conversion :", err);
  }
});
// Changer la couleur
document.getElementById('colorPicker').addEventListener('input', (e) => {
  const newColor = e.target.value;
  const svgEl = document.querySelector('#svgContainer svg');
  if (svgEl) {
    svgEl.querySelectorAll('path').forEach(path => {
      path.setAttribute('fill', newColor);
    });
    // Met à jour la variable pour le téléchargement
    currentSvgString = svgEl.outerHTML;
    document.getElementById('svgCode').textContent = currentSvgString;
  }
});
// Bouton téléchargement
document.getElementById('downloadBtn').addEventListener('click', () => {
  if (!currentSvgString) {
    alert("Aucun SVG à télécharger.");
    return;
  }
  const blob = new Blob([currentSvgString], { type: 'image/svg+xml' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'image_vectorisee.svg';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
});

