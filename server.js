const express = require('express');
const path = require('path');
const fs = require('fs');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

console.log('🚀 Démarrage de PythAcademy...');
console.log('📁 Répertoire courant:', __dirname);
console.log('🔧 Port:', PORT);
console.log('🌐 NODE_ENV:', process.env.NODE_ENV);

// Middleware pour servir les fichiers statiques
app.use(express.static('public'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Logging middleware
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} ${req.method} ${req.url}`);
  next();
});

// Route de test pour health check
app.get('/health', (req, res) => {
  console.log('✅ Health check appelé');
  res.status(200).json({ 
    status: 'ok', 
    message: 'PythAcademy API en ligne',
    timestamp: new Date().toISOString()
  });
});

// Route racine
app.get('/', (req, res) => {
  console.log('📄 Tentative de chargement index.html');
  
  const indexPath = path.join(__dirname, 'pages', 'index.html');
  console.log('📁 Chemin index.html:', indexPath);
  
  // Vérifier si le fichier existe
  fs.access(indexPath, fs.constants.F_OK, (err) => {
    if (err) {
      console.error('❌ Fichier index.html non trouvé:', err);
      
      // Liste les fichiers dans le répertoire pages
      fs.readdir(path.join(__dirname, 'pages'), (err, files) => {
        if (err) {
          console.error('❌ Erreur lecture répertoire pages:', err);
        } else {
          console.log('📁 Fichiers dans pages/:', files);
        }
        
        res.status(404).send(`
          <!DOCTYPE html>
          <html>
          <head>
            <title>Erreur - PythAcademy</title>
            <style>
              body { font-family: Arial, sans-serif; padding: 50px; }
              .error { color: #e74c3c; background: #f9f9f9; padding: 20px; border-radius: 10px; }
            </style>
          </head>
          <body>
            <h1>Erreur de configuration</h1>
            <div class="error">
              <p>Le fichier index.html n'a pas été trouvé.</p>
              <p>Vérifiez la structure de fichiers sur Railway.</p>
              <p>Port: ${PORT}</p>
              <p>Path: ${indexPath}</p>
            </div>
          </body>
          </html>
        `);
      });
    } else {
      console.log('✅ index.html trouvé, envoi...');
      res.sendFile(indexPath);
    }
  });
});

// Routes pour les autres pages
const pages = {
  '/about': 'about.html',
  '/admin': 'admin.html',
  '/admission': 'admission.html',
  '/formation': 'formation.html',
  '/formulaire': 'formulaire.html',
  '/service': 'service.html'
};

Object.entries(pages).forEach(([route, file]) => {
  app.get(route, (req, res) => {
    const filePath = path.join(__dirname, 'pages', file);
    console.log(`📄 Route ${route} → ${filePath}`);
    
    fs.access(filePath, fs.constants.F_OK, (err) => {
      if (err) {
        console.error(`❌ ${file} non trouvé:`, err);
        res.redirect('/');
        return;
      }
      res.sendFile(filePath);
    });
  });
});

// Route pour les fichiers statiques
app.get('/css/:filename', (req, res) => {
  const filename = req.params.filename;
  const filePath = path.join(__dirname, 'public', 'css', filename);
  console.log(`🎨 CSS demandé: ${filename}`);
  
  res.sendFile(filePath, (err) => {
    if (err) {
      console.error(`❌ CSS ${filename} non trouvé:`, err);
      res.status(404).send('CSS non trouvé');
    }
  });
});

app.get('/images/:filename', (req, res) => {
  const filename = req.params.filename;
  const filePath = path.join(__dirname, 'public', 'images', filename);
  console.log(`🖼️ Image demandée: ${filename}`);
  
  res.sendFile(filePath, (err) => {
    if (err) {
      console.error(`❌ Image ${filename} non trouvé:`, err);
      res.status(404).send('Image non trouvée');
    }
  });
});

// API route
app.post('/api/submit-form', async (req, res) => {
  console.log('📝 Formulaire soumis');
  res.json({ success: true, message: 'Formulaire reçu' });
});

// Démarrer le serveur
app.listen(PORT, '0.0.0.0', () => {
  console.log(`✅ Serveur démarré sur http://0.0.0.0:${PORT}`);
  console.log(`🌐 URLs disponibles:`);
  console.log(`   • /            → Page d'accueil`);
  console.log(`   • /health      → Health check`);
  console.log(`   • /about       → À propos`);
  console.log(`   • /admission   → Admissions`);
  console.log(`   • /formation   → Formations`);
  console.log(`   • /formulaire  → Formulaire`);
  console.log(`   • /service     → Services`);
  console.log(`   • /admin       → Administration`);
});