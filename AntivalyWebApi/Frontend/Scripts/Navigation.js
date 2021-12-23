var app = angular.module("index", ["ngRoute"]);
app.config(function($routeProvider) {
    $routeProvider
    .when("/", {
        templateUrl : 'View/home.html',
        controller : 'NavController'
    })
    .when("/contact", {
        templateUrl : 'View/contact.html',
        controller : 'NavController'
    })
    .when("/about", {
        templateUrl : 'View/about.html',
        controller : 'about'
    })
    .when("/login", {
        templateUrl : 'View/login.html',
        controller : 'NavController'
    })
    .when("/registration", {
        templateUrl : 'View/registration.html',
        controller : 'NavController'
    })
    .when("/dashboard", {
        templateUrl : 'View/dashboard.html',
        controller : 'NavController'
        
    })
    .when("/profile", {
        templateUrl : 'View/profile.html',
        controller: 'NavController'
    })
    .when("/controlpanel", {
        templateUrl : 'View/Admin/controlPanel.html',
        controller: 'NavController'
    })
    .when("/offercoupon", {
        templateUrl : 'View/Admin/offerCoupon.html',
        controller: 'NavController'
    })
    .when("/checkdemographics", {
        templateUrl : 'View/Admin/checkDemographics.html',
        controller: 'NavController'
    })
    .otherwise({redirectTo: '/'});
});




app.directive('stringToNumber', function() {
    return {
      require: 'ngModel',
      link: function(scope, element, attrs, ngModel) {
        ngModel.$parsers.push(function(value) {
          return '' + value;
        });
        ngModel.$formatters.push(function(value) {
          return parseFloat(value);
        });
      }
    };
});


app.controller('homeCoupon',function($scope,$http,$location){
    
        $http({
            method: 'GET',
            url: "https://localhost:44307/api/coupon"
        }).then(function (response){
        $scope.coup = response.data;
        
    }),function(error){
    };
});



app.controller('about', function($scope, $interval,$rootScope){
    
    $scope.first = "block";
    $scope.second = "none";
    $scope.third = "none";
    $interval(function () {
        if($scope.first == "block")
        {
            $scope.first = "none";
            $scope.second = "block";
        }
        else if($scope.second == "block")
        {
            $scope.second = "none";
            $scope.third = "block";
        }
        else if($scope.third == "block")
        {
            $scope.third = "none";
            $scope.first = "block";
        }
    }, 2500);
});


app.run(function($rootScope,$location,$interval) {
    $interval(function(){
    if($location.url()=="/")
    {
        $rootScope.home = "active";
        $rootScope.about = "none";
        $rootScope.contact = "none";
        $rootScope.login = "none";
    }
    else if($location.url()=="/about")
    {
        $rootScope.home = "none";
        $rootScope.about = "active";
        $rootScope.contact = "none";
        $rootScope.login = "none";
    }
    else if($location.url()=="/contact")
    {
        $rootScope.home = "none";
        $rootScope.about = "none";
        $rootScope.contact = "active";
        $rootScope.login = "none";
    }
    else if($location.url()=="/login")
    {
        $rootScope.home = "none";
        $rootScope.about = "none";
        $rootScope.contact = "none";
        $rootScope.login = "active";
    }
    else if($location.url()=="/registration")
    {
        $rootScope.home = "none";
        $rootScope.about = "none";
        $rootScope.contact = "none";
        $rootScope.login = "active2";
    }
    else if($location.url()=="/dashboard" )
    {
        $rootScope.dashboard = "active";
        $rootScope.profile = "none";
    }
    else if($location.url()=="/profile")
    {
        $rootScope.dashboard = "none";
        $rootScope.profile = "active";
    }
    else if($location.url()=="/controlpanel" || $location.url()=="/offercoupon" || $location.url()=="/checkdemographics")
    {
        $rootScope.dashboard = "active2";
        $rootScope.profile = "none";
    }
    }, 0);
});