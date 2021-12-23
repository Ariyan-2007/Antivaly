app.controller("checkdemographics",function($scope, $http, $timeout, $location, $interval){

    $timeout(commitUser, 100);
    $timeout(commitLog, 150);

    $interval(function () {
        if($location.url()=="/checkdemographics")
        {$timeout(commitLog, 150);}
        
    }, 2000);

    function commitUser(){
        $http.defaults.headers.common['Authorization'] = localStorage.getItem('token');
        $http({
            method : "GET",
            url : "https://localhost:44307/api/user/userlist"
        
        }).then(function mySuccess(response) {
            var obj = response.data;
            var active = 0;
            var blocked = 0;
            var pending = 0;
            
            for(i=0; i<obj.length; i++)
                {
                    
                        if(obj[i].AccStatus=="Active")
                        {
                            active = active+1;
                        }
                        else if(obj[i].AccStatus=="Blocked")
                        {
                            blocked = blocked+1;
                        }
                        else if(obj[i].AccStatus=="Pending")
                        {
                            pending = pending+1;
                        }
                }
                $scope.UC = obj.length;
                $scope.AU = active;
                $scope.BU = blocked;
                $scope.PU = pending;
            
        }, function myError(response) {
            console.log(response.statusText);
        });  
    }

    function commitLog(){
        $http.defaults.headers.common['Authorization'] = localStorage.getItem('token');
        $http({
            method : "GET",
            url : "https://localhost:44307/api/user/currentlyLogged"
        
        }).then(function mySuccess(response) {
            var obj = response.data;
            $scope.CLIU = obj.length;
            
        }, function myError(response) {
            console.log(response.statusText);
        });  
    }
    




});