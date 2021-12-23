app.controller('registration', function($scope, $http, $location){
    $scope.AccTypes=['Select','Buyer','Seller','Delivery Man'];
    $scope.Type="Select";
    

    $scope.TypeChanged = function()
    {
        $http({
            method : "GET",
            url : "https://localhost:44307/api/UserID/LastID"
            
          }).then(function mySuccess(response) {
              var obj = response.data;
              for(i=0; i<obj.length; i++)
              {
                  if(obj[i].AccType == "Buyer")
                  {
                      if($scope.Type == "Buyer")
                      {
                          $scope.Info = 'B-' + (obj[i].LastID + 1);
                      }
                      
                  }
                  else if(obj[i].AccType == "Seller")
                  {
                      if($scope.Type == "Seller")
                      {
                          $scope.Info = 'S-' + (obj[i].LastID + 1);
                      }
                      
                  }
                  else if(obj[i].AccType == "Delivery Man")
                  {
                      if($scope.Type == "Delivery Man")
                      {
                          $scope.Info = 'DM-' + (obj[i].LastID + 1);
                      }
                      
                  }
                  else if($scope.Type == "Select")
                  {
                      
                          $scope.Info = '';
                      
                  }
                  
                  
              }
              
              
            }, function myError(response) {
              $scope.Info = response.statusText;
          });
    };

    $scope.register = function(Info, Name, password, email, address, Contact, Type)
    {
        var Status = "";
        Contact = "+88" + Contact;
        if(Type == "Delivery Man")
        {
            Status = "Pending";
        }
        else
        {
            Status = "Active";
        }

        var data = {
            UID: Info,
            Name: Name,
            Password: password,
            Email: email,
            Address: address,
            Contact: Contact,
            AccType: Type,
            AccStatus: Status
        };

        $http.post('https://localhost:44307/api/register', JSON.stringify(data))
        .then(function (response) {
            if(response.data)
            console.log("Registration Successful");
            window.location.replace("http://127.0.0.1:8080/");
        }, function (response) {
            console.log("Registration Failure");
            console.log(response.status);
            console.log(response.statusText);
            console.log(response.headers());
        });
    };
});