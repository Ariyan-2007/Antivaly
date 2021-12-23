app.controller('login', function($scope, $http, $location){

    $scope.login = function(UID, Password)
    {
        var data = {
            UID: UID,
            Password: Password
        };
        $http.post('https://localhost:44307/api/login', JSON.stringify(data))
        .then(function (response) {
            if(response.data)
            var obj = response.data;
            if(obj.AccStatus=="Active"){

                    
                    localStorage.setItem('token', obj.AccessToken);
                    localStorage.setItem('uid', obj.UserID);
                    $location.path('/dashboard');
            }
            else if(obj.AccStatus=="Blocked"){
                console.log("Account Blocked! Can't Login");
                var url = "https://localhost:44307/api/logout/" +obj.UserID;
                $http({
                    method : "GET",
                    url : url
                    
                })
            }
            else if(obj.AccStatus=="Pending"){
                console.log("Account Needs to be verified! Contact an Admin");
                var url = "https://localhost:44307/api/logout/" +obj.UserID;
                $http({
                    method : "GET",
                    url : url
                    
                })
            }
        }, function (response) {
            console.log("Login Failure! User ID or Password Wrong!");
            console.log(response.status);
            console.log(response.statusText);
            console.log(response.headers());
        });
    };
});