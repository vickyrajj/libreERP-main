// you need to first configure the states for this app

app.config(function($stateProvider) {

  $stateProvider
    .state('businessManagement.finance', {
      url: "/finance",
      views: {
        "": {
          templateUrl: '/static/ngTemplates/genericAppBase.html',
        },
        "menu@businessManagement.finance": {
          templateUrl: '/static/ngTemplates/genericMenu.html',
          controller: 'controller.generic.menu',
        },
        "@businessManagement.finance": {
          templateUrl: '/static/ngTemplates/app.finance.default.html',
          controller: 'businessManagement.finance.default',
        }
      }
    })
    .state('businessManagement.finance.accounts', {
      url: "/accounts",
      templateUrl: '/static/ngTemplates/app.finance.accounts.html',
      controller: 'businessManagement.finance.accounts'
    })
    .state('businessManagement.finance.costCenter', {
      url: "/costCenter",
      templateUrl: '/static/ngTemplates/app.finance.costCenter.html',
      controller: 'businessManagement.finance.costCenter'
    })
    .state('businessManagement.finance.sales', {
      url: "/sales",
      templateUrl: '/static/ngTemplates/app.finance.sales.html',
      controller: 'businessManagement.finance.sales'
    })
    .state('businessManagement.finance.vendor', {
      url: "/vendor",
      templateUrl: '/static/ngTemplates/app.finance.vendor.html',
      controller: 'businessManagement.finance.vendor'
    })
    .state('businessManagement.finance.expenses', {
      url: "/expenses",
      templateUrl: '/static/ngTemplates/app.finance.expenses.html',
      controller: 'businessManagement.finance.expenses'
    })
    .state('businessManagement.finance.pettyCash', {
      url: "/pettyCash",
      templateUrl: '/static/ngTemplates/app.finance.pettyCash.html',
      controller: 'businessManagement.finance.pettyCash'
    })
    .state('businessManagement.finance.invoicing', {
      url: "/invoicing",
      templateUrl: '/static/ngTemplates/app.finance.invoicing.html',
      controller: 'businessManagement.finance.invoicing'
    })
    .state('businessManagement.finance.inventory', {
      url: "/inventory",
      templateUrl: '/static/ngTemplates/app.finance.inventory.html',
      controller: 'businessManagement.finance.inventory'
    })
    .state('businessManagement.finance.GSTReporting', {
      url: "/GSTReporting",
      templateUrl: '/static/ngTemplates/app.finance.GSTReporting.html',
      controller: 'businessManagement.finance.GSTReporting'
    })
});


app.controller('businessManagement.finance.default', function($scope, $http, $aside, $state, Flash, $users, $filter, $permissions) {
  // settings main page controller
  // new Chart(document.getElementById("active-line-chart"), {
  //   type: 'line',
  //   data: {
  //     labels: ['abc', 'def', 'hij', 'sfs'],
  //     datasets: [{
  //       data: [860, 200,300,500, ],
  //       borderColor: "#3e95cd",
  //       fill: false,
  //       lineTension: 0,
  //     }]
  //   },
  //   options: {
  //     legend: {
  //       display: true
  //     },
  //     scales: {
  //       xAxes: [{
  //         ticks: {
  //           display: true
  //         },
  //         gridLines: {
  //           // color: "rgba(0, 0, 0, 0)",
  //           // drawBorder: false,
  //           display: false,
  //         }
  //       }],
  //       yAxes: [{
  //         ticks: {
  //           display: true
  //         },
  //         gridLines: {
  //           // color: "rgba(0, 0, 0, 0)",
  //           // drawBorder: false,
  //           display: false,
  //         }
  //       }]
  //     },
  //     title: {
  //       display: true,
  //       text: 'Some Text',
  //       // legend: false,
  //       // lable: false,
  //       showLine: false,
  //     },
  //     elements: {
  //       point: {
  //         radius: 0
  //       }
  //     }
  //   }
  // });

  //line chart data
  var data = {
    labels: ["match1", "match2", "match3", "match4", "match5"],
    datasets: [
      {
        label: "TeamA Score",
        data: [10, 50, 25, 70, 40],
        backgroundColor: "blue",
        borderColor: "lightblue",
        fill: false,
        lineTension: 0,
        radius: 5
      },
      {
        label: "TeamB Score",
        data: [20, 35, 40, 60, 50],
        backgroundColor: "green",
        borderColor: "lightgreen",
        fill: false,
        lineTension: 0,
        radius: 5
      }
    ]
  };

  //options
  var options = {
    responsive: true,
    title: {
      display: true,
      position: "top",
      text: "Line Graph",
      fontSize: 18,
      fontColor: "#111"
    },
    legend: {
      display: true,
      position: "bottom",
      labels: {
        fontColor: "#333",
        fontSize: 16
      }
    }
  };

  //create Chart class object
  var chart = new Chart(document.getElementById("active-line-chart"), {
    type: "line",
    data: data,
    options: options
  });

  // new Chart(document.getElementById("sales-bar-chart"), {
  //   type: 'bar',
  //   data: {
  //     labels: ["Africa", "Asia", "Europe", "Latin America", "North America", "dsadsa", "dasd", "dasd", "etre", "sfdfsd", "sfd", "fsdf", "etre", "sfdfsd", "Africa", "Asia", "Europe", "Latin America", "North America", ],
  //     datasets: [{
  //       backgroundColor: "#3E95CD",
  //       strokeColor: "brown",
  //       label: "",
  //       data: [2478, 5267, 734, 784, 433, 5267, 734, 784, 433, 734, 784, 433, 734, 784, 433, 734, 784, 734, 784, 433, 734, 784]
  //     }]
  //   },
  //   options: {
  //
  //     legend: {
  //       display: false
  //     },
  //     title: {
  //       display: false,
  //       text: ""
  //     },
  //     scales: {
  //       xAxes: [{
  //         categoryPercentage: 1,
  //         barPercentage: 0.7,
  //         ticks: {
  //           display: false,
  //         },
  //         gridLines: {
  //           color: "rgba(0, 0, 0, 0)",
  //           drawBorder: false,
  //           display: false,
  //         },
  //       }],
  //       yAxes: [{
  //         ticks: {
  //           display: false
  //         },
  //         gridLines: {
  //           color: "rgba(0, 0, 0, 0)",
  //           drawBorder: false,
  //           display: false,
  //         }
  //       }]
  //     },
  //   }
  // });

  function getRandomColor() {
    var letters = '0123456789ABCDEF';
    var color = '#';
    for (var i = 0; i < 6; i++) {
      color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
  }

  function random_rgba() {
    var o = Math.round,
      r = Math.random,
      s = 255;
    return 'rgba(' + o(r() * s) + ',' + o(r() * s) + ',' + o(r() * s) + ',' + 1 + ')';
  }

  $http.get('/api/finance/expensesGraphData/').
  then(function(response) {
    console.log(response.data);
    $scope.expData = response.data
    for (var i = 0; i < $scope.expData.datasets.length; i++) {
      clr = getRandomColor()
      console.log(clr);
      $scope.expData.datasets[i].backgroundColor = clr
      $scope.expData.datasets[i].hoverBackgroundColor = clr
    }
    var numberWithCommas = function(x) {
      return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    };
    new Chart(document.getElementById("items-bar-chart"), {
      type: 'bar',
      data: {
        labels: $scope.expData.labels,
        datasets: $scope.expData.datasets
      },
      options: {
        title: {
          display: true,
          text: "Projects Expenses"
        },
        tooltips: {
          mode: 'label',
          callbacks: {
            label: function(tooltipItem, data) {
              return data.datasets[tooltipItem.datasetIndex].label + ": " + numberWithCommas(tooltipItem.yLabel);
            }
          }
        },
        scales: {
          xAxes: [{
            stacked: true,
            gridLines: {
              display: false,
            },
          }],
          yAxes: [{
            stacked: true,
            gridLines: {
              display: false,
            },
          }]
        }
      }
    });
  })

  $http.get('/api/projects/project/?projectClosed=false').
  then(function(response) {
    console.log(response.data);
    $scope.projExpData = response.data
    setTimeout(function() {
      for (var i = 0; i < $scope.projExpData.length; i++) {
        $scope.projExpData[i].expPercent = (($scope.projExpData[i].totalCost * 100) / $scope.projExpData[i].budget).toFixed(1)

        clr = random_rgba()
        var ids = "expense-doughnut-chart" + i
        console.log(ids, clr);
        new Chart(document.getElementById(ids), {
          type: 'doughnut',
          data: {
            labels: ['Expenses', 'Balance'],
            datasets: [{
              backgroundColor: [clr, 'rgba(255, 255, 255, 0)'],
              data: [$scope.projExpData[i].totalCost, ($scope.projExpData[i].budget - $scope.projExpData[i].totalCost)]
            }]
          },
          options: {
            cutoutPercentage: 70,
            legend: {
              display: false
            },
            title: {
              display: false,
              text: $scope.projExpData[i].title,
            }
          },
        });
      }
    }, 500);

  })


  // new Chart(document.getElementById("expense-doughnut-chart1"), {
  //   type: 'doughnut',
  //   data: {
  //     labels: ["Africa", "Asia"],
  //     datasets: [{
  //       label: "Population (millions)",
  //       backgroundColor: ["rgba(255, 255, 255, 0)", "rgba(0, 154, 254, 0.71)"],
  //       data: [110, 10]
  //     }]
  //   },
  //   options: {
  //     cutoutPercentage: 80,
  //     legend: {
  //       display: false
  //     },
  //     title: {
  //       display: false,
  //       text: 'Predicted world population (millions) in 2050',
  //       display: false,
  //
  //       lable: false,
  //     }
  //   },
  //   elements: {
  //     center: {
  //       text: '70%',
  //       color: '#36A2EB', //Default black
  //       fontStyle: 'Helvetica', //Default Arial
  //       sidePadding: 15 //Default 20 (as a percentage)
  //     }
  //   }
  // });
  // new Chart(document.getElementById("expense-doughnut-chart2"), {
  //   type: 'doughnut',
  //   data: {
  //     labels: ["Africa", "Asia"],
  //     datasets: [{
  //       label: "Population (millions)",
  //       backgroundColor: ["rgba(0, 254, 10, 0.71)", "rgba(255, 255, 255, 0)"],
  //       data: [2478, 4267]
  //     }]
  //   },
  //   options: {
  //     cutoutPercentage: 80,
  //     legend: {
  //       display: false
  //     },
  //     title: {
  //       display: false,
  //       text: 'Predicted world population (millions) in 2050',
  //       display: false,
  //
  //       lable: false,
  //     }
  //   },
  //   elements: {
  //     center: {
  //       text: '70%',
  //       color: '#36A2EB', //Default black
  //       fontStyle: 'Helvetica', //Default Arial
  //       sidePadding: 15 //Default 20 (as a percentage)
  //     }
  //   }
  // });
  // new Chart(document.getElementById("expense-doughnut-chart3"), {
  //   type: 'doughnut',
  //   data: {
  //     labels: ["Africa", "Asia"],
  //     datasets: [{
  //       label: "Population (millions)",
  //       backgroundColor: ["rgba(255, 255, 255, 0)", "rgba(252, 34, 34, 0.84)"],
  //       data: [3478, 3267]
  //     }]
  //   },
  //   options: {
  //     cutoutPercentage: 80,
  //     legend: {
  //       display: false
  //     },
  //     title: {
  //       display: false,
  //       text: 'Predicted world population (millions) in 2050',
  //       display: false,
  //
  //       lable: false,
  //     }
  //   },
  //   elements: {
  //     center: {
  //       text: '70%',
  //       color: '#096db0', //Default black
  //       fontStyle: 'Helvetica', //Default Arial
  //       sidePadding: 15, //Default 20 (as a percentage)
  //     }
  //   }
  // });
  // new Chart(document.getElementById("expense-doughnut-chart4"), {
  //   type: 'doughnut',
  //   data: {
  //     labels: ["Africa", "Asia"],
  //     datasets: [{
  //       label: "Population (millions)",
  //       backgroundColor: ["rgba(255, 255, 255, 0)", "rgba(254, 251, 0, 0.71)"],
  //       data: [2478, 4267]
  //     }]
  //   },
  //   options: {
  //     cutoutPercentage: 80,
  //     legend: {
  //       display: false
  //     },
  //     title: {
  //       display: false,
  //       text: 'Predicted world population (millions) in 2050',
  //       display: false,
  //
  //       lable: false,
  //     }
  //   },
  //   elements: {
  //     center: {
  //       text: '70%',
  //       color: '#36A2EB', //Default black
  //       fontStyle: 'Helvetica', //Default Arial
  //       sidePadding: 15 //Default 20 (as a percentage)
  //     }
  //   }
  // });



})
