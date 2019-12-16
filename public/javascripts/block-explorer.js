window.app = angular.module('BlockExplorer', []);
app.controller('MainController', function($scope, $http) {
    $scope.block = null;
    $scope.initialSearchMade = false;

    $http.get(`/blockchain/mineBlock`)
        .then(response => {
            $scope.block = response.data.block;
        });

    $scope.fetchTransaction = function(transactionId) {
        $http.get(`/blockchain/transaction/${transactionId}`)
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