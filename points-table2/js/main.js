(function ($) {
    
    $.fn.pointsTable = function () {
        if ($('div#pt_container').length) {
            console.log('Only one points table can be used per page!');
        } else {
            showSettings(this);
        }
        return this;
    };
    
    var players = [],
        currentRound = 0,
        currentPlayerIndex = 0,
        currentTableCell = null,
        pointsTable = null,
        rankingTable = null,
        histogramTable = null;
    
    function showSettings(targetElement) {
        var numberOfPlayersSelect = document.createElement('select'),
            optionElem = null,
            settingsContainer = document.createElement('div'),
            playerNamesFields = document.createElement('ol'),
            saveButton = document.createElement('button'),
            i = 1;
        for (i = 1; i <= 10; i++) {
            optionElem = document.createElement('option');
            $(optionElem).val(i).text(i + ' Player' + (i > 1 ? 's' : ''));
            $(numberOfPlayersSelect).append(optionElem);
        }
        $(numberOfPlayersSelect).on('change', showPlayerNameFields);
        $(saveButton).on('click', savePlayerNames).text('Save Player Names');
        $(settingsContainer).attr('id', 'pt_container').append(numberOfPlayersSelect).append(playerNamesFields).append(saveButton);
        $(targetElement).append(settingsContainer);
        showPlayerNameFields({target: numberOfPlayersSelect});
    }
    
    function showPlayerNameFields(event) {
        var numberOfPlayers = parseInt($(event.target).val()),
            playerNamesFields = $(event.target).siblings('ol').first().children('li'),
            newListElem = null,
            newListElems = [],
            newInput = null,
            i = 0;
        if (numberOfPlayers !== playerNamesFields.length) {
            for (i = 0; i < numberOfPlayers; i++) {
                newListElem = document.createElement('li');
                newInput = document.createElement('input');
                $(newInput).attr('type', 'text');
                if (i < playerNamesFields.length) {
                    $(newInput).val($(playerNamesFields[i]).children('input').first().val());
                }
                $(newListElem).append(newInput);
                newListElems.push(newListElem);
            }
            $(event.target).siblings('ol').empty().append(newListElems);
        }
    }
    
    function savePlayerNames(event) {
        var playerNamesFields = $(event.target).siblings('ol').first().children('li'),
            playerName = '',
            targetElement = $(event.target).parent('div'),
            i = 0;
        for (i = 0; i < playerNamesFields.length; i++) {
            playerName = $(playerNamesFields[i]).children('input').first().val().trim();
            if (playerName === '') {
                playerName = "Player " + (i +1);
            }
            players.push({'name': playerName, 'points': 0});
        }
        $(targetElement).empty();
        initializePointsTable();
    }
    
    function initializePointsTable() {
        var newRow = null,
            newCell = null,
            tableBody = null,
            i = 0;
        pointsTable = document.createElement('table');
        $(document).on('keydown', handleKeyDown);
        $(pointsTable).addClass('pt_points_table');
        $(pointsTable).html('<thead><th>Player</th><th>Sum</th></thead><tbody></tbody>');
        tableBody = $(pointsTable).children('tbody').first();
        for (i = 0; i < players.length; i++) {
            newRow = document.createElement('tr');
            newCell = document.createElement('th');
            $(newCell).text(players[i].name);
            $(newRow).append(newCell);
            newCell = document.createElement('td');
            $(newCell).text('0').addClass('pt_sum');
            $(newRow).append(newCell);
            $(tableBody).append(newRow);
        }
        currentPlayerIndex = players.length;
        rankingTable = document.createElement('table');
        $(rankingTable).attr('id', 'pt_ranking_table').html('<thead><tr><th colspan="3">Ranking</th></tr><tr><th>Rank</th><th>Player</th><th>Points</th></thead><tbody></tbody>');
        histogramTable = document.createElement('table');
        $(histogramTable).attr('id', 'pt_histogram_table').html('<thead><tr><th>Points Histogram</th></tr></thead><tbody><tr class="pt_bar_row"><td><div style="height: 100%"></div></td></tr><tr><td>0</td></tr></tbody>');
        $('div#pt_container').append(pointsTable).append(rankingTable).append(histogramTable);
        startNextRound();
        updateRanking();
        updateHistogram();
    }
    
    function startNextRound() {
        var newCell = document.createElement('th'),
            tableRows = $(pointsTable).children('tbody').first().children('tr'),
            i = 0;
        currentRound++;
        $(newCell).text(currentRound + '.');
        $(pointsTable).children('thead').first().children('tr').first().append(newCell);
        for (i = 0; i <= players.length; i++) {
            newCell = document.createElement('td');
            $(tableRows[i]).append(newCell);
        }
        currentPlayerIndex = 0;
        if (currentTableCell !== null) {
            $(currentTableCell).removeClass('pt_highlighted');
        }
        currentTableCell = $(tableRows[0]).children('td').last().addClass('pt_highlighted');
    }
    
    function handleKeyDown(event) {
        var oldPoints = 0,
            points = 0,
            tmp = "";
        if (currentTableCell !== null) {
            console.log("Key pressed: " + event.keyCode);
            // numbers
            if ((event.keyCode >= 48) && (event.keyCode <= 57)) {
                event.preventDefault();
                tmp = $(currentTableCell).text();
                oldPoints = parseInt(tmp);
                if (isNaN(oldPoints)) {
                    oldPoints = 0;
                }
                points = parseInt(tmp + (event.keyCode - 48));
                $(currentTableCell).text(points);
                addPlayerPoints(currentPlayerIndex, points - oldPoints);
            }
            // backspace
            else if (event.keyCode == 8) {
                event.preventDefault();
                tmp = $(currentTableCell).text();
                oldPoints = parseInt(tmp);
                if (isNaN(oldPoints)) {
                    oldPoints = 0;
                }
                points = parseInt(tmp.substr(0, (tmp.length - 1)));
                if (isNaN(points)) {
                    points = 0;
                }
                $(currentTableCell).text(points);
                addPlayerPoints(currentPlayerIndex, points - oldPoints);
            }
            // enter
            else if (event.keyCode == 13) {
                event.preventDefault();
                highlightNextCell();
            }
        }
    }
    
    function addPlayerPoints(playerIndex, points) {
        var tableRows = $(pointsTable).children('tbody').first().children('tr');
        players[playerIndex].points += points;
        $(tableRows[playerIndex]).children('td').first().text(players[playerIndex].points);
        updateRanking();
        updateHistogram();
    }
    
    function highlightNextCell() {
        var tableRows = $(pointsTable).children('tbody').first().children('tr');
        currentPlayerIndex++;
        if (currentPlayerIndex >= players.length) {
            startNextRound();
        } else {
            $(currentTableCell).removeClass('pt_highlighted');
            currentTableCell = $(tableRows[currentPlayerIndex]).children('td').last();
            $(currentTableCell).addClass('pt_highlighted');
        }
    }
    
    function updateRanking() {
        var ranking = [],
            tableBody = $(rankingTable).children('tbody').first(),
            currentRank = 0,
            currentRankPoints = null,
            newRow = null;
        $(players).each(function(index, elem){
            ranking.push(elem);
        });
        ranking.sort(function(a,b) {
            return  b.points - a.points;
        });
        $(tableBody).empty();
        $(ranking).each(function(index, elem){
            newRow = document.createElement('tr');
            if ((currentRankPoints == null) || (elem.points < currentRankPoints)) {
                currentRank++;
                currentRankPoints = elem.points;
            }
            $(newRow).html('<td>' + currentRank + '.</td><td>' + elem.name + '</td><td>' + elem.points + '</td>');
            $(tableBody).append(newRow);
        });
        
    }
    
    function updateHistogram() {
        var histogram = {},
            tableBody = $(histogramTable).children('tbody').first(),
            barRow = document.createElement('tr'),
            labelRow = document.createElement('tr'),
            newCell = null,
            maxValue = 1,
            entry = null;
        $(barRow).addClass('pt_bar_row');
        $(pointsTable).children('tbody').first().children('tr').each(function(rowIndex, tableRow){
            $(tableRow).children('td').each(function(cellIndex, tableCell){
                if (($(tableCell).text() == '') || (cellIndex == 0)) {
                    return;
                }
                if (!histogram[$(tableCell).text()]) {
                    histogram[$(tableCell).text()] = 0;
                }
                histogram[$(tableCell).text()]++;
                maxValue = Math.max(maxValue, histogram[$(tableCell).text()]);
            });
        });
        histogram = objectAsSortedArray(histogram);
        console.log('Histogram', histogram);
        $(histogramTable).children('thead').first().children('tr').first().children('th').first().attr('colspan', histogram.length);
        $(tableBody).empty();
        for (index in histogram) {
            entry = histogram[index];
            newCell = document.createElement('td');
            $(newCell).html('<div style="height: ' + (Math.round((entry.value / maxValue) * 100)) + '%"></div>');
            $(barRow).append(newCell);
            newCell = document.createElement('td');
            $(newCell).text(entry.key);
            $(labelRow).append(newCell);
        }
        $(tableBody).append(barRow).append(labelRow);
    }
    
    function objectAsSortedArray(obj) {
        var keys = [],
            result = [],
            k;
        for (k in obj) {
            keys.push(k);
        }
        keys.sort();
        for (k in keys) {
            result.push({'key': keys[k], 'value': obj[keys[k]]});
        }
        return result;
    }
    
})(jQuery);