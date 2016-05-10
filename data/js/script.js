var app = angular.module('login',[]);
app.controller('login', function ($scope,$http,$window,$timeout) {	
    
    $scope.login=function(item){
        var login_name=$scope.name;
        var password=$scope.password;
        $http.post('/login', {'name': login_name, 'password': password}).success(function(data, status, headers, config) {
            if(String(data.path_name).trim()=="invalid"){
               $scope.show_login_error=false;
            }else{
                $scope.show_login_error=true;
                $window.location.href = data.path_name;      
            }
        }).error(function(data, status) {
            console.log("Connection Error");
            alert("Connection Error");
        });
    }

     
});