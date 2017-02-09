var fs = require('fs');
var async = require('async');
var rp = require('request-promise');
var Promise = require('promise');
var async = require('async');

module.exports = function(url, characters) {

    var playbookactions = null;

    var getTeam = function(teamName, onSuccess) {
        return new Promise(function(resolve, reject) {
            console.log("Retrieving Team " + teamName);
            var options = {
                uri: url + '/api/Teams?filter[where][Name]=' + teamName,
                headers: {
                    'User-Agent': 'Request-Promise'
                },
                json: true // Automatically parses the JSON string in the response
            };

            rp(options)
                .then(function(teams) {
                    console.log("Succesfully Retrieved Team " + teams);
                    resolve(teams[0]);
                })
                .catch(function(err) {
                    console.log("Error Retrieving team " + teamName);
                    reject(err);
                });
        });
    };


    function getPlaybookActions(onSuccess) {
        return new Promise(function(resolve, reject) {
            var options = {
                uri: url + '/api/PlaybookActions',
                headers: {
                    'User-Agent': 'Request-Promise'
                },
                json: true // Automatically parses the JSON string in the response
            };

            rp(options)
                .then(function(a) {
                    resolve(a);
                })
                .catch(function(err) {
                    console.log(err);
                    reject(err);
                });
        });
    };

    function createPlaybookColumn(col, onSuccess) {
        return new Promise(function(resolve, reject) {
            console.log("create column: " + col);

            var options = {
                method: 'POST',
                uri: url + '/api/PlaybookColumns',
                headers: {
                    'User-Agent': 'Request-Promise'
                },
                body: col,
                json: true // Automatically parses the JSON string in the response
            };

            rp(options)
                .then(function(column) {
                    console.log("Succesfully Created " + column);
                    resolve(column);
                })
                .catch(function(err) {
                    console.log(err);
                    reject(err);
                });
        });
    };

    function createPlaybookResult(result, onSuccess) {
        return new Promise(function(resolve, reject) {
            console.log("create result");

            var options = {
                method: 'POST',
                uri: url + '/api/PlayBookResults',
                headers: {
                    'User-Agent': 'Request-Promise'
                },
                body: result,
                json: true // Automatically parses the JSON string in the response
            };

            rp(options)
                .then(function(result) {
                    resolve(result);
                })
                .catch(function(err) {
                    console.log(err);
                    reject(err);
                });
        });
    }

    function createPlaybookResultAction(action) {
        return new Promise(function(resolve, reject) {
            console.log("create result action");

            var options = {
                method: 'POST',
                uri: url + '/api/PlayBookResultActions',
                headers: {
                    'User-Agent': 'Request-Promise'
                },
                body: action,
                json: true // Automatically parses the JSON string in the response
            };

            rp(options)
                .then(function(action) {
                    resolve(action);
                })
                .catch(function(err) {
                    console.log(err);

                    reject(err);
                });
        });
    }

    function getActionId(name) {
        console.log("searching for action " + name);
        var actionId = null;
        playbookactions.forEach(function(action) {
            if (action.Name == name) {
                console.log("found action");
                console.log(JSON.stringify(action));
                actionId = action.id;
            }
        });

        return actionId;
    };

    function addPlaybookColumnResult(result, columnId) {
        return new Promise(function(resolve, reject) {
            console.log("Adding Playbook Column Result");
            var momentous = result[0] == 'm';
            createPlaybookResult({
                Momentous: momentous,
                PlaybookColumnId: columnId
            }).then(
                function(playbookResultRecord) {
                    console.log("Created Playbook Result");
                    var order = 0;
                    for (var i = 0; i < result.length; i++) {
                        var r = result[i];
                        let actionId = null;
                        console.log("Finding Result " + r)
                        switch (r) {
                            case 'm':
                                continue;
                                break;
                            case 'k':
                                actionId = getActionId("Knock Down");
                                break;
                            case 'p':
                                actionId = getActionId("Push");
                                break;
                            case 'd':
                                actionId = getActionId("Dodge");
                                break;
                            case 't':
                                actionId = getActionId("Tackle");
                                break;
                            case '1':
                                actionId = getActionId("1 Damage");
                                break;
                            case '2':
                                actionId = getActionId("2 Damage");
                                break;
                            case '3':
                                actionId = getActionId("3 Damage");
                                break;
                            case '4':
                                actionId = getActionId("4 Damage");
                                break;
                            case 'g':
                                if (result[i + 1] == "g") {
                                    actionId = getActionId("Character Play 1");
                                    i++;
                                } else {
                                    actionId = getActionId("Character Play 2");
                                }
                                break;
                        }
                        console.log(actionId);
                        if (actionId) {
                            createPlaybookResultAction({
                                Order: order,
                                PlaybookResultId: playbookResultRecord.id,
                                PlaybookActionId: actionId
                            })

                            order++;
                        } else {
                            console.log("No Result Found");
                        }
                    }

                    resolve();
                });
        });
    };


    function addPlaybookColumn(results, columnNumber, characterId) {
        return new Promise(function(resolve, reject) {

            if (results) {
                console.log("Creating Column for " + characterId);
                createPlaybookColumn({
                    ColumnNumber: columnNumber,
                    CharacterId: characterId
                }).then(function(columnRecord) {
                    var resultSplit = ("" + results).split(',');
                    resultSplit.forEach(function(result) {
                        addPlaybookColumnResult(result, columnRecord.id, playbookactions);
                    });

                    resolve();
                });
            }
        });
    };

    function getCharacterPlay(name) {
        return new Promise(function(resolve, reject) {
            var options = {
                uri: url + '/api/Plays?filter[where][Name]=' + name,
                headers: {
                    'User-Agent': 'Request-Promise'
                },
                json: true
            };

            rp(options)
                .then(function(cps) {
                    console.log("Succesfully Retrieved CP " + name);
                    resolve(cps);
                })
                .catch(function(err) {
                    console.log("Error Retrieving CP " + name);
                    reject(err);
                });
        });
    };

    function getKeyword(name) {
        return new Promise(function(resolve, reject) {
            var options = {
                uri: url + '/api/Keywords?filter[where][Name]=' + name,
                headers: {
                    'User-Agent': 'Request-Promise'
                },
                json: true
            };

            rp(options)
                .then(function(Keywords) {
                    console.log("Succesfully Retrieved Keyword " + name);
                    resolve(Keywords);
                })
                .catch(function(err) {
                    console.log("Error Retrieving Keyword " + name);
                    reject(err);
                });
        });
    };


    function getCharacterTrait(name) {
        return new Promise(function(resolve, reject) {
            var options = {
                uri: url + '/api/Traits?filter[where][Name]=' + name,
                headers: {
                    'User-Agent': 'Request-Promise'
                },
                json: true
            };

            rp(options)
                .then(function(cts) {
                    console.log("Succesfully Retrieved CT " + name);
                    resolve(cts);
                })
                .catch(function(err) {
                    console.log("Error Retrieving CT " + name);
                    reject(err);
                });
        });
    };

    function createNewCharaterPlay(name, desc, cost, range, zone, sus, opt) {
        return new Promise(function(resolve, reject) {
            var options = {
                method: 'POST',
                uri: url + '/api/plays',
                headers: {
                    'User-Agent': 'Request-Promise'
                },
                body: {
                    Name: name,
                    Description: desc,
                    Cost: cost,
                    Range: range,
                    Zone: zone,
                    Sustain: sus,
                    OPT: opt
                },
                json: true // Automatically parses the JSON string in the response
            };

            rp(options)
                .then(function(cp) {
                    console.log("Succesfully created CP " + JSON.stringify(cp));
                    resolve(cp);
                })
                .catch(function(err) {
                    console.log("Error Creating CP " + character);
                    console.log(err);
                    reject(err);
                });
        });
    }

    function createNewCharaterTrait(name, desc, stip, type) {
        return new Promise(function(resolve, reject) {
            var options = {
                method: 'POST',
                uri: url + '/api/Traits',
                headers: {
                    'User-Agent': 'Request-Promise'
                },
                body: {
                    Name: name,
                    Description: desc,
                    Stipulation: stip,
                    type: type
                },
                json: true // Automatically parses the JSON string in the response
            };

            rp(options)
                .then(function(ct) {
                    console.log("Succesfully created ct " + JSON.stringify(ct));
                    resolve(ct);
                })
                .catch(function(err) {
                    console.log("Error Creating ct " + name);
                    console.log(err);
                    reject(err);
                });
        });
    }

    function createKeyword(name){
      return new Promise(function(resolve, reject) {
          var options = {
              method: 'POST',
              uri: url + '/api/Keywords',
              headers: {
                  'User-Agent': 'Request-Promise'
              },
              body: {
                  Name: name
              },
              json: true // Automatically parses the JSON string in the response
          };

          rp(options)
              .then(function(keyword) {
                  console.log("Succesfully created keyword " + JSON.stringify(keyword));
                  resolve(keyword);
              })
              .catch(function(err) {
                  console.log("Error Creating keyword " + name);
                  console.log(err);
                  reject(err);
              });
      });
    }

    function linkCharacterToKeyword(characterId, keywordId) {
        return new Promise(function(resolve, reject) {
            var options = {
                method: 'PUT',
                uri: url + '/api/Characters/' + characterId + '/Keywords/rel/' + keywordId,
                headers: {
                    'User-Agent': 'Request-Promise'
                },
                json: true // Automatically parses the JSON string in the response
            };

            rp(options)
                .then(function(rel) {
                    console.log("Succesfully linked Keyword" + JSON.stringify(rel));
                    resolve(rel);
                })
                .catch(function(err) {
                    console.log("Error  linking Keyword");
                    console.log(err);
                });
        });
    }

    function linkCharacterToPlay(characterId, playId) {
        return new Promise(function(resolve, reject) {
            var options = {
                method: 'PUT',
                uri: url + '/api/Characters/' + characterId + '/CharacterPlays/rel/' + playId,
                headers: {
                    'User-Agent': 'Request-Promise'
                },
                json: true // Automatically parses the JSON string in the response
            };

            rp(options)
                .then(function(ccp) {
                    console.log("Succesfully linked Character Play " + JSON.stringify(ccp));
                    resolve(ccp);
                })
                .catch(function(err) {
                    console.log("Error  linking Character Play");
                    console.log(err);
                });
        });
    }

    function linkCharacterToTrait(characterId, traitId) {
        return new Promise(function(resolve, reject) {
            var options = {
                method: 'PUT',
                uri: url + '/api/Characters/' + characterId + '/CharacterTraits/rel/' + traitId,
                headers: {
                    'User-Agent': 'Request-Promise'
                },
                json: true // Automatically parses the JSON string in the response
            };

            rp(options)
                .then(function(ccp) {
                    console.log("Succesfully linked Character Play " + JSON.stringify(ccp));
                    resolve(ccp);
                })
                .catch(function(err) {
                    console.log("Error  linking Character Play");
                    console.log(err);
                });
        });
    }

    function addCharacterPlay(characterId, name, desc, cost, range, zone, sus, opt) {
        return new Promise(function(resolve, reject) {
            getCharacterPlay(name).then(function(existingCharacterPlay) {
                if (existingCharacterPlay.length) {
                    console.log("found cp " + existingCharacterPlay[0].id);
                    linkCharacterToPlay(characterId, existingCharacterPlay[0].id).then(resolve);
                } else {
                    createNewCharaterPlay(name, desc, cost, range, zone, sus, opt)
                        .then(function(play) {
                            linkCharacterToPlay(characterId, play.id).then(resolve);
                        });
                }
            });
        });
    };

    function addKeyword(characterId, keyword) {
        return new Promise(function(resolve, reject) {
            getKeyword(keyword).then(function(existingKeyword) {
                if (existingKeyword.length) {
                    linkCharacterToKeyword(characterId, existingKeyword[0].id).then(resolve);
                } else {
                    createKeyword(keyword)
                        .then(function(keywordRecord) {
                            linkCharacterToKeyword(characterId, keywordRecord.id).then(resolve);
                        });
                }
            });
        });
    };

    function addCharacterTrait(characterId, name, desc, stip, type) {
        return new Promise(function(resolve, reject) {
            getCharacterTrait(name).then(function(existingCharacterTrait) {
                if (existingCharacterTrait.length) {
                    console.log("found ct " + existingCharacterTrait[0].id);
                    linkCharacterToTrait(characterId, existingCharacterTrait[0].id).then(resolve);
                } else {
                    createNewCharaterTrait(name, desc, stip, type)
                        .then(function(trait) {
                            linkCharacterToTrait(characterId, trait.id).then(resolve);
                        });
                }
            });
        });
    }

    function addCharacter(character) {
        return new Promise(function(resolve, reject) {
            getTeam(character.Team).then(function(team) {

                var characterInsert = {
                    "Name": character.Name,
                    "MeleeZone": character.MeleeZone,
                    "Jog": character.Jog,
                    "Sprint": character.Sprint,
                    "TAC": character.Tac,
                    "KickDice": character.KickDice,
                    "KickLength": character.KickLength,
                    "Defense": character.Defense,
                    "Armor": character.Armor,
                    "InfluenceStart": character.InfluenceStart,
                    "InfluenceMax": character.InfluenceMax,
                    "IconUrl": character.Name,
                    "Health": character.Health,
                    "IcySponge": character.IcySponge,
                    "TeamId": team.id,
                    "Size": character.Size,
                    "Season": character.Season
                };

                var options = {
                    method: 'POST',
                    uri: url + '/api/characters',
                    headers: {
                        'User-Agent': 'Request-Promise'
                    },
                    body: characterInsert,
                    json: true // Automatically parses the JSON string in the response
                };

                rp(options)
                    .then(function(c) {
                        console.log(c);
                        resolve(c);
                    })
                    .catch(function(err) {
                        console.log("Error Creating Character " + character);
                        console.log(err);
                        resolve();
                    });
            });
        });

    }

    function addCharacterPlayBooks(character, characterId) {
        return new Promise(function(resolve, reject) {
            async.timesLimit(
                9,
                1,
                function(n, next) {
                    let i = n + 1;
                    if (character["PB" + i]) {
                        addPlaybookColumn(character["PB" + i], i, characterId).then(next);
                    } else {
                        next();
                    }
                },
                resolve);
        });
    }

    function addCharacterPlays(character, characterId) {
        return new Promise(function(resolve, reject) {
            async.timesLimit(
                3,
                1,
                function(n, innernext) {
                    let i = n + 1;
                    if (character["CP" + i + "Name"]) {
                        addCharacterPlay(characterId, character["CP" + i + "Name"],
                                character["CP" + i + "Description"],
                                character["CP" + i + "CST"],
                                character["CP" + i + "RNG"],
                                character["CP" + i + "ZON"],
                                character["CP" + i + "SUS"],
                                character["CP" + i + "OPT"])
                            .then(function() {
                                innernext();
                            });
                    } else {
                        console.log("Did not find CP" + i + "Name");
                        innernext();
                    }
                },
                resolve);
        });
    }

    function addCharacterTraits(character, characterId) {
        return new Promise(function(resolve, reject) {
            async.timesLimit(
                4,
                1,
                function(n, traitnext) {
                    let i = n + 1;

                    if (character["CT" + i + "Name"]) {
                        addCharacterTrait(characterId,
                                character["CT" + i + "Name"],
                                character["CT" + i + "Desc"],
                                character["CT" + i + "Stip"],
                                "Character Trait")
                            .then(function() {
                                traitnext();
                            });
                    } else {
                        console.log("Did not find CT" + i + "Name");
                        traitnext();
                    }
                },
                resolve);
        });
    }

    function addLegendaryPlays(character, characterId) {
        return new Promise(function(resolve, reject) {
            async.timesLimit(
                1,
                1,
                function(n, traitnext) {
                    let i = n + 1;

                    if (character["LP" + i + "Name"]) {

                        addCharacterTrait(characterId,
                                character["LP" + i + "Name"],
                                character["LP" + i + "Desc"],
                                character["LP" + i + "Stip"],
                                "Legendary Play")
                            .then(function() {
                                traitnext();
                            });
                    } else {
                        console.log("Did not find LP" + i + "Name");
                        traitnext();
                    }
                },
                resolve);
        });
    }

    function addHeroicPlays(character, characterId) {
        return new Promise(function(resolve, reject) {
            async.timesLimit(
                1,
                1,
                function(n, traitnext) {
                    let i = n + 1;

                    if (character["HP" + i + "Name"]) {

                        addCharacterTrait(characterId,
                                character["HP" + i + "Name"],
                                character["HP" + i + "Desc"],
                                character["HP" + i + "Stip"],
                                "Heroic Play")
                            .then(function() {
                                traitnext();
                            });
                    } else {
                        console.log("Did not find HP" + i + "Name");
                        traitnext();
                    }
                },
                resolve);
        });
    }

    function addKeywords(keywords, characterId) {
        return new Promise(function(resolve, reject) {
            let keywordsArray = keywords.split(",");
            async.eachSeries(
                keywordsArray,
                function(keyword, next) {
                      console.log(keyword);
                      addKeyword(characterId, keyword)
                          .then(function() {
                              next();
                          });
                },
                resolve);
        });
    }

    function importCharacter(character) {
        return new Promise(function(resolve, reject) {
            addCharacter(character).then(function(createdCharacter) {
                    var characterId = createdCharacter.id;
                    addCharacterPlayBooks(character, characterId).then(function() {
                        addCharacterPlays(character, characterId).then(function() {
                            addCharacterTraits(character, characterId).then(function() {
                                addLegendaryPlays(character, characterId).then(function() {
                                    addHeroicPlays(character, characterId).then(function() {
                                      addKeywords(character.Keywords, characterId).then(function(){
                                        resolve();
                                      })
                                    });
                                });
                            });
                        })
                    });
                });
        });
    };

    getPlaybookActions().then(function(pba) {
        playbookactions = pba;
        async.eachSeries(characters, function(character, callback) {
            importCharacter(character).then(callback);
        });
    });
}
