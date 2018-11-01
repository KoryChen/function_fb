const functions = require('firebase-functions');

const admin = require('firebase-admin');
admin.initializeApp();

exports.parseExchangeRate = functions.https.onRequest((req, res) => {
  let data = req.body;
  if(req.method !== 'POST') {
    return null;
  } else if (!data) {
    return res.status(500).json('DO NOTHING');
  } else {
    const now = new Date().toISOString();
    pushNewData(admin.database().ref('/data'), data, now);
    createLatestRates(data)
    modifyUpdatedTime(now).then( req => {
      return res.status(200).json(data);
    }).catch(error => {
      console.error(error);
      res.error(500);
    });
  }
});

function modifyUpdatedTime(updatedTime) {
  return admin.database().ref('updatedTime').set(updatedTime);  
}

function createLatestRates(currencyObject) {
  return admin.database().ref('latestRates').set(currencyObject); 
}

function pushNewData(ref, currencyObject, timeValue) {
  for (const currencyKey in currencyObject) {
    rateValue = currencyObject[currencyKey];
    ref.child(currencyKey).push({time: timeValue, rate: rateValue});
  }
}
