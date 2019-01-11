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
    .state('businessManagement.finance.inflow', {
      url: "/inflow",
      templateUrl: '/static/ngTemplates/app.finance.inflow.html',
      controller: 'businessManagement.finance.inflow'
    })
    .state('businessManagement.finance.vendor', {
      url: "/vendor",
      templateUrl: '/static/ngTemplates/app.finance.vendor.html',
      controller: 'businessManagement.finance.vendor'
    })
    .state('businessManagement.finance.inboundInvoices', {
      url: "/inboundInvoices",
      templateUrl: '/static/ngTemplates/app.finance.inboundInvoices.html',
      controller: 'businessManagement.finance.inboundInvoices'
    })
    .state('businessManagement.finance.pettyCash', {
      url: "/pettyCash",
      templateUrl: '/static/ngTemplates/app.finance.pettyCash.html',
      controller: 'businessManagement.finance.pettyCash'
    })
});


app.controller('businessManagement.finance.default', function($scope, $http, $aside, $state, Flash, $users, $filter, $permissions) {
  // settings main page controller
  new Chart(document.getElementById("active-line-chart"), {
    type: 'line',
    data: {
      labels: ['', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', ''],
      datasets: [{
        data: [860, -114, 1060, -306, 107, -888, -133, 1000, -783, 2478, 860, -114, 1060, -306, 107, -888, -133, 1000, -783, 2478, 860, -114, 1060, -306, 107, -888, -133, 1000, ],
        label: "",
        borderColor: "#3e95cd",
        fill: false,
        lineTension: 0,
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
      },
      elements: {
        point: {
          radius: 0
        }
      }
    }
  });
  new Chart(document.getElementById("sales-bar-chart"), {
    type: 'bar',
    data: {
      labels: ["Africa", "Asia", "Europe", "Latin America", "North America", "dsadsa", "dasd", "dasd", "etre", "sfdfsd", "sfd", "fsdf", "etre", "sfdfsd", "Africa", "Asia", "Europe", "Latin America", "North America", ],
      datasets: [{
        backgroundColor: "#3E95CD",
        strokeColor: "brown",
        label: "",
        data: [2478, 5267, 734, 784, 433, 5267, 734, 784, 433, 734, 784, 433, 734, 784, 433, 734, 784, 734, 784, 433, 734, 784]
      }]
    },
    options: {

      legend: {
        display: false
      },
      title: {
        display: false,
        text: ""
      },
      scales: {
        xAxes: [{
          categoryPercentage: 1,
          barPercentage: 0.7,
          ticks: {
            display: false,
          },
          gridLines: {
            color: "rgba(0, 0, 0, 0)",
            drawBorder: false,
            display: false,
          },
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
    }
  });
  new Chart(document.getElementById("items-bar-chart"), {
    type: 'bar',
    data: {
      labels: ["Africa", "Asia", "Europe", "Latin America", "North America", "dsadsa", "dasd", "dasd", "etre", "sfdfsd", "sfd", "fsdf", "etre", "sfdfsd", "Africa", "Asia", "Europe", "Latin America", "North America", ],
      datasets: [{
          backgroundColor: "#65bcf4",
          strokeColor: "brown",
          label: "",
          data: [478, 947, 734, 784, 433, 267, 734, 784, 433, 734, 184, 433, 234, 784, 433, 234, 784, 134, 784, 433, 734]
        },
        {
          backgroundColor: "#1423ec",
          strokeColor: "brown",
          label: "",
          data: [784, 433, 334, 484, 433, 433, 34, 784, 433, 34, 784, 433, 734, 84, 433, 734, 67, 734, 784, 33, 734]
        },
        {
          backgroundColor: "#ec2e14",
          strokeColor: "brown",
          label: "",
          data: [84, 33, 134, 84, 233, 33, 234, 84, 33, 34, 84, 133, 34, 84, 33, 134,67, 34, 84, 133, 34]
        }
      ]
    },
    options: {

      legend: {
        display: false
      },
      title: {
        display: false,
        text: ""
      },
      scales: {
        xAxes: [{
          barPercentage: 0.7,
          stacked: true,
          ticks: {
            display: false,
          },
          gridLines: {
            color: "rgba(0, 0, 0, 0)",
            drawBorder: false,
            display: false,
          },
        }],
        yAxes: [{
          stacked: true,
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
    }
  });

  new Chart(document.getElementById("expense-doughnut-chart1"), {
    type: 'doughnut',
    data: {
      labels: ["Africa", "Asia"],
      datasets: [{
        label: "Population (millions)",
        backgroundColor: ["rgba(255, 255, 255, 0)", "rgba(0, 154, 254, 0.71)"],
        data: [2478, 5267]
      }]
    },
    options: {
      cutoutPercentage: 80,
      legend: {
        display: false
      },
      title: {
        display: false,
        text: 'Predicted world population (millions) in 2050',
        display: false,

        lable: false,
      }
    },
    elements: {
      center: {
        text: '70%',
        color: '#36A2EB', //Default black
        fontStyle: 'Helvetica', //Default Arial
        sidePadding: 15 //Default 20 (as a percentage)
      }
    }
  });
  new Chart(document.getElementById("expense-doughnut-chart2"), {
    type: 'doughnut',
    data: {
      labels: ["Africa", "Asia"],
      datasets: [{
        label: "Population (millions)",
        backgroundColor: ["rgba(0, 254, 10, 0.71)", "rgba(255, 255, 255, 0)"],
        data: [2478, 4267]
      }]
    },
    options: {
      cutoutPercentage: 80,
      legend: {
        display: false
      },
      title: {
        display: false,
        text: 'Predicted world population (millions) in 2050',
        display: false,

        lable: false,
      }
    },
    elements: {
      center: {
        text: '70%',
        color: '#36A2EB', //Default black
        fontStyle: 'Helvetica', //Default Arial
        sidePadding: 15 //Default 20 (as a percentage)
      }
    }
  });
  new Chart(document.getElementById("expense-doughnut-chart3"), {
    type: 'doughnut',
    data: {
      labels: ["Africa", "Asia"],
      datasets: [{
        label: "Population (millions)",
        backgroundColor: ["rgba(255, 255, 255, 0)", "rgba(252, 34, 34, 0.84)"],
        data: [3478, 3267]
      }]
    },
    options: {
      cutoutPercentage: 80,
      legend: {
        display: false
      },
      title: {
        display: false,
        text: 'Predicted world population (millions) in 2050',
        display: false,

        lable: false,
      }
    },
    elements: {
      center: {
        text: '70%',
        color: '#096db0', //Default black
        fontStyle: 'Helvetica', //Default Arial
        sidePadding: 15, //Default 20 (as a percentage)
      }
    }
  });
  new Chart(document.getElementById("expense-doughnut-chart4"), {
    type: 'doughnut',
    data: {
      labels: ["Africa", "Asia"],
      datasets: [{
        label: "Population (millions)",
        backgroundColor: ["rgba(255, 255, 255, 0)", "rgba(254, 251, 0, 0.71)"],
        data: [2478, 4267]
      }]
    },
    options: {
      cutoutPercentage: 80,
      legend: {
        display: false
      },
      title: {
        display: false,
        text: 'Predicted world population (millions) in 2050',
        display: false,

        lable: false,
      }
    },
    elements: {
      center: {
        text: '70%',
        color: '#36A2EB', //Default black
        fontStyle: 'Helvetica', //Default Arial
        sidePadding: 15 //Default 20 (as a percentage)
      }
    }
  });



})
