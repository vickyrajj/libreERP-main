app.controller("businessManagement.ecommerce.pages", function($scope, $state, $users, $stateParams, $http, Flash, $uibModal, $rootScope) {

  $scope.data = {
    tableData: []
  };

  views = [{
    name: 'list',
    icon: 'fa-th-large',
    template: '/static/ngTemplates/genericTable/genericSearchList.html',
    itemTemplate: '/static/ngTemplates/app.ecommerce.vendors.pages.items.html',
  }, ];


  $scope.config = {
    views: views,
    url: '/api/ecommerce/pages/',
    searchField: 'title',
    itemsNumPerView: [16, 32, 48],
  }


  $scope.tableAction = function(target, action, mode) {
    console.log(target, action, mode);
    console.log($scope.data.tableData);

    for (var i = 0; i < $scope.data.tableData.length; i++) {
      if ($scope.data.tableData[i].pk == parseInt(target)) {
        if (action == 'edit') {
          var title = 'Edit : ';
          var appType = 'PagesEditor';
        } else if (action == 'info') {
          var title = 'Details : ';
          var appType = 'PagesInfo';
        }

        $scope.addTab({
          title: title + $scope.data.tableData[i].title,
          cancel: true,
          app: appType,
          data: $scope.data.tableData[i],
          active: true
        })

      }
    }
  }

  $scope.tabs = [];
  $scope.searchTabActive = true;

  $scope.closeTab = function(index) {
    $scope.tabs.splice(index, 1)
  }

  $scope.addTab = function(input) {
    $scope.searchTabActive = false;
    alreadyOpen = false;
    for (var i = 0; i < $scope.tabs.length; i++) {
      if ($scope.tabs[i].data.pk == input.data.pk && $scope.tabs[i].app == input.app) {
        $scope.tabs[i].active = true;
        alreadyOpen = true;
      } else {
        $scope.tabs[i].active = false;
      }
    }
    if (!alreadyOpen) {
      $scope.tabs.push(input)
    }
  }

});


app.controller("businessManagement.ecommerce.pages.form", function($scope, $state, $users, $stateParams, $http, Flash, $uibModal, $rootScope) {

  $scope.tinymceOptions = {
    selector: 'textarea',
    content_css : '/static/css/bootstrap.min.css',
    inline: false,
    plugins : 'advlist autolink link image lists charmap preview imagetools paste table insertdatetime code searchreplace ',
    skin: 'lightgray',
    theme : 'modern',
    height : 640,
    toolbar : 'saveBtn publishBtn cancelBtn headerMode bodyMode | undo redo | bullist numlist | alignleft aligncenter alignright alignjustify | outdent  indent blockquote | bold italic underline | image link | style-p style-h1 style-h2 style-h3',
    setup: function (editor ) {

      [ 'p', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6'].forEach(function(name){
       editor.addButton("style-" + name, {
           tooltip: "Toggle " + name,
             text: name.toUpperCase(),
             onClick: function() { editor.execCommand('mceToggleFormat', false, name); },
             onPostRender: function() {
                 var self = this, setup = function() {
                     editor.formatter.formatChanged(name, function(state) {
                         self.active(state);
                     });
                 };
                 editor.formatter ? setup() : editor.on('init', setup);
             }
         })
      });

    },
  };

  $scope.resetForm = function(){
    if ($scope.mode == 'new') {
      $scope.form = {title:'',pageurl:'',body:''}
    }else {
      $scope.form.title = ''
      $scope.form.pageurl = ''
      $scope.form.body = ''
    }
  }

  if ($scope.tab != undefined) {
    $scope.mode = 'edit';
    console.log('aaaaaaaaaaaa', $scope.tab.data);
    $scope.form = $scope.tab.data;
  } else {
    $scope.mode = 'new';
    $scope.resetForm();
  }

  $scope.generateUrl = function(){
    if ($scope.form.title == null || $scope.form.title.length==0) {
      Flash.create('warning','Please Mention Title')
      return
    }
    $scope.form.pageurl = $scope.form.title.toLowerCase().split(' ').join('-')
    console.log($scope.form.pageurl);
  }

  $scope.save = function() {
    console.log('entered');
    var f = $scope.form;

    if (f.title == null || f.title.length==0) {
      Flash.create('warning','Please Mention Title')
      return
    }
    if (f.pageurl == null || f.pageurl.length==0) {
      Flash.create('warning','Please Generate Url')
      return
    }
    if (f.body == null || f.body.length==0) {
      Flash.create('warning','Please Create Some Body Content')
      return
    }else if (f.body.length > 9990) {
      Flash.create('warning','Body Content Is Too Big')
      return
    }

    var url = '/api/ecommerce/pages/';
    if ($scope.mode == 'new') {
      var method = 'POST';
    } else {
      var method = 'PATCH';
      url += f.pk + '/'
    }
    f.pageurl = f.title.toLowerCase().split(' ').join('-')
    var toSend = {
      title:f.title,
      pageurl:f.pageurl,
      body:f.body
    }
    console.log('dataaaaaaaaaaaaaaaaaaa',toSend);

    $http({
      method: method,
      url: url,
      data: toSend,
    }).
    then(function(response) {
      Flash.create('success', 'Saved')
      if ($scope.mode == 'new') {
        $scope.resetForm()
      }
    }, function(err) {
      Flash.create('danger' , 'Some Internal Error')
    })
  }


});


app.controller("businessManagement.ecommerce.pages.explore", function($scope, $state, $users, $stateParams, $http, Flash, $uibModal, $rootScope) {

  $scope.data = $scope.tab.data;
  console.log(  $scope.data ,'AAAAAAAAAAA');

});
