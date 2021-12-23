app.controller("controlpanel",function($scope, $http, $timeout, $location, $route){
    $http.defaults.headers.common['Authorization'] = localStorage.getItem('token');
    $timeout(commit, 100);
    function commit(){
     $http({
                method : "GET",
                url : "https://localhost:44307/api/user/userlist"
            
            }).then(function mySuccess(response) {
                var obj = response.data;
                var show = [];
                for(i=0; i<obj.length; i++)
                {
                    
                        show[i] = obj[i];      
            
                    
                }
                $scope.users = show;
                
            }, function myError(response) {
                console.log(response.statusText);
            });  
        }

        $scope.OrderBy = function(x) {
            $scope.Order = x;
            
        }

        $scope.Verify = function(x) {
            var url = "https://localhost:44307/api/user/control/" + x +"/Active";
            $http.defaults.headers.common['Authorization'] = localStorage.getItem('token');
            $http({
                method : "POST",
                url :  url
                
              }).then(function mySuccess(response) {
                $timeout(commit, 100);
                }, function myError(response) {
                    console.log(response.statusText);
            
        
                });
        }

        $scope.Block = function(x) {
            var url = "https://localhost:44307/api/user/control/" + x +"/Blocked"; 
            $http.defaults.headers.common['Authorization'] = localStorage.getItem('token');  
            $http({
                method : "POST",
                url :  url
                
              }).then(function mySuccess(response) {
                $timeout(commit, 100);
                }, function myError(response) {
                    console.log(response.statusText);
            
        
                }); 
        }

        $scope.Unblock = function(x) {
            var url = "https://localhost:44307/api/user/control/" + x +"/Active";
            $http.defaults.headers.common['Authorization'] = localStorage.getItem('token');
            $http({
                method : "POST",
                url :  url
                
              }).then(function mySuccess(response) {
                $timeout(commit, 100);
                }, function myError(response) {
                    console.log(response.statusText);
            
        
                });
        }

});