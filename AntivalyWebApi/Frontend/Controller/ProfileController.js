app.controller('ProfileController', function($scope, $http){
 
    var url = "https://localhost:44307/api/user/profile/" + localStorage.getItem('uid'); 
    var token = localStorage.getItem('token'); 
    $http.defaults.headers.common['Authorization'] = token;
    $http({
        method : "GET",
        url :  url
        
      }).then(function mySuccess(response) {
          var obj = response.data;
            $scope.UID = obj.UID;
            $scope.Name = obj.Name;
            $scope.Email = obj.Email;
            $scope.Address = obj.Address;
            $scope.Contact = obj.Contact;
            $scope.AccStatus = obj.AccStatus;
        }, function myError(response) {
            $scope.Info = response.statusText;
    

        });





});