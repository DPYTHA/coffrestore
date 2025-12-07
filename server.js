const express = require('express');
const path = require('path');
const fs = require('fs');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware pour servir les fichiers statiques
app.use(express.static('public'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes pour les pages HTML
const pages = {
  '/': 'index.html',
  '/about': 'about.html',
  '/admin': 'admin.html',
  '/admission': 'admission.html',
  '/formation': 'formation.html',
  '/formulaire': 'formulaire.html',
  '/service': 'service.html'
};

// Générer dynamiquement les routes
Object.entries(pages).forEach(([route, file]) => {
  app.get(route, (req, res) => {
    const filePath = path.join(__dirname, 'pages', file);
    
    // Vérifier si le fichier existe
    fs.access(filePath, fs.constants.F_OK, (err) => {
      if (err) {
        res.status(404).send(`
          <!DOCTYPE html>
          <html>
          <head>
            <title>Page non trouvée - PythAcademy</title>
            <style>
              body { font-family: Arial, sans-serif; text-align: center; padding: 50px; }
              h1 { color: #e74c3c; }
              a { color: #3498db; text-decoration: none; }
            </style>
          </head>
          <body>
            <h1>404 - Page non trouvée</h1>
            <p>La page que vous cherchez n'existe pas.</p>
            <a href="/">Retour à l'accueil</a>
          </body>
          </html>
        `);
        return;
      }
      
      res.sendFile(filePath);
    });
  });
});

// Route pour soumettre le formulaire (pour Telegram)
app.post('/api/submit-form', async (req, res) => {
  try {
    const formData = req.body;
    
    // Configuration Telegram (à mettre dans .env en production)
    const TELEGRAM_CONFIG = {
      botToken: process.env.TELEGRAM_BOT_TOKEN || "TELEGRAM_BOT_TOKEN",
      chatId: process.env.TELEGRAM_CHAT_ID || "1112263326"
    };
    
    // Formater le message
    const message = `
📋 **NOUVEAU CANDIDAT - FORMULAIRE**

👤 **INFORMATIONS PERSONNELLES**
• 📝 **Nom:** ${formData.nom}
• 👤 **Prénom:** ${formData.prenom}
• 📞 **Téléphone:** ${formData.telephone}
• 📧 **Email:** ${formData.email}
• 🌍 **Pays:** ${formData.pays}
• 🏙️ **Ville:** ${formData.ville}
• 🏘️ **Quartier:** ${formData.quartier}
• 👨 **Père:** ${formData.nomPere}
• 👩 **Mère:** ${formData.nomMere}
• 💍 **Statut:** ${formData.statut}

🚨 **CONTACT D'URGENCE**
• 📝 **Nom:** ${formData.urgenceNom}
• 👤 **Prénom:** ${formData.urgencePrenom}
• 📞 **Téléphone:** ${formData.urgenceTelephone}
• 📧 **Email:** ${formData.urgenceEmail}
• 🔗 **Lien:** ${formData.urgenceLien}

🎓 **INFORMATIONS ACADÉMIQUES**
• 🏫 **Établissement Bac:** ${formData.etablissementBac}
• 📜 **Diplômes:** 
${formData.diplomes.split('\n').map(d => `  - ${d}`).join('\n')}

⏰ **Date d'envoi:** ${new Date().toLocaleString('fr-FR')}
                `.trim();
    
    // Envoyer à Telegram
    const telegramResponse = await fetch(
      `https://api.telegram.org/bot${TELEGRAM_CONFIG.botToken}/sendMessage`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          chat_id: TELEGRAM_CONFIG.chatId,
          text: message,
          parse_mode: 'Markdown'
        })
      }
    );
    
    const result = await telegramResponse.json();
    
    if (result.ok) {
      res.json({ 
        success: true, 
        message: 'Formulaire soumis avec succès !' 
      });
    } else {
      throw new Error(result.description || 'Erreur Telegram');
    }
    
  } catch (error) {
    console.error('Erreur:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Erreur lors de l\'envoi du formulaire' 
    });
  }
});

// Route pour les fichiers CSS
app.get('/css/:filename', (req, res) => {
  const filename = req.params.filename;
  const filePath = path.join(__dirname, 'public', 'css', filename);
  res.sendFile(filePath, (err) => {
    if (err) {
      res.status(404).send('Fichier CSS non trouvé');
    }
  });
});

// Route pour les images
app.get('/images/:filename', (req, res) => {
  const filename = req.params.filename;
  const filePath = path.join(__dirname, 'public', 'images', filename);
  res.sendFile(filePath, (err) => {
    if (err) {
      res.status(404).send('Image non trouvée');
    }
  });
});

// Page 404 personnalisée
app.use((req, res) => {
  res.status(404).send(`
    <!DOCTYPE html>
    <html>
    <head>
      <title>Page non trouvée - PythAcademy</title>
      <style>
        body { 
          font-family: 'Segoe UI', sans-serif; 
          text-align: center; 
          padding: 50px; 
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          min-height: 100vh;
          display: flex;
          flex-direction: column;
          justify-content: center;
          align-items: center;
        }
        .container {
          background: rgba(255, 255, 255, 0.1);
          backdrop-filter: blur(10px);
          padding: 40px;
          border-radius: 20px;
          max-width: 600px;
        }
        h1 { 
          font-size: 3rem; 
          margin-bottom: 20px;
        }
        p {
          font-size: 1.2rem;
          margin-bottom: 30px;
        }
        .nav-links {
          display: flex;
          gap: 20px;
          flex-wrap: wrap;
          justify-content: center;
        }
        a { 
          background: white;
          color: #667eea;
          padding: 12px 25px;
          border-radius: 25px;
          text-decoration: none; 
          font-weight: bold;
          transition: transform 0.3s ease;
        }
        a:hover {
          transform: translateY(-3px);
          box-shadow: 0 5px 15px rgba(0,0,0,0.2);
        }
      </style>
    </head>
    <body>
      <div class="container">
        <h1>404</h1>
        <p>Oups ! La page que vous cherchez n'existe pas.</p>
        <div class="nav-links">
          <a href="/">🏠 Accueil</a>
          <a href="/admission">🎓 Admissions</a>
          <a href="/formation">💻 Formations</a>
          <a href="/service">⭐ Services</a>
        </div>
      </div>
    </body>
    </html>
  `);
});

// Démarrer le serveur
app.listen(PORT, () => {
  console.log(`🚀 Serveur démarré sur http://localhost:${PORT}`);
  console.log(`📁 Pages disponibles:`);
  Object.entries(pages).forEach(([route, file]) => {
    console.log(`   • ${route} → ${file}`);
  });
});