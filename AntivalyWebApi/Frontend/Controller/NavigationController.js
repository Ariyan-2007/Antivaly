app.controller('NavController',function($scope,$rootScope,$location,$http) {

  
      if(localStorage.getItem('token') == null)
      {
        $rootScope.loggedIn = false;
      }
      else
      {
        $rootScope.loggedIn = true;
      }


    $scope.logOut = function() {
        
        var url = "https://localhost:44307/api/logout/" + localStorage.getItem('uid');
        $http({
            method : "GET",
            url : url
            
          }).then(function mySuccess(response) {
              var obj = response.data;
            }, function myError(response) {
                $scope.Info = response.statusText;
            });
        localStorage.removeItem('uid');
        localStorage.removeItem('token');
    };


});