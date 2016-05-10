var app = angular.module('chat',[]);
app.controller('chat', function ($scope,$http,$window,$location) {  
    var socket = io();

    // decoding of base64
    $scope.name=atob($location.search()['un']);               
    var id=atob($location.search()['ui']); 
    $scope.uid=id;        
    
    $http.post('/get_list', {}).success(function(data, status, headers, config) {
            var data_server={purpose:"login",id:id}
            socket.emit('update_list',data_server);
        }).error(function(data, status) {
            console.log("Connection Error");
            alert("Connection Error");
        });
    $scope.logout=function(){    
        $http.post('/logout', {id: id}).success(function(data, status, headers, config) {
            var data_server={purpose:"logout",id:id}
            socket.emit('update_list',data_server);
            $window.location.href="http://127.0.0.1:3000/"
        }).error(function(data, status) {
            console.log("Connection Error");
            alert("Connection Error");
        });
    }
    socket.on('logout update',function(data){
        $scope.persons=JSON.parse(data);
        $scope.$apply(); 
    });
});