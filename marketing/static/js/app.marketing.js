// you need to first configure the states for this app

app.config(function($stateProvider) {

  $stateProvider
    .state('businessManagement.marketing', {
      url: "/marketing",
      views: {
        "": {
          templateUrl: '/static/ngTemplates/genericAppBase.html',
        },
        "menu@businessManagement.marketing": {
          templateUrl: '/static/ngTemplates/genericMenu.html',
          controller: 'controller.generic.menu',
        },
        "@businessManagement.marketing": {
          templateUrl: '/static/ngTemplates/app.marketing.default.html',
          controller: 'businessManagement.marketing.default',
        }
      }
    })
    .state('businessManagement.marketing.contacts', {
      url: "/contacts",
      templateUrl: '/static/ngTemplates/app.marketing.contacts.html',
      controller: 'businessManagement.marketing.contacts'
    })
    .state('businessManagement.marketing.campaign', {
      url: "/campaign",
      templateUrl: '/static/ngTemplates/app.marketing.campaign.html',
      controller: 'businessManagement.marketing.campaign'
    })
    .state('businessManagement.marketing.leads', {
      url: "/leads",
      templateUrl: '/static/ngTemplates/app.marketing.leads.html',
      controller: 'businessManagement.marketing.leads'
    })
    .state('businessManagement.marketing.presentations', {
      url: "/presentations",
      templateUrl: '/static/ngTemplates/app.marketing.presentations.html',
      controller: 'businessManagement.marketing.presentations'
    })
    // .state('businessManagement.marketing.customers', {
    //   url: "/customers",
    //   templateUrl: '/static/ngTemplates/app.marketing.customers.html',
    //   controller: 'businessManagement.marketing.customers'
    // })

});




app.controller("businessManagement.marketing.default", function($scope, $state, $users, $stateParams, $http, Flash) {

  new Chart(document.getElementById("line-chart"), {
    type: 'line',
    data: {
      labels: ['', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '','', '', '', '', '', '', '', '', '', ''],
      datasets: [{
        data: [860, -114, 1060, -306, 107, -888, -133, 1000, -783, 2478, 860, -114, 1060, -306, 107, -888, -133, 1000, -783, 2478,860, -114, 1060, -306, 107, -888, -133, 1000,],
        label: "",
        borderColor: "#3e95cd",
        fill: false,
        lineTension: 0,
      }]
    },
    options: {
      legend:{
        display:false
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
      labels: ['', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '','', '', '', '', '', '', '', '', '', ''],
      datasets: [{
        data: [860, -114, 1060, -306, 107, -888, -133, 1000, -783, 2478, 860, -114, 1060, -306, 107, -888, -133, 1000, -783, 2478,860, -114, 1060, -306, 107, -888, -133, 1000,],
        label: "",
        borderColor: "#3e95cd",
        fill: false,
        lineTension: 0,
      }]
    },
    options: {
      legend:{
        display:false
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
      labels: ['', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '','', '', '', '', '', '', '', '', '', ''],
      datasets: [{
        data: [860, -114, 1060, -306, 107, -888, -133, 1000, -783, 2478, 860, -114, 1060, -306, 107, -888, -133, 1000, -783, 2478,860, -114, 1060, -306, 107, -888, -133, 1000,],
        label: "",
        borderColor: "#3e95cd",
        fill: false,
        lineTension: 0,
      }]
    },
    options: {
      legend:{
        display:false
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


})
