window.app = angular.module('BlockExplorer', []);
app.controller('MainController', ($scope, $http) => {
    $scope.block = null;
    $scope.transaction = null;
    $scope.addressData = null;
    $scope.initialSearchMade = false;
    $scope.fetchBlock = function(blockHash) {
        $http.get(`/block/${blockHash}`)
            .then(response => {
                $scope.block = response.data.block;
                $scope.transaction = null;
                $scope.addressData = null;
            });
    };
    $scope.fetchTransaction = function(transactionId) {
        $http.get(`/transaction/${transactionId}`)
            .then(response => {
                $scope.transaction = response.data.transaction;
                $scope.block = null;
                $scope.addressData = null;
            });
    };
    $scope.fetchAddressData = function(address) {
        $http.get(`/address/${address}`)
            .then(response => {
                $scope.addressData = response.data.addressData;
                if (!$scope.addressData.addressTransactions.length) $scope
                    .addressData = null;
                $scope.block = null;
                $scope.transaction = null;
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
        else if ($scope.searchType === 'address') {
            $scope.fetchAddressData(searchValue);
        }
    };
});