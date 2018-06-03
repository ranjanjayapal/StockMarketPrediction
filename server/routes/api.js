const express = require('express');
const router = express.Router();
const MongoClient = require('mongodb').MongoClient;
const ObjectID = require('mongodb').ObjectID;

var moment = require('moment');
const ml = require('ml-regression');
var Twit = require('twit');
var Sentiment = require('sentiment');
var sentiment = new Sentiment();
var twitConfig = new Twit({
    consumer_key: 'JuJc4oIHYhOCddxQTaiSINl4n',
    consumer_secret: 'vICclvQ1LQsx494RRQBQi6lR9CbU6QruIffxwHT2s9dUsrPzzY',
    access_token: '980655830486962177-gfOYf34T2pOv12Ww3LuxpPPc0eoOP2S',
    access_token_secret: 'T8mSnDrdx2FddSgtuP3NPthb2V0BUBAgr8FcPdEcDssPg',
    timeout_ms: 60*1000
});

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
            if (data.length === 0) {
                res.json({
                    'noCompanies': 'true'
                });
            } else {
                res.json({
                    'companies': data
                });
            }
            
        });
    });
});

/* Predict the future of the company using companyData
Return the predicted value */
router.get('/prediction', (req, res) => {
    var predictCompanyData = req.query.companydata;
    var predictYears = '';
    var predictMonths = '';

    if (req.query.years !== undefined) {
        predictYears = req.query.years;
    } else {
        predictMonths = req.query.months;
    }
    console.log('predictMonths: ' + predictMonths);
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
                            if (predictYears !== '') {
                                dates[i] = parseFloat(Indstock.dataset.data[i][0].split('-')[0]);
                            } else {
                                dates[i] = parseFloat(Indstock.dataset.data[i][0].split('-')[1]);
                            }
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
            var yearToPredict = '';
            var monthToPredict = '';

            if (predictYears !== '') {
                yearToPredict = parseFloat(predictYears) + parseFloat(moment().format('YYYY'));
            } else {
                monthToPredict = parseFloat(predictMonths) + parseFloat(moment().format('MM'));
            }
            console.log('MonthToPredict: ' + monthToPredict);
            var predictedValue = '';

            if (yearToPredict !== '') {
                predictedValue = regression.predict(parseFloat(yearToPredict));
            } else {
                predictedValue = regression.predict(parseFloat(monthToPredict));
            }
            console.log('predictedValue: ' + predictedValue);

            var companyName = predictCompanyData.split(' ');
            twitConfig.get('search/tweets', {q: companyName[0] + ' since:2018-02-01', count: 100}, function(err, data, response) {
                if (err) throw err;
                return response;
            }).then((tweets) => {
                var tweetResults = [];
                var positives = 0;
                var negatives = 0;

                for (var i = 0; i<tweets.data.statuses.length; i++) {
                    tweetResults[i] = sentiment.analyze(tweets.data.statuses[i].text);
                }
                for (var i = 0; i<tweetResults.length; i++) {
                    if (tweetResults[i].score > 0) {
                        positives += 1;
                    } else if (tweetResults[i].score < 0) {
                        negatives += 1;
                    }
                }
                res.json({
                    'dataset': data['dataset'],
                    'predictedValue': predictedValue,
                    'yearToPredict': yearToPredict,
                    'monthToPredict': monthToPredict,
                    'sentiment-result-positives': positives,
                    'sentiment-result-negatives': negatives
                });
            });
        });
    });
});


module.exports = router;