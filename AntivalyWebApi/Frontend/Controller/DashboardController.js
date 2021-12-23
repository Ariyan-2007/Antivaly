app.controller('DashboardController',function($scope,$http){

            
    if(localStorage.getItem('uid').startsWith("A-"))
    {
          
        
        $scope.adminView = function(){
            return true;
        };
    }

    else if(localStorage.getItem('uid').startsWith("B-"))
    {    
        $scope.buyerView = function(){
            return true;
        };   
    }
    else if(localStorage.getItem('uid').startsWith("S-"))
    {    
        $scope.sellerView = function(){
            return true;
        };   
    }
    else if(localStorage.getItem('uid').startsWith("DM-"))
    {    
        $scope.deliverymanView = function(){
            return true;
        };   
    }
});  

app.controller('DeliveryDetails', function($scope, $http, $timeout, $interval, $location){

    $http.defaults.headers.common['Authorization'] = localStorage.getItem('token');

    $timeout(commit, 50);

    $interval(function () {
        if($location.url()=="/dashboard")
        {$timeout(commit, 50);}
        
    }, 2000);



    function commit() {
        $http({
            method : "GET",
            url : "https://localhost:44307/api/user/deliverydetails"
            
        }).then(function mySuccess(response) {
              var obj = response.data;
              var show = {};
              for(i=0; i<obj.length; i++)
              {
                  show[i] =obj[i];
              }
              $scope.deliverymen = show;
            
        }, function myError(response) {
            console.log(response.statusText);
        });  
    }
        


});

app.controller('ProductDetails', function($scope, $http, $timeout, $interval){

    $http.defaults.headers.common['Authorization'] = localStorage.getItem('token');

    $timeout(commit, 150);

    // $interval(function () {
    //     $timeout(commit, 150);
    // }, 2000);


    function commit() {
        $http({
            method : "GET",
            url : "https://localhost:44307/api/user/productdetails"
            
        }).then(function mySuccess(response) {
              var obj = response.data;
              var show = {};
              for(i=0; i<obj.length; i++)
              {
                  show[i] =obj[i];
              }
              $scope.products = show;
              
            
        }, function myError(response) {
            console.log(response.statusText);
        }); 
    }
});