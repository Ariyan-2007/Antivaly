app.controller("offercoupon",function($scope, $http, $timeout, $location, $interval){

    $timeout(commitCoupon, 100);

    function commitCoupon(){
        $http.defaults.headers.common['Authorization'] = localStorage.getItem('token');
        $http({
            method : "GET",
            url : "https://localhost:44307/api/coupon/showCoupon"
        
        }).then(function mySuccess(response) {
            var obj = response.data;
              var show = {};
              for(i=0; i<obj.length; i++)
              {
                  show[i] =obj[i];
              }
              $scope.coupons = show;
            
        }, function myError(response) {
            console.log(response.statusText);
        });  
    }

    $scope.Delete = function(x) {
        var url = "https://localhost:44307/api/coupon/removeCoupon/" + x; 
        $http.defaults.headers.common['Authorization'] = localStorage.getItem('token');  
        $http({
            method : "POST",
            url :  url
            
          }).then(function mySuccess(response) {
            $timeout(commitCoupon, 100);
            }, function myError(response) {
                console.log(response.statusText);
        
    
            }); 
    }

    $scope.Offer = function(Code, Discount, Cap, Category, Activation){

        var data = {
            Code: Code,
            Discount: Discount,
            NumOfUse: Cap,
            Category: Category,
            MinOrder: Activation
        };

        $http.post('https://localhost:44307/api/coupon/addCoupon', JSON.stringify(data))
        .then(function (response) {
            if(response.data)
            console.log("Offer Posted");
            document.getElementById("Code").value = "";
            document.getElementById("Discount").value = "";
            document.getElementById("Cap").value = "";
            document.getElementById("Category").value = "";
            document.getElementById("Activation").value = "";
            $timeout(commitCoupon, 100);
        }, function (response) {
            console.log("Offer Post Failed");
            console.log(response.status);
            console.log(response.statusText);
            console.log(response.headers());
        });

    };

});