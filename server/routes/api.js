const express = require('express');
const router = express.Router();
const MongoClient = require('mongodb').MongoClient;
const ObjectID = require('mongodb').ObjectID;

var moment = require('moment');
const ml = require('ml-regression');

var url = "mongodb://localhost:27017/"; 

// Error handling
const sendError = (err, res) => {
    response.status = 501;
    response.message = typeof err == 'object' ? err.message : err;
    res.status(501).json(response);
};

// Response handling
let response = {
    status: 200,
    data: [],
    message: null
};

// Searches for all companies whose stock price is less than investment limit
router.get('/stocks/:limit', (req, res) => {
    limit = req.params.limit;
    MongoClient.connect(url, function(err, db) {
        if (err) throw err;
        var dbo = db.db("stocks");
        var processedRecords = 0;
        var records =  dbo.collection("stock").find().toArray();
        records.then((data) => {
            var companies = [];
            data.forEach(function(Indstock) {
                if (Indstock !== null) {
                    if (parseInt(Indstock.dataset.data[Indstock.dataset.data.length - 1][4]) < parseInt(limit)) {
                        companies.push(Indstock.dataset);
                    }
                }
            });
            return companies;
        }).then((data) => {
            res.json({
                'companies': data
            });
        });
    });
});

/* Predict the future of the company using companyData
Return the predicted value */
router.get('/prediction', (req, res) => {
    var predictCompanyData = req.query.companydata;
    var predictYears = req.query.years;

    MongoClient.connect(url, function(err, db) {
        if (err) throw err;
        var dbo = db.db("stocks");
        var processedRecords = 0;
        var records =  dbo.collection("stock").find().toArray();
        records.then((data) => {
            var dates = [];
            var prices = [];
            var dataset = '';
            data.forEach(function(Indstock) {
                if (Indstock !== null) {
                    if (Indstock.dataset.name === predictCompanyData) {
                        dataset = Indstock.dataset;
                        for (var i=0; i<Indstock.dataset.data.length; i++) {
                            dates[i] = parseFloat(Indstock.dataset.data[i][0].split('-')[0]);
                            prices[i] = parseFloat(Indstock.dataset.data[i][4]);
                        }
                    }
                }
            });
            var data = {
                'dataset': dataset,
                'dates': dates,
                'prices': prices
            };
            return data;
        }).then((data) => {
            // prediction begins!
            const SLR = ml.SLR;
            regression = new SLR(data['dates'], data['prices']);
            var yearToPredict = parseFloat(predictYears) + parseFloat(moment().format('YYYY'));
            var predictedValue = regression.predict(parseFloat(yearToPredict));
            res.json({
                'dataset': data['dataset'],
                'predictedValue': predictedValue,
                'yearToPredict': yearToPredict
            });
        });
    });
});


module.exports = router;