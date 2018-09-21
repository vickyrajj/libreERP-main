app.controller('businessManagement.ecommerce.configure.offerBanner.explore', function($scope, $http, $aside, $state, Flash, $users, $filter, $permissions,$rootScope) {
  $scope.data = $scope.tab.data.offerBanner;
})


app.controller('businessManagement.ecommerce.configure.offerBanner', function($scope, $http, $aside, $state, Flash, $users, $filter, $permissions,$rootScope) {

  $scope.resetForm = function(){
    $scope.form = {
      image: emptyFile,
      imagePortrait: emptyFile,
      title: '',
      subtitle: '',
      level: 1,
      page: ''
    };
    $scope.url = '/api/ecommerce/offerBanner/';
    $scope.method = 'POST';
    $scope.mode = 'new'
    $scope.msg = 'Create'
  }
  $scope.resetForm()

  $scope.$on('offerBannerUpdate', function(event, input) {
    console.log("recieved");
    console.log(input.data);
    $scope.msg = 'Update'
    $scope.form = input.data
    $scope.mode = 'edit'
    $scope.url = '/api/ecommerce/offerBanner/' + input.data.pk + '/?mode=configure';
    $scope.method = 'PATCH';

  });

  $scope.pageSearch = function(query) {
    console.log(query);
    return $http.get('/api/ecommerce/pages/?title__icontains=' + query).
    then(function(response) {
      console.log('**********************', response);
      return response.data;
    })
  }


  $scope.submit = function() {

    if ($scope.form.title.length == 0) {
      Flash.create('danger', 'Please Mention Some Title');
      return;
    }
    var fd = new FormData();
    fd.append('title', $scope.form.title);
    fd.append('level', $scope.form.level);
    if ($scope.form.subtitle != null && $scope.form.subtitle.length > 0) {
      fd.append('subtitle', $scope.form.subtitle);
    }
    if ($scope.mode == 'new') {

      if ($scope.form.image == emptyFile) {
        Flash.create('danger', 'No image selected');
        return;
      } else {
        fd.append('image', $scope.form.image);
      }
      if ($scope.form.imagePortrait == emptyFile) {
        Flash.create('danger', 'No Potrait image selected');
        return;
      } else {
        fd.append('imagePortrait', $scope.form.imagePortrait);
      }
      if ($scope.form.page == null || $scope.form.page == '' || typeof $scope.form.page != 'object') {
        Flash.create('danger', 'Please Selcet Some Page');
        return;
      }else {
        fd.append('page', $scope.form.page.pk);
      }
    } else {
      fd.append('active', $scope.form.active);
      if (typeof $scope.form.image != 'string' && $scope.form.image != emptyFile) {
        fd.append('image', $scope.form.image);
      }

      if (typeof $scope.form.imagePortrait != 'string' && $scope.form.imagePortrait != emptyFile) {
        fd.append('imagePortrait', $scope.form.imagePortrait);
      }
      if ($scope.form.page == '') {
        Flash.create('danger', 'Please Selcet Some Page');
        return;
      }else {
        if (typeof $scope.form.page == 'object') {
          fd.append('page', $scope.form.page.pk);
        }
      }
    }
    $http({
      method: $scope.method,
      url: $scope.url,
      data: fd,
      transformRequest: angular.identity,
      headers: {
        'Content-Type': undefined
      }
    }).
    then(function(response) {
      Flash.create('success', response.status + ' : ' + response.statusText);
      $rootScope.$broadcast('forceRefetch', {});
      $scope.resetForm()
    }, function(response) {
      Flash.create('danger', response.status + ' : ' + response.statusText);
    });
  }



});

app.controller('businessManagement.ecommerce.configure.fAQ.form', function($scope, $http, $aside, $state, Flash, $users, $filter, $permissions,$rootScope) {

  if (angular.isUndefined($scope.data.pk)) {
    $scope.mode = 'new';
    $scope.msg = 'Create';
    $scope.data = {
      ques: '',
      ans: '',
    };
    $scope.url = '/api/ecommerce/frequentlyQuestions/';
    $scope.method = 'POST';
  } else {
    $scope.mdoe = 'edit';
    $scope.msg = 'Update';
    $scope.url = '/api/ecommerce/frequentlyQuestions/' + $scope.data.pk + '/?mode=configure';
    $scope.method = 'PATCH';
  }

  $scope.saveFAQ = function() {
    var f = $scope.data
    if (f.ques.length == 0) {
      Flash.create('warning', 'Please Write The Question');
      return;
    }
    if (f.ans.length == 0) {
      Flash.create('warning', 'Please Write The Answer');
      return;
    }
    var toSend = {ques:f.ques,ans:f.ans}
    console.log(toSend);
    $http({
      method: $scope.method,
      url: $scope.url,
      data: toSend,
    }).
    then(function(response) {
      if ($scope.mode == 'new') {
        $scope.data = {
          ques: '',
          ans: '',
        };
        $rootScope.$broadcast('forceRefetch', {});
      }
      Flash.create('success', response.status + ' : ' + response.statusText);
    }, function(response) {
      Flash.create('danger', response.status + ' : ' + response.statusText);
    });
  }

});


app.controller('businessManagement.ecommerce.configure', function($scope, $uibModal, $http, $aside, $state, Flash, $users, $filter, $permissions , $rootScope) {



  $scope.data = {
    tableFieldData: [],
    tableproductData: [],
    tablePromocodeData: [],
    tableOfferBannersData: [],
  };

  var fieldViews = [{
    name: 'list',
    icon: 'fa-th-large',
    template: '/static/ngTemplates/genericTable/genericSearchList.html',
    itemTemplate: '/static/ngTemplates/app.ecommerce.vendor.configure.field.item.html',
  }, ];

  var productViews = [{
    name: 'list',
    icon: 'fa-th-large',
    template: '/static/ngTemplates/genericTable/genericSearchList.html',
    itemTemplate: '/static/ngTemplates/app.ecommerce.vendor.configure.product.item.html',
  }, ];

  var promocodeViews = [{
    name: 'list',
    icon: 'fa-th-large',
    template: '/static/ngTemplates/genericTable/genericSearchList.html',
    itemTemplate: '/static/ngTemplates/app.ecommerce.vendor.configure.promocode.item.html',
  }, ];



  $scope.fieldConfig = {
    views: fieldViews,
    url: '/api/ecommerce/field/',
    searchField: 'name',
    deletable: true,
    itemsNumPerView: [12, 24, 48],
  }

  $scope.genericProductConfig = {
    views: productViews,
    url: '/api/ecommerce/genericProduct/',
    searchField: 'name',
    deletable: true,
    itemsNumPerView: [12, 24, 48],
  }

  $scope.promocodesConfig = {
    views: promocodeViews,
    url: '/api/ecommerce/promocode/',
    searchField: 'name',
    deletable: true,
    itemsNumPerView: [12, 24, 48],
  }


  $scope.offerBannersConfig = {
    views: [{
      name: 'list',
      icon: 'fa-th-large',
      template: '/static/ngTemplates/genericTable/genericSearchList.html',
      itemTemplate: '/static/ngTemplates/app.ecommerce.vendor.form.offerBanner.item.html',
    }, ],
    url: '/api/ecommerce/offerBanner/',
    searchField: 'title',
    deletable: true,
    itemsNumPerView: [12, 24, 48],
  }

  $scope.fAQConfig = {
    views: [{
      name: 'table',
      icon: 'fa-bars',
      template: '/static/ngTemplates/genericTable/tableDefault.html'
    }, ],
    url: '/api/ecommerce/frequentlyQuestions/',
    deletable: true,
    searchField: 'ques',
    canCreate: false,
    editorTemplate: '/static/ngTemplates/app.ecommerce.vendor.configure.FAQ.form.html',
  }


  $scope.editorTemplateField = '/static/ngTemplates/app.ecommerce.vendor.form.field.html';

  $scope.editorTemplateGenericProduct = '/static/ngTemplates/app.ecommerce.vendor.form.genericProduct.html';

  $scope.tableActionFields = function(target, action, mode) {
    console.log(target, action, mode);
    console.log($scope.data.tableFieldData);

    for (var i = 0; i < $scope.data.tableFieldData.length; i++) {
      if ($scope.data.tableFieldData[i].pk == parseInt(target)) {
        if (action == 'edit') {
          console.log('editing');
          var title = 'Edit Field : '
          var appType = 'editField'
        } else if (action == 'info')  {
          var title = 'Field Explore : '
          var appType = 'fieldExplore'
        }
        else if (action == 'delete') {
          $http({
            method: 'DELETE',
            url: '/api/ecommerce/field/' + $scope.data.tableFieldData[i].pk + '/'
          }).
          then(function(response) {
            Flash.create('success', 'Deleted Successfully!');
          })
          $scope.data.tableFieldData.splice(i, 1)
          return;
        }
        // i clicked this $scope.data.tableFieldData[i]
        $scope.addTab({
          title: title + $scope.data.tableFieldData[i].pk,
          cancel: true,
          app: appType,
          data: {
            pk: target,
            field: $scope.data.tableFieldData[i]
          },
          active: true
        })
      }
    }

  }

  $scope.tableProductAction = function(target, action, mode) {
    console.log(target, action, mode);
    console.log($scope.data.tableproductData);

    for (var i = 0; i < $scope.data.tableproductData.length; i++) {
      if ($scope.data.tableproductData[i].pk == parseInt(target)) {
        if (action == 'edit') {
          console.log('editing');
          var title = 'Edit Product : '
          var appType = 'editproduct'
        }else if (action == 'delete') {
          $http({method : 'DELETE' , url : '/api/ecommerce/genericProduct/' + target + '/'}).
          then(function(response) {
            Flash.create('success' , 'Deleted');
            $scope.$broadcast('forceRefetch', {});
          })
          return
        } else {
          var title = 'Product Explore : '
          var appType = 'productExplore'
        }
        // i clicked this $scope.data.tableproductData[i]
        $scope.addTab({
          title: title + $scope.data.tableproductData[i].pk,
          cancel: true,
          app: appType,
          data: {
            pk: target,
            field: $scope.data.tableproductData[i]
          },
          active: true
        })
      }
    }

  }

  $scope.tableActionOfferBanners = function(target, action, mode) {
    console.log(target, action, mode);
    console.log($scope.data.tableOfferBannersData);

    for (var i = 0; i < $scope.data.tableOfferBannersData.length; i++) {
      if ($scope.data.tableOfferBannersData[i].pk == parseInt(target)) {
        if (action == 'edit') {
          console.log('editing');
          // var title = 'Edit OfferBanner : '
          // var appType = 'editOfferBanner'
          $rootScope.$broadcast('offerBannerUpdate', {data:$scope.data.tableOfferBannersData[i]});
        }else if (action == 'delete') {
          $http({method : 'DELETE' , url : '/api/ecommerce/offerBanner/' + target + '/'}).
          then(function(response) {
            Flash.create('success' , 'Deleted');
            $scope.$broadcast('forceRefetch', {});
          })
        } else {
          var title = 'OfferBanner Explore : '
          var appType = 'offerBannerExplore'
          $scope.addTab({
            title: title + $scope.data.tableOfferBannersData[i].pk,
            cancel: true,
            app: appType,
            data: {
              pk: target,
              offerBanner: $scope.data.tableOfferBannersData[i]
            },
            active: true
          })
        }
        // i clicked this $scope.data.tableOfferBannersData[i]

      }
    }

  }

  $scope.tablePromocodeAction = function(target, action, mode) {
    console.log(target, action, mode);
    console.log($scope.data.tablePromocodeData);

    for (var i = 0; i < $scope.data.tablePromocodeData.length; i++) {
      if ($scope.data.tablePromocodeData[i].pk == parseInt(target)) {
        if (action == 'editPromocode') {
          console.log('editPromocode');
          $rootScope.$broadcast('promoUpdate', {data:$scope.data.tablePromocodeData[i]});
        }
      }
    }

  }

  $scope.tabs = [];
  $scope.searchTabActive = true;

  $scope.closeTab = function(index) {
    $scope.tabs.splice(index, 1)
  }

  $scope.addTab = function(input) {
    console.log(JSON.stringify(input));
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
  $scope.pincodelist=[]
  $scope.form={pincodes:''}
  $scope.addPincode = function(){
    console.log('7777777777777777777',typeof $scope.form.pincodes);
    if (typeof $scope.form.pincodes=='undefined'){
        Flash.create('danger', 'Not a valid number!');
    }
    // var method = 'POST'
    // var url = '/api/ecommerce/addPincode/'
    dataToSend = {
      pincodes : $scope.form.pincodes,
    }
    $http({method : 'POST' , url : '/api/ecommerce/addPincode/', data : dataToSend }).
    then(function(response) {
      $scope.pincodelist.push(response.data)
      console.log($scope.pincodelist);
      Flash.create('success', 'Pincode added to list..');
      $scope.form={pincodes:''}

    })

  }
  $http({method : 'GET' , url : '/api/ecommerce/addPincode/'}).
  then(function(response) {
    $scope.pincodelist=response.data
  })


  $scope.addImage = function(){
    var fd = new FormData();
    if ($scope.form.backgroundImage != null && typeof $scope.form.backgroundImage != 'string') {
      fd.append('backgroundImage', $scope.form.backgroundImage);
    }
    if ($scope.form.cartImage != null && typeof $scope.form.cartImage != 'string') {
      fd.append('cartImage', $scope.form.cartImage);
    }
    if ($scope.form.paymentImage != null && typeof $scope.form.paymentImage != 'string') {
      fd.append('paymentImage',$scope.form.paymentImage);
    }
    if ($scope.form.paymentPortrait != null && typeof $scope.form.paymentPortrait != 'string') {
      fd.append('paymentPortrait',$scope.form.paymentPortrait);
    }
    if ($scope.form.searchBgImage != null && typeof $scope.form.searchBgImage != 'string') {
      fd.append('searchBgImage',$scope.form.searchBgImage);
    }
    if ($scope.form.blogPageImage != null && typeof $scope.form.blogPageImage != 'string') {
      fd.append('blogPageImage',$scope.form.blogPageImage);
    }
    $http({method : 'GET' , url : '/api/ecommerce/genericImage/'}).
    then(function(response) {
      if(response.data.length==0){
        $http({
          method: 'POST',
          url: '/api/ecommerce/genericImage/',
          data: fd,
          transformRequest: angular.identity,
          headers: {
            'Content-Type': undefined
          }
        }).
        then(function(response) {
            Flash.create('success', 'Added Successfully!!!!');
            return
        }, function(err) {
          Flash.create('danger', 'All Images Should Upload');
        });
      }
      else{
        $http({
          method: 'PATCH',
          url: '/api/ecommerce/genericImage/'+response.data[0].pk+'/',
          data: fd,
          transformRequest: angular.identity,
          headers: {
            'Content-Type': undefined
          }
        }).
        then(function(response) {
          Flash.create('success', 'Updated Successfully!!!!');
          return
        });
      }
  })

}

// $http({method : 'GET' , url : '/api/ecommerce/genericImage/'}).
// then(function(response) {
//   $scope.imageData = response.data[0]
// })

});

app.controller('businessManagement.ecommerce.configure.promocode.form', function($scope, $http, $aside, $state, Flash, $users, $filter, $permissions,$rootScope) {
  $scope.promoForm = {name:'',discount:1,validTimes:1,endDate:new Date()}
  $scope.mode = 'new'
  $scope.msg = 'Create'

  $scope.$on('promoUpdate', function(event, input) {
    console.log("recieved");
    console.log(input.data);
    $scope.msg = 'Update'
    $scope.promoForm = input.data
    $scope.mode = 'edit'

  });

  $scope.savePromocode = function(){
    console.log('7777777777777777777',$scope.promoForm);
    if ($scope.promoForm.name.length ==0 || $scope.promoForm.discount.length == 0 || $scope.promoForm.validTimes.length == 0) {
      Flash.create('warning', 'Please Fill All The Fields')
      return;
    }

    var method = 'POST'
    var url = '/api/ecommerce/promocode/'
    if ($scope.mode == 'edit') {
      method = 'PATCH'
      url = url + $scope.promoForm.pk + '/'
    }
    var f = $scope.promoForm
    dataToSend = {
      name : f.name,
      discount : f.discount,
      validTimes : f.validTimes,
      endDate : f.endDate
    }
    $http({method : method , url : url, data : dataToSend }).
    then(function(response) {
      Flash.create('success', $scope.msg + 'd');
      $rootScope.$broadcast('forceRefetch', {});
      $scope.promoForm = {name:'',discount:1,validTimes:1,endDate:new Date()}
      $scope.mode = 'new'
    })

  }

})


app.controller('businessManagement.ecommerce.configure.form', function($scope, $http, $aside, $state, Flash, $users, $filter, $permissions) {

  $scope.me = $users.get('mySelf');
  $scope.curr = $scope.me.profile.currency;
  console.log($scope.me);
  if ($scope.curr == 'INR') {
    $scope.currSymbol = 'inr';
  } else if ($scope.curr == 'USD') {
    $scope.currSymbol = 'usd';
  } else if ($scope.curr == 'GBP') {
    $scope.currSymbol = 'gbp';
  } else if ($scope.curr == 'EUR') {
    $scope.currSymbol = 'eur';
  } else {
    $scope.currSymbol = 'aud';
  }

  $scope.resetForm = function() {
    $scope.form = {
      mode: 'field',
      fieldType: 'char',
      parent: '',
      name: '',
      choiceLabel: '',
      unit: '',
      helpText: '',
      default: '',
      fields: [],
      minCost: 0,
      visual: emptyFile,
      bannerImage:emptyFile
    }
    $scope.editing = false
  }

  $scope.resetForm();
  $scope.ChoiceValues = []

  if ($scope.tab == undefined) {
    $scope.mode = 'new';
    $scope.resetForm();
  } else {
    $scope.mode = 'edit';
    console.log('ssssssssssssssssss');
    console.log($scope.tab.data.field);
    $scope.form = $scope.tab.data.field;
    if ('fields' in $scope.tab.data.field) {
      $scope.form.mode = 'genericProduct'
    } else {

      $scope.form.mode = 'field'
    }
    if ($scope.form.fieldType == 'choice') {
      $scope.ChoiceValues = JSON.parse($scope.form.data)
    }
    console.log('ffffffffff', $scope.ChoiceValues);
    $scope.editing = true

  }


  $scope.getFieldsSuggestions = function(query) {
    console.log(query);
    return $http.get('/api/ecommerce/field/?name__contains=' + query)
  }

  $scope.parentSearch = function(query) {
    console.log(query);
    return $http.get('/api/ecommerce/genericProduct/?name__contains=' + query).
    then(function(response) {
      console.log('**********************', response);
      return response.data;
    })
  }

  // $scope.parentFields = []
  //
  //
  // $scope.$watch('form.parent' , function(newValue, oldValue){
  //   if (newValue != null && typeof newValue =='object') {
  //     if (newValue.data.fields) {
  //       for (var i = 0; i < newValue.data.fields.length; i++) {
  //         parentFields.push(newValue.data.fields[i].pk)
  //       }
  //     }
  //   }
  // }, true);


  $scope.addChoice = function() {
    console.log($scope.form.choiceLabel);
    $scope.ChoiceValues.push($scope.form.choiceLabel)
    $scope.form.choiceLabel = ''
    console.log($scope.ChoiceValues);
  }
  $scope.removeChoice = function(idx) {
    $scope.ChoiceValues.splice(idx, 1)
  }

  $scope.submit = function() {
    d = $scope.form;
    console.log(d);
    console.log($scope.editing);
    if (d.name == '' || d.name.length == 0) {
      Flash.create('warning', 'Name Should Not Be Blank')
      return;
    }

    if ($scope.form.mode == 'field') {
      dataToSend = {
        fieldType: d.fieldType,
        name: d.name,
        unit: d.unit,
        helpText: d.helpText,
        default: d.default,
        choiceLabel: d.choiceLabel
      };
      if (d.fieldType == 'choice') {
        if ($scope.ChoiceValues.length == 0) {
          Flash.create('warning', 'Please Add Some Choices')
          return;
        }
        dataToSend.data = JSON.stringify($scope.ChoiceValues);
      }

      url = '/api/ecommerce/field/';
      console.log(dataToSend);
    } else if ($scope.form.mode == 'genericProduct') {
      fs = [];
      console.log(d.fields);
      if (d.fields.length == 0) {
        Flash.create('warning', 'No fields selected')
        return;
      }
      console.log(d.bannerImage,'aaaaaaaaaaaaaa');
      if (d.bannerImage== null || typeof d.bannerImage == 'string'||d.bannerImage.name=='') {
        Flash.create('warning', 'Please add the Banner Image')
        return;
      }
      for (var i = 0; i < d.fields.length; i++) {
        fs.push(d.fields[i].pk);
      }

      var fd = new FormData();
      fd.append('name', d.name);
      fd.append('fields', fs);
      fd.append('minCost', d.minCost);
      if (d.parent != null && d.parent.pk != undefined) {
        fd.append('parent', d.parent.pk);
      }
      if (d.visual != null && typeof d.visual != 'string') {
        fd.append('visual', d.visual);
      }
      if (d.bannerImage != null && typeof d.bannerImage != 'string') {
        fd.append('bannerImage', d.bannerImage);
      }
      url = '/api/ecommerce/genericProduct/';
      console.log(fd);
    }

    if ($scope.editing) {
      url += $scope.form.pk + '/';
      method = 'PATCH';
    } else {
      method = 'POST';
    }
    if ($scope.form.mode != 'genericProduct') {
      $http({
        method: method,
        url: url,
        data: dataToSend
      }).
      then(function(response) {
        if (!$scope.editing) {
          $scope.form = {
            mode: $scope.form.mode,
            fieldType: 'char',
            parent: '',
            name: '',
            choiceLabel: '',
            unit: '',
            helpText: '',
            default: '',
            fields: [],
            minCost: 0,
            visual: emptyFile,
            bannerImage:emptyFile
          };
        }
        Flash.create('success', response.status + ' : ' + response.statusText);
      }, function(response) {
        Flash.create('danger', response.status + ' : ' + response.statusText);
      })

    } else {

      // because we need to use formdata for the genericProduct
      $http({
        method: method,
        url: url,
        data: fd,
        transformRequest: angular.identity,
        headers: {
          'Content-Type': undefined
        }
      }).
      then(function(response) {
        if (!$scope.editing) {
          $scope.form = {
            mode: $scope.form.mode,
            fieldType: 'char',
            parent: '',
            name: '',
            choiceLabel: '',
            unit: '',
            helpText: '',
            default: '',
            fields: [],
            minCost: 0,
            visual: emptyFile,
            bannerImage:emptyFile
          }
        }
        Flash.create('success', response.status + ' : ' + response.statusText);
      }, function(response) {
        Flash.create('danger', response.status + ' : ' + response.statusText);
      });
    }

  }

});
