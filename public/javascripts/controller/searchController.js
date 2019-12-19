window.app = angular.module('Search', []);
app.controller('searchController', function($scope, $http) {
    $scope.block = null;
    $scope.transaction = null;
    $scope.initialSearchMade = false;

    $scope.fetchBlock = function(blockHash) {
        $http.get(`block/${blockHash}`)
            .then(response => {
                $scope.block = response.data.block;
                $scope.transaction = null;
            });
    };

    $scope.fetchTransaction = function(transactionId) {
        $http.get(`transaction/${transactionId}`)
            .then(response => {
                $scope.transaction = response.data.transaction;
                $scope.block = null;
            });
    };

    $scope.search = function(searchValue) {
        $scope.initialSearchMade = true;
        if ($scope.searchType === 'block') {
            $scope.fetchBlock(searchValue);
        }
        else if ($scope.searchType === 'transaction') {
            $scope.fetchTransaction(searchValue);
        }
    };
});