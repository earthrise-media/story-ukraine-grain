import fs from "fs";
import path from "path";
import fetch from "node-fetch";
import * as d3 from "d3";

/*

We are going to pull export data from Ukraine from the comtrade API
Then we are going to save that data as a file
Using that data, we will then grab the import data for all of the relevant countries from the comtrade API and save those as files, and also combine them into one file */

// Comtrade API urls look like this:
// combinedCallString = `${apiBaseUrl}api/get?max=10000&type=C&freq=A&px=HS&ps=${selectedYears.join('%2C')}&r=${selectedCountry}&p=all&rg=${tradeCodeForTradeType}&cc=${foodCodeJoined}`
//
// combinedCallString = "https://comtrade.un.org/api/get?max=10000&type=C&freq=A&px=HS&ps=2000%2C2021&r=804&p=all&rg=2&cc=01%2C02%2C03%2C04%2C05%2C07%2C08%2C09%2C10%2C11%2C12%2C13%2C15%2C16%2C17%2C19%2C20"

// This JSON file has country codes for ComTrade https://raw.githubusercontent.com/cameronkruse/food-security/main/pages/assets/reporting_areas.json
// Objects have an "id" and a "text" property
// First let's grab the export data for Ukraine, country code 804

// these do not
const foodCodes = ["10"]; // 1044 wheat, 1045 millet
const foodCodesJoined = foodCodes.join("%2C");

// use fetch to grab the data for ukraine from comtrade
const apiBaseUrl = "https://comtrade.un.org/";

const selectedYears = ["2021"];

function getCountryComtradeData(tradeType, countryCode) {
  // tradeType is either 1 for import or 2 for export
  // countryCode is the comtrade country code
  const tradeCodeForTradeType = tradeType;
  const combinedCallString = `${apiBaseUrl}api/get?max=10000&type=C&freq=A&px=HS&ps=${selectedYears.join(
    "%2C"
  )}&r=${countryCode}&p=all&rg=${tradeCodeForTradeType}&cc=${foodCodesJoined}`;

  // return the fetch of that API call
  return fetch(combinedCallString).then((response) => response.json()) // Returns a promise that we can await or .then()
}

// we need a function go through Ukraine export data and create a list of all the countries that receive exports from Ukraine
// comtrade data looks like this when fetched
// {
//   pfCode: 'H5',
//   yr: 2021, // The year we are looking at
//   period: 2021,
//   periodDesc: '2021',
//   aggrLevel: 2,
//   IsLeaf: 0,
//   rgCode: 1, // Whether the country imported or exported
//   rgDesc: 'Import', // Description for rgCode
//   rtCode: 804,
//   rtTitle: 'Ukraine', // Long name of exporter country
//   rt3ISO: 'UKR', // Iso3 code of exporter country
//   ptCode: 842, // Comtrade code for importer country
//   ptTitle: 'USA', // Long name of importer country
//   pt3ISO: 'USA', // Iso3 code of importer country
//   ptCode2: null,
//   ptTitle2: '',
//   pt3ISO2: '',
//   cstCode: '',
//   cstDesc: '',
//   motCode: '',
//   motDesc: '',
//   cmdCode: '10', // Commodity code
//   cmdDescE: 'Cereals', // Commodity code description
//   qtCode: 1,
//   qtDesc: 'No Quantity',
//   qtAltCode: null,
//   qtAltDesc: '',
//   TradeQuantity: 0,
//   AltQuantity: null,
//   NetWeight: 0, // Weight (sometimes empty)
//   GrossWeight: null,
//   TradeValue: 3236392, // Trade value in $$ (this is the most accurate)
//   CIFValue: null,
//   FOBValue: null,
//   estCode: 0
// },
// Use fetch to grab the data from the URL and console.log it out
// fetch(combinedCallString)
//   .then((response) => response.json())

const main = async () => {
    const data = await getCountryComtradeData("2", "804") // 1 for import, 804 for Ukraine

    console.log("data", data);

    // Once we receive the ukrainian export data
    // we need to make an array of the importee countries

    // We can use the ptCode to get the country code
    // We can use the ptTitle to get the country name
    const importeeCountries = data.dataset.map((d) => {
        return {
        ptCode: d.ptCode,
        ptTitle: d.ptTitle,
        };
    });

    // Save out Ukraine export data as a csv
    const csv = d3.csvFormat(data.dataset);

    // save the csv to a file
    fs.writeFileSync(
        path.join(`public/data/comtrade_exports/804_Ukraine.csv`),
        csv
    );

    console.log(importeeCountries)  
    for(const country of importeeCountries){
        console.log('Fetching data for country code '+country.ptCode)
        
        // Wait 2 seconds between each request to avoid reate limit
        await new Promise(resolve => setTimeout(resolve, 2000))
        // Do the call
        const data = await getCountryComtradeData("1", country.ptCode)

        console.log(country.ptTitle, data)
        

        // format as a csv with d3 and then save it to a file
        const csv = d3.csvFormat(data.dataset)

        // save the csv to a file
        fs.writeFileSync(
            path.join(
            `public/data/comtrade_imports/${country.ptCode}_${country.ptTitle}.csv`
            ),
            csv
        );



    }
    
}

function determineUkrainePercentOfImports(importeeComtradeData) {
  // importee comtrade data 
}

main();