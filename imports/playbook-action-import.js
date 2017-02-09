var fs = require('fs');
var async = require('async');
var rp = require('request-promise');
var Promise = require('promise');
var rp = require('request-promise');

module.exports = function(url, actions) {
    return new Promise(function(resolve, reject) {
        var dataImported = 0;
        
        actions.forEach(function(action) {
          var options = {
                method: 'POST',
                uri: url + '/api/PlaybookActions',
                headers: {
                    'User-Agent': 'Request-Promise'
                },
                json: true,
                body: {
                    Name: action.Name,
                    IconUrl: action.IconUrl,
                    Damage: action.Damage,
                    DamageValue: action.DamageValue,
                    Abbreviation: action.Abbreviation
                }
            };

            rp(options)
                .then(function(action) {
                    console.log("Succesfully Created Playbook Action " + action);
                    if (++dataImported == actions.length)
                        resolve();
                })
                .catch(function(err) {
                    console.log("Error Creating Created Playbook Action " + err);
                    reject(err);
                });
        });
    });
};
