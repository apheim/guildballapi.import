var fs = require('fs');
var async = require('async');
var Promise = require('promise');
var rp = require('request-promise');

module.exports = function(url, teams) {
    return new Promise(function(resolve, reject) {
            let dataImported = 0;
            teams.forEach(function(data) {
                var options = {
                    method: 'POST',
                    uri: url + '/api/Teams',
                    headers: {
                        'User-Agent': 'Request-Promise'
                    },
                    json: true,
                    body: {
                        Name: data.Name,
                        IconUrl: data.IconURL
                    }
                };

                rp(options)
                    .then(function(team) {
                        console.log("Succesfully Created Team " + team);
                        if (++dataImported == teams.length){
                          resolve();
                        }
                    })
                    .catch(function(err) {
                        console.log("Error Creating Team " + err);
                        reject(err);
                    });
            });
    });
};
