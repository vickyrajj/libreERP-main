app.config(function($stateProvider) {

  $stateProvider
    .state('projectManagement', {
      url: "/projectManagement",
      views: {
        "": {
          templateUrl: '/static/ngTemplates/projectManagement.html',
        },
        "menu@projectManagement": {
          templateUrl: '/static/ngTemplates/projectManagement.menu.html',
          controller: 'projectManagement.menu'
        },
        "@projectManagement": {
          templateUrl: '/static/ngTemplates/projectManagement.dash.html',
          controller: 'projectManagement'
        }
      }
    })

});

app.controller('projectManagement', function($scope, $users, Flash) {
  // main businessManagement tab default page controller
  new Chart(document.getElementById("expense-doughnut-chart"), {
    type: 'doughnut',
    data: {
      labels: ["Expenses", "Others", "Shared Services"],
      datasets: [{
        label: "",
        backgroundColor: ["#3e95cd", "#8e5ea2", "#3cba9f"],
        data: [2478, 5267, 734]
      }]
    },
    options: {
      cutoutPercentage: 50,
      title: {
        display: true,
        text: ''
      },
    }
  });


  new Chart(document.getElementById("variance-bubble-chart"), {
    type: 'bubble',
    data: {
      labels: "Africa",
      datasets: [{
        label: ["Supplies"],
        backgroundColor: "rgba(255,221,50,0.2)",
        borderColor: "rgba(255,221,50,1)",
        data: [{
          x: 21269017,
          y: 5.245,
          r: 15
        }]
      }, {
        label: ["Parking"],
        backgroundColor: "rgba(60,186,159,0.2)",
        borderColor: "rgba(60,186,159,1)",
        data: [{
          x: 258702,
          y: 7.526,
          r: 10
        }]
      }, {
        label: ["Expense"],
        backgroundColor: "rgba(0,0,0,0.2)",
        borderColor: "#000",
        data: [{
          x: 3979083,
          y: 6.994,
          r: 15
        }]
      }, {
        label: ["Others"],
        backgroundColor: "rgba(193,46,12,0.2)",
        borderColor: "rgba(193,46,12,1)",
        data: [{
          x: 4931877,
          y: 5.921,
          r: 15
        }]
      }]
    },
    options: {
      title: {
        display: true,
        text: ''
      },
      scales: {
        yAxes: [{
          scaleLabel: {
            display: true,
            labelString: "Happiness"
          }
        }],
        xAxes: [{
          scaleLabel: {
            display: true,
            labelString: "GDP (PPP)"
          }
        }]
      }
    }
  });

  new Chart(document.getElementById("yoy-mixed-chart"), {
    type: 'bar',
    data: {
      labels: ["1900", "1950", "1999", "2050"],
      datasets: [{
          label: "Europe",
          type: "line",
          borderColor: "#8e5ea2",
          data: [408,747,875,-634],
          lineTension: 0,
          fill: false
        }, {
          label: "Africa",
          type: "line",
          borderColor: "#3e95cd",
          data: [133,221,-783,2478],
          lineTension: 0,
          fill: false
        }, {
          label: "Europe",
          type: "bar",
          backgroundColor: "rgba(0,0,0,0.2)",
          data: [408,547,675,-734],
        }, {
          label: "Africa",
          type: "bar",
          backgroundColor: "rgba(0,0,0,0.2)",
          backgroundColorHover: "#3e95cd",
          data: [133,221,-783,2478]
        }
      ]
    },
    options: {
      scales:{
        xAxes:[{
          barPercentage:0.4
        }]
      },
      title: {
        display: true,
        text: ''
      },
      legend: { display: false }
    }
});

new Chart(document.getElementById("expense-bar-chart"), {
    type: 'bar',
    data: {
      labels: ["BenefitExp", "Bonus Expense", "EmployeeEquip", "MarketingExp", "Other Expenses", "TravelExpense", "Total"],
      datasets: [
        {
          label: "Population (millions)",
          backgroundColor: ["#3e95cd", "#8e5ea2","#3cba9f","#e8c3b9","#c45850","#8e5ea2","#3cba9f"],
          data: [24,-52,-73,79,-43,89,45]
        }
      ]
    },
    options: {
      legend: { display: false },
      title: {
        display: true,
        text: ''
      }
    }
});
});

app.controller('projectManagement.menu', function($scope, $users, Flash, $permissions) {
  // main businessManagement tab default page controller

  $scope.apps = [];

  $scope.buildMenu = function(apps) {
    for (var i = 0; i < apps.length; i++) {
      var a = apps[i];
      var parts = a.name.split('.');
      if (a.module != 10 || a.name.indexOf('app') == -1 || parts.length != 2) {
        continue;
      }
      a.state = a.name.replace('app', 'projectManagement')
      a.dispName = parts[parts.length - 1];
      $scope.apps.push(a);
    }
  }

  var as = $permissions.apps();
  if (typeof as.success == 'undefined') {
    $scope.buildMenu(as);
  } else {
    as.success(function(response) {
      $scope.buildMenu(response);
    });
  };
});
