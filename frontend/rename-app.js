/**
 * Script to rename the application from "HomeOwnerPal" to "HomieHQ"
 * 
 * This script makes the following changes:
 * 1. Replaces instances of "HomeOwnerPal" with "HomieHQ"
 * 2. Replaces instances of "Home Owner Pal" with "Homie HQ"
 * 3. Replaces instances of "homeownerpal" with "homiehq"
 * 4. Replaces instances of "home-text" with "homie-text"
 * 5. Updates CSS class names and variable references
 */

const fs = require('fs');
const path = require('path');
const util = require('util');
const readFile = util.promisify(fs.readFile);
const writeFile = util.promisify(fs.writeFile);
const readdir = util.promisify(fs.readdir);
const rename = util.promisify(fs.rename);
const mkdir = util.promisify(fs.mkdir);

// Base directory for the React application
const srcDir = './src';

async function renameFiles() {
  // Files to be renamed
  const fileRenames = [
    { from: `${srcDir}/components/homeowner/HomeOwnerPal.css`, to: `${srcDir}/components/homie/HomieHQ.css` },
    { from: `${srcDir}/components/homeowner/HomeOwnerDashboard.js`, to: `${srcDir}/components/homie/HomieHQDashboard.js` },
    // Add other files that need to be renamed
  ];

  for (const { from, to } of fileRenames) {
    try {
      // Ensure target directory exists
      const targetDir = path.dirname(to);
      if (!fs.existsSync(targetDir)) {
        await mkdir(targetDir, { recursive: true });
      }
      
      // Check if source file exists
      if (!fs.existsSync(from)) {
        console.log(`Source file not found: ${from}`);
        continue;
      }
      
      // Read the file content
      const content = await readFile(from, 'utf8');
      
      // Replace the content
      const newContent = replaceContent(content);
      
      // Write to the new location
      await writeFile(to, newContent, 'utf8');
      
      console.log(`Renamed and updated: ${from} -> ${to}`);
    } catch (err) {
      console.error(`Error renaming ${from} to ${to}:`, err);
    }
  }
}

async function updateFiles() {
  // Process all JS, JSX, CSS files recursively
  await processDirectory(srcDir);
}

async function processDirectory(dir) {
  try {
    const files = await readdir(dir, { withFileTypes: true });
    
    for (const file of files) {
      const filePath = path.join(dir, file.name);
      
      if (file.isDirectory()) {
        await processDirectory(filePath);
      } else {
        // Only process JS, JSX, CSS files
        if (/\.(js|jsx|css)$/.test(file.name)) {
          try {
            // Skip files we've already renamed
            if (file.name === 'HomeOwnerPal.css' || file.name === 'HomeOwnerDashboard.js') {
              continue;
            }
            
            const content = await readFile(filePath, 'utf8');
            const newContent = replaceContent(content);
            
            // Only write if content has changed
            if (content !== newContent) {
              await writeFile(filePath, newContent, 'utf8');
              console.log(`Updated: ${filePath}`);
            }
          } catch (err) {
            console.error(`Error processing ${filePath}:`, err);
          }
        }
      }
    }
  } catch (err) {
    console.error(`Error reading directory ${dir}:`, err);
  }
}

function replaceContent(content) {
  // Rename class and component references
  let newContent = content
    // Replace the app name
    .replace(/HomeOwnerPal/g, 'HomieHQ')
    .replace(/Home\s*Owner\s*Pal/g, 'Homie HQ')
    .replace(/homeownerpal/g, 'homiehq')
    .replace(/Home Owner Pal/g, 'Homie HQ')
    
    // Update CSS class names
    .replace(/home-text/g, 'homie-text')
    .replace(/home-color/g, 'homie-color')
    
    // Update component imports and references
    .replace(/HomeOwnerDashboard/g, 'HomieHQDashboard')
    .replace(/homeowner\/Home/g, 'homie/Homie')
    
    // Update directory paths
    .replace(/\/homeowner\//g, '/homie/')
    .replace(/components\/homeowner/g, 'components/homie')
    
    // Update import statements
    .replace(/from ['"]\.\.\/homeowner\//g, 'from \'../homie/')
    .replace(/from ['"]\.\/homeowner\//g, 'from \'./homie/')
    
    // Update variable references
    .replace(/--home-color/g, '--homie-color')
    
    // Update navigation links and route paths
    .replace(/home-dashboard/g, 'homie-dashboard')
    .replace(/\/home-dashboard/g, '/homie-dashboard');
  
  return newContent;
}

// Function to update package.json and other config files
async function updateConfigFiles() {
  const packageJsonPath = './package.json';
  
  try {
    if (fs.existsSync(packageJsonPath)) {
      const packageJson = JSON.parse(await readFile(packageJsonPath, 'utf8'));
      
      // Update package name
      if (packageJson.name && packageJson.name.includes('homeownerpal')) {
        packageJson.name = packageJson.name.replace('homeownerpal', 'homiehq');
      }
      
      // Update description
      if (packageJson.description && packageJson.description.includes('HomeOwnerPal')) {
        packageJson.description = packageJson.description.replace('HomeOwnerPal', 'HomieHQ');
      }
      
      await writeFile(packageJsonPath, JSON.stringify(packageJson, null, 2), 'utf8');
      console.log(`Updated: ${packageJsonPath}`);
    }
  } catch (err) {
    console.error(`Error updating ${packageJsonPath}:`, err);
  }
}

// Run the renaming process
async function run() {
  console.log('Starting renaming process from HomeOwnerPal to HomieHQ...');
  await renameFiles();
  await updateFiles();
  await updateConfigFiles();
  console.log('Renaming process completed!');
}

run().catch(err => console.error('Rename process failed:', err));