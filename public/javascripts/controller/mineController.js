window.app = angular.module('Mine', []);
app.controller('mineController', function($scope, $http) {
    $scope.block = null;
    $scope.initialSearchMade = false;
    $http.get(`mineBlock`)
        .then(response => {
            $scope.block = response.data.block;
        });
});