// NOTE: You must run gather_comtrade_data.mjs before running this script.
// This script takes the country-by-country comtrade data generated by the
// gather script, calculates percentage of that country's imports coming from
// Ukraine, and joins all of this data into a single 00_all_data_ukraine.csv file.

import fs from "fs";
import path from "path";
import * as d3 from "d3";

// fix to make d3.csv work in my env
import fetch from "node-fetch";
global.fetch = fetch;

// read a csv file and parse it into json
const processCsvFile = async (path) => {
  try {
    const contents = fs.readFileSync(path, "utf8");
    if (contents) {
      return d3.csvParse(contents);
    } else {
      return null;
    }
  } catch (e) {
    console.log(`No file found for ${path}`);
    return null;
  }
}

// prefixes a filename with the pwd
const comtradeDataPath = file => path.join(process.cwd(), "public/data/comtrade_imports", file)

// get a list of available country comtrade data files
const fileList = fs.readdirSync(comtradeDataPath(''));

function determineUkrainePercentOfImports(importerComtradeData) {
  // importer comtrade data
  const worldStats = importerComtradeData[0];
  // pt3ISO is the country code exporting the goods. UKR hardcoded here
  const ukrStats = importerComtradeData.find((country) => country.pt3ISO === 'UKR');

  if (!ukrStats || !worldStats) {
    return null
  }

  const worldTradeValue = parseInt(worldStats.TradeValue);
  const ukrTradeValue = parseInt(ukrStats.TradeValue);

  return ukrTradeValue / worldTradeValue;
}

// main loop
const main = () => {
  Promise.all(
    fileList.map(async (file) => {
      const countryCsvData = await processCsvFile(comtradeDataPath(file))
      if (!countryCsvData) {
        return null;
      }
      // parse country number and name
      const [countryNumber, countryFile] = file.split("_");
      const [countryName,] = countryFile.split(".");

      const percentOfImports = determineUkrainePercentOfImports(countryCsvData)
      console.log(countryNumber, countryName, ` ${(percentOfImports * 100).toFixed(1)}% of grain imports from UKR`)
      return {
        countryName,
        countryNumber,
        data: countryCsvData,
        percentOfUkrImports: percentOfImports
      }
    })
    .filter(data => data)
  ).then(aggregatedData => {
    // aggregatedData contains everything we need to write everything into one big file
    // TODO: write everything to a single 00_all_data_ukraine.csv file
    console.log(`data collected for ${aggregatedData.length} countries`)
  })
}

// run the script
main();


