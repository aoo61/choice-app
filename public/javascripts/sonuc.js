let choiceA = null;
let choiceB = null;
let choiceC = null;
let choiceD = null;
window.app = angular.module('Results', []);
app.controller('resultsController', function ($scope, $http) {
    $scope.vote = null;
    $scope.initialSearchMade = false;
    $http.get(`/blockchain/result`)
        .then(function (response) {
            choiceA = parseInt(response.data.choiceA);
            choiceB = parseInt(response.data.choiceB);
            choiceC = parseInt(response.data.choiceC);
            choiceD = parseInt(response.data.choiceD);
            $scope.vote = response.data.vote;
        });
});

// Load google charts
google.charts.load('current', {'packages': ['corechart']});
google.charts.setOnLoadCallback(drawChart);
// Draw the chart and set the chart values
function drawChart() {
    let data = google.visualization.arrayToDataTable([
        ['Oy', 'Oy Sayısı'],
        ['A', choiceA],
        ['B', choiceB],
        ['C', choiceC],
        ['D', choiceD]
    ]);
    // Optional; add a title and set the width and height of the chart
    var options = {'title': 'Genel Seçim Sonuçları', 'width': 600, 'height': 600};
    // Display the chart inside the <div> element with id="piechart"
    var chart = new google.visualization.PieChart(document.getElementById('piechart'));
    chart.draw(data, options);
}