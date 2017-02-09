var characterImport = require("./imports/character-import.js");
var teamImport = require("./imports/team-import.js");
var playBookActionImport = require("./imports/playbook-action-import.js");
var Tabletop = require('tabletop');

var url = "http://localhost:3000";
Tabletop.init({
    key: 'https://docs.google.com/spreadsheets/d/1uTd6nVB4f9IG4Io2386uueZQtSbhsGu3DDJsczb09R4/pubhtml',
    callback: function(data, tabletop) {
        var teams = tabletop.models.Teams.all();
        var actions = tabletop.models.PlaybookActions.all();
        var characters = tabletop.models.Characters.all();

        teamImport(url, teams).then(function(){
          playBookActionImport(url, actions).then(
            function(){
              characterImport(url, characters);
            });
          });
    }});
