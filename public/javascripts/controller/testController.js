window.app = angular.module('Test', []);
app.controller('testController', function($scope, $http) {

     $scope.postBlock = async function(testNumber) {
        let choice = '';
        const startTime = new Date();
        let characters = 'ABCD';
        const charactersLength = characters.length;
        for ( let i = 0; i < parseInt(testNumber); i++ ) {
            choice = characters.charAt(Math.floor(Math.random() * charactersLength));
            console.log("OY \n" + choice);
            let data = {
                choice: choice
            };
            await $http.post('transaction/broadcast', JSON.stringify(data));
            await $http.get('mine').then(data => {
                if(i === (parseInt(testNumber) - 1)){
                    $scope.startTime = startTime.getHours() + ":" + startTime.getMinutes() + ":" + startTime.getSeconds();
                    const finishTime = new Date();
                    $scope.finishTime = finishTime.getHours() + ":" + finishTime.getMinutes() + ":" + finishTime.getSeconds();
                }
            })
        }
    };
});