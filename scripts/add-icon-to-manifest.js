// scripts/add-icon-to-manifest.js
const fs = require('fs');
const path = require('path');

const manifestPath = path.join(__dirname, '..', 'manifest.json');

try {
  // Read the manifest
  const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
  
  // Add icon property
  const updatedManifest = {
    ...manifest,
    icon: 'icon.svg'
  };
  
  // Write back with nice formatting
  fs.writeFileSync(
    manifestPath, 
    JSON.stringify(updatedManifest, null, 2) + '\n'
  );
  
  console.log('✅ Icon added to manifest.json');
} catch (error) {
  console.error('❌ Error adding icon to manifest:', error.message);
  process.exit(1);
}
