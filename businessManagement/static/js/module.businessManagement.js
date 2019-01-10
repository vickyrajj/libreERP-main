app.config(function($stateProvider){

  $stateProvider
  .state('businessManagement', {
    url: "/businessManagement",
    views: {
       "": {
          templateUrl: '/static/ngTemplates/businessManagement.html',
       },
       "menu@businessManagement": {
          templateUrl: '/static/ngTemplates/businessManagement.menu.html',
          controller : 'businessManagement.menu'
        },
        "@businessManagement": {
          templateUrl: '/static/ngTemplates/businessManagement.dash.html',
          controller : 'businessManagement'
        }
    }
  })

});

app.controller('businessManagement' , function($scope , $users , Flash){
  var ctx = document.getElementById("myChart");
  var data = {
    labels: [

    ],
    datasets: [{
      data: [300, 50],
      backgroundColor: [
        "#1DA381",
        "#ECECEC"
      ],

    }]
  };
  var myDoughnutChart = new Chart(ctx, {
    type: 'doughnut',
    data: data,
    options: {
      rotation: 1 * Math.PI,
      circumference: 1 * Math.PI,
      cutoutPercentage: 80
    }
  });
  var ctxx = document.getElementById("myChart1");
  var datas = {
    labels: [

    ],
    datasets: [{
      data: [50, 300],
      backgroundColor: [
        "#1DA381",
        "#ECECEC"
      ],

    }]
  };
  var myDoughnutChart = new Chart(ctxx, {
    type: 'doughnut',
    data: datas,
    options: {
      rotation: 1 * Math.PI,
      circumference: 1 * Math.PI,
      cutoutPercentage: 80,
    }
  });


  $scope.barlabels = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12', '13', '14', '15', '16'];

  $scope.bardata = [
    [28, 48, 40, 19, 86, 27, 90, 34, 55, 21, 32, 32, 32, 45, 56, 45]
  ];

  new Chart(document.getElementById("line-chart"), {
    type: 'line',
    data: {
      labels: ['', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', ''],
      datasets: [{
        data: [860, -114, 1060, -306, 107, -888, -133, 1000, -783, 2478, 860, -114, 1060, -306, 107, -888, -133, 1000, -783, 2478, 860, -114, 1060, -306, 107, -888, -133, 1000, ],
        label: "",
        borderColor: "#1DA381",
        fill: false,
        lineTension: 0,
        pointRadius: 0,
      }]
    },
    options: {
      legend: {
        display: false
      },
      scales: {
        xAxes: [{
          ticks: {
            display: false
          },
          gridLines: {
            color: "rgba(0, 0, 0, 0)",
            drawBorder: false,
            display: false,
          }
        }],
        yAxes: [{
          ticks: {
            display: false
          },
          gridLines: {
            color: "rgba(0, 0, 0, 0)",
            drawBorder: false,
            display: false,
          }
        }]
      },
      title: {
        display: false,
        text: '',
        legend: false,
        lable: false,
        showLine: false,
      }
    }
  });
  new Chart(document.getElementById("line-chart1"), {
    type: 'line',
    data: {
      labels: ['', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', ''],
      datasets: [{
        data: [860, -114, 1060, -306, 107, -888, -133, 1000, -783, 2478, 860, -114, 1060, -306, 107, -888, -133, 1000, -783, 2478, 860, -114, 1060, -306, 107, -888, -133, 1000, ],
        label: "",
        borderColor: "#1DA381",
        fill: false,
        lineTension: 0,
        pointRadius: 0,
      }]
    },
    options: {
      legend: {
        display: false
      },
      scales: {
        xAxes: [{
          ticks: {
            display: false
          },
          gridLines: {
            color: "rgba(0, 0, 0, 0)",
            drawBorder: false,
            display: false,
          }
        }],
        yAxes: [{
          ticks: {
            display: false
          },
          gridLines: {
            color: "rgba(0, 0, 0, 0)",
            drawBorder: false,
            display: false,
          }
        }]
      },
      title: {
        display: false,
        text: '',
        legend: false,
        lable: false,
        showLine: false,
      }
    }
  });
  new Chart(document.getElementById("line-chart2"), {
    type: 'line',
    data: {
      labels: ['', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', ''],
      datasets: [{
        data: [860, -114, 1060, -306, 107, -888, -133, 1000, -783, 2478, 860, -114, 1060, -306, 107, -888, -133, 1000, -783, 2478, 860, -114, 1060, -306, 107, -888, -133, 1000, ],
        label: "",
        borderColor: "#1DA381",
        fill: false,
        lineTension: 0,
        pointRadius: 0,
      }]
    },
    options: {
      legend: {
        display: false
      },
      scales: {
        xAxes: [{
          ticks: {
            display: false
          },
          gridLines: {
            color: "rgba(0, 0, 0, 0)",
            drawBorder: false,
            display: false,
          }
        }],
        yAxes: [{
          ticks: {
            display: false
          },
          gridLines: {
            color: "rgba(0, 0, 0, 0)",
            drawBorder: false,
            display: false,
          }
        }]
      },
      title: {
        display: false,
        text: '',
        legend: false,
        lable: false,
        showLine: false,
      }
    }
  });
});

app.controller('businessManagement.menu' , function($scope , $users , Flash , $permissions){
  // main businessManagement tab default page controller

  $scope.apps = [];

  $scope.buildMenu = function(apps){
    for (var i = 0; i < apps.length; i++) {
      a = apps[i];
      parts = a.name.split('.');
      if (a.module != 3 || a.name.indexOf('app') == -1 || parts.length != 2) {
        continue;
      }
      a.state = a.name.replace('app' , 'businessManagement')
      a.dispName = parts[parts.length -1];
      $scope.apps.push(a);
    }
  }

  as = $permissions.apps();
  if(typeof as.success == 'undefined'){
    $scope.buildMenu(as);
  } else {
    as.success(function(response){
      $scope.buildMenu(response);
    });
  };
});
