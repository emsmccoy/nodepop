'use strict';
// Comment to evite eslint no-undef error
/* global process */

const readline = require('readline');

// Var to connect DB
const connection = require('./lib/connectMongoose');

// Load models
const { Advertisement } = require('./models/Advertisement');

async function main() {
  //Assure the await to the DB connection before ask
  await connection.$initialConnection;
  const continuar = await pregunta('Are you sure you want to delete the current DB and load the new one?(yes/no)');
  if (!continuar) { process.exit(); }

  // intialize ads collection
  await initAds();

  //closing connection DB
  connection.close();
}

main().catch(err => console.log('Error:', err));

/**
 * Initialize ads collection
 */
async function initAds() {
  // Delete all documents
  const deleted = await Advertisement.deleteMany();
  console.log(`Deleted ${deleted.deletedCount} ads.`);

  //Synchronize the indexes
  const syncIndex = await Advertisement.syncIndexes();
  console.log(`Reviewed ${syncIndex} indexes`);

  // Load intial ads
  const adsFile = require('./anunciosBase.json');
  const inserted = await Advertisement.insertMany(adsFile.advertisements);
  console.log(`Created ${inserted.length} ads.`);
}

/**
 * Funtion to ask a question 
 * @param {string} texto String to present in console
 * @returns Promise returns true if the answer is "si", false in other case.
 */
function pregunta(texto) {
  return new Promise((resolve) => {

    const ifc = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    });

    ifc.question(texto, respuesta => {
      ifc.close();
      if (respuesta.toLowerCase() === 'yes') {
        resolve(true);
        return;
      }
      resolve(false);
    });

  });

}