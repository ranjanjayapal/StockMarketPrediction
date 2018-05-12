const express = require('express');
const router = express.Router();
const MongoClient = require('mongodb').MongoClient;
const ObjectID = require('mongodb').ObjectID;
var cts = require('check-ticker-symbol');
var Quandl = require("quandl");
var quandl = new Quandl();

var url = "mongodb://localhost:27017/"; 

var options = {
    auth_token: "AENaz-R8uBmUxQsYrLzD"
}

quandl.configure(options);

/**
 * This endpoint will search if a company exists with the given symbol.
 * To validate a companies stock symbol I am using `check-ticker-symbol` library.
 * If it does exist, the dataset is retrieved from Quandl API and
 * added to mongo. 
*/
router.get('/searchcompany/:companyname', (req, res) => {
    companyname = req.params.companyname;
    if (cts.valid(companyname)) {
        var result = quandl.dataset({ source: 'WIKI', table: companyname}, { order:'asc', start_date: '2010-01-01' }, function(err, response) {
            if(err) {
                data = {
                    'validity': 'noDataRetrieved'
                };
                res.json(data);
            } else {
                var dataset = JSON.parse(response);
                // Parse data and add it to mongo as, entered company symbol is valid and dataset exists
                if (dataset.dataset !== undefined) {
                    MongoClient.connect(url, function(err, db) {
                        if (err) throw err;
                        var dbo = db.db("stocks");
                        var type = '';
                        dbo.collection("stock").update( { _id: companyname }, { _id: companyname, dataset: dataset.dataset }, { upsert: true }, function(err, response1) {
                            if (err) throw err;
                            console.log('1 document inserted/updated');
                            // Send the response back to front end with a valid JSON.
                            data = {
                                'validity': 'valid',
                                'dataset': dataset.dataset,
                                'type': 'insert/update'
                            };
                            res.json(data);
                            db.close();
                        });
                    });
                } else {
                    data = {
                        'validity': 'noData'
                    };
                    res.json(data);
                }
            }
        });
    } else {
        data = {
            'validity': 'invalid'
        };
        res.json(data);
    }
});


module.exports = router;