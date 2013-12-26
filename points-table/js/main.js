var currentPlayerIndex = 0;
var roundNumber = 0;
var playerNames = [];
var playerPoints = [];
var currentTableRow = null;

var pt_init = function () {
    jQuery('section').hide();
    jQuery('#step1').show();
    jQuery('#start_button').on('click', pt_setPlayerCount);
    jQuery('#save_names').on('click', pt_setPlayerNames);
    jQuery('#enter_points').on('click', pt_enterPlayerPoints);
    jQuery('#no_points').on('click', pt_enterPlayerNoPoints);
    jQuery('#points_form').on('submit', function (event) {
        event.preventDefault();
        pt_enterPlayerPoints();
    });
    jQuery('#number_of_players').focus().on('keypress', function (event) {
        if (event.keyCode == 13) {
            pt_setPlayerCount();
        }
    });
    jQuery(document).on('unload', function (event) {
        return "You will lose all data. Proceed anyway?";
    });
};

var pt_setPlayerCount = function (event) {
    jQuery('#step1').hide();
    var numberOfPlayers = jQuery('#number_of_players').val();
    currentPlayerIndex = numberOfPlayers;
    for (var i = 1; i <= numberOfPlayers; ++i) {
        var newRow = document.createElement('tr');
        var newTd = document.createElement('td');
        newTd.textContent = i;
        jQuery(newRow).append(newTd);
        newTd = document.createElement('td');
        var newInput = document.createElement('input');
        if (i < numberOfPlayers) {
            jQuery(newInput).on('keypress', function (event) {
                if (event.keyCode == 13) {
                    var parentTr = jQuery(event.target).parent('td').parent('tr').next();
                    var targetInput = jQuery(parentTr).children('td:nth-child(2)').children('input').first();
                    jQuery(targetInput).focus();
                }
            });
        } else {
            jQuery(newInput).on('keypress', function (event) {
                if (event.keyCode == 13) {
                    pt_setPlayerNames();
                }
            });
        }
        jQuery(newInput).attr('type', 'text');
        playerNames.push(newInput);
        playerPoints.push(0);
        jQuery(newRow).append(newTd);
        jQuery(newTd).append(newInput);
        jQuery('#step2 table tbody').append(newRow);
    }
    jQuery('#step2').show();
    jQuery(playerNames[0]).focus();
};

var pt_setPlayerNames = function (event) {
    jQuery('#step2').hide();
    var actualPlayerNames = [];
    for (var i = 0; i < playerNames.length; ++i) {
        var playerName = jQuery(playerNames[i]).val();
        actualPlayerNames.push(playerName);
        var newTh = document.createElement('th');
        newTh.textContent = playerName;
        jQuery('#step4 table#points_table thead #player_names').append(newTh);
        newTh = document.createElement('th');
        newTh.textContent = 0;
        jQuery('#step4 table#points_table thead #total_points').append(newTh);
    }
    playerNames = actualPlayerNames;
    pt_nextPointsInput();
    jQuery('#step3').show();
    jQuery('#points').focus();
};

var pt_nextPointsInput = function (event) {
    currentPlayerIndex++;
    if (currentPlayerIndex >= playerNames.length) {
        roundNumber++;
        currentPlayerIndex = 0;
        var newRow = document.createElement('tr');
        var targetElement = jQuery('#step4 table#points_table tbody');
        jQuery(targetElement).append(newRow);
        currentTableRow = newRow;
        var newTd = document.createElement('td');
        newTd.textContent = roundNumber;
        jQuery(currentTableRow).append(newTd);
    }
    var playerName = playerNames[currentPlayerIndex] + "'";
    if (playerName.substr(playerName.length - 2) != "s'") {
        playerName += 's';
    }
    jQuery('#step3 #round_info').text('Round ' + roundNumber + ": It's " + playerName + " turn!");
};

var pt_enterPlayerPoints = function (event) {
    var points = jQuery('#points').val();
    if (points != "") {
        pt_addPlayerPoints(parseInt(points));
    }
    jQuery('#points').val('').focus();
};

var pt_enterPlayerNoPoints = function (event) {
    pt_addPlayerPoints(0);
};

var pt_addPlayerPoints = function (points) {
    var newTd = document.createElement('td');
    newTd.textContent = points;
    jQuery(newTd).attr('data-round', roundNumber);
    jQuery(newTd).attr('data-player', currentPlayerIndex);
    jQuery(newTd).attr('data-value', points);
    jQuery(newTd).on('click', pt_editPoints);
    jQuery(currentTableRow).append(newTd);
    playerPoints[currentPlayerIndex] += points;
    var totalPointThs = jQuery('#step4 table#points_table thead tr#total_points th');
    totalPointThs[currentPlayerIndex + 1].textContent = playerPoints[currentPlayerIndex];
    pt_highlightLeader();
    if (!jQuery('#step4').is(':visible')) {
        jQuery('#step4').show();
        jQuery('#ranking').show();
    }
    pt_nextPointsInput();
};

var pt_editPoints = function (event) {
    var newInput = document.createElement('input');
    jQuery(newInput).attr('type', 'number');
    jQuery(newInput).val(event.target.textContent);
    jQuery(newInput).on('keypress', function (event) {
            var targetTd = jQuery(event.target).parent();
            var oldValue = jQuery(targetTd).attr('data-value');
            if (event.keyCode == 13) {
                var newValue = jQuery(event.target).val();
                jQuery(targetTd).empty().text(newValue).attr('data-value', newValue);
                var playerIndex = parseInt(jQuery(targetTd).attr('data-player'));
                playerPoints[playerIndex] += (newValue - oldValue);
                var totalPointsThs = jQuery('#step4 table#points_table thead tr#total_points th');
                totalPointsThs[playerIndex + 1].textContent = playerPoints[playerIndex];
                pt_highlightLeader();
                jQuery('#points').focus();
            }
    });
    jQuery(newInput).on('blur', function (event) {
        var oldValue = jQuery(event.target).parent('td').attr('data-value');
        jQuery(event.target).parent('td').empty().text(oldValue);
        jQuery('#points').focus();
    });
    jQuery(event.target).empty().append(newInput);
    jQuery(newInput).focus().select();
};

var pt_highlightLeader = function () {
    var highestPoints = 0;
    var leadingPlayerIndexes = [];
    var pointsMap = [];
    for (var i = 0; i < playerPoints.length; ++i) {
        pointsMap.push({name: playerNames[i], points: playerPoints[i]});
        if (playerPoints[i] > highestPoints) {
            leadingPlayerIndexes = [i];
            highestPoints = playerPoints[i];
        }
        else if (playerPoints[i] == highestPoints) {
            leadingPlayerIndexes.push(i);
        }
    }
    var totalPointThs = jQuery('#step4 table#points_table thead tr#total_points th');
    jQuery(totalPointThs).removeClass('leader');
    for (var j = 0; j < leadingPlayerIndexes.length; ++j) {
        jQuery(totalPointThs[leadingPlayerIndexes[j] + 1]).addClass('leader');
    }
    pointsMap.sort(function (a, b) {
        return b.points - a.points;
    });
    jQuery('#ranking table#ranking_table tbody').empty();
    var rank = 0;
    var currentRankPoints = -1;
    for (var i = 1; i <= pointsMap.length; ++i) {
        if ((currentRankPoints > pointsMap[i - 1].points) || (currentRankPoints < 0)) {
            rank++;
            currentRankPoints = pointsMap[i - 1].points;
        }
        var newTr = document.createElement('tr');
        var newTd = document.createElement('td');
        newTd.textContent = rank + '.';
        jQuery(newTr).append(newTd);
        newTd = document.createElement('td');
        newTd.textContent = pointsMap[i - 1].name;
        jQuery(newTr).append(newTd);
        newTd = document.createElement('td');
        newTd.textContent = pointsMap[i - 1].points;
        jQuery(newTr).append(newTd);
        jQuery('#ranking table#ranking_table tbody').append(newTr);
    }
};

jQuery(document).ready(function(){
    pt_init();
});