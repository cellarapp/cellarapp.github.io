var app = angular.module('ionicApp', ['ionic', 'angular.filter'])

.controller('MyCtrl', function($scope, $http, $ionicActionSheet, $ionicScrollDelegate, $ionicLoading, $ionicPopup,  $ionicModal) {

  $ionicModal.fromTemplateUrl('image-modal.html', {
      scope: $scope,
      animation: 'slide-in-up'
    }).then(function(modal) {
      $scope.modal = modal;
    });

    $scope.openModal = function() {
      $scope.modal.show();
    };

    $scope.closeModal = function() {
      $scope.modal.hide();
    };

    //Cleanup the modal when we're done with it!
    $scope.$on('$destroy', function() {
      $scope.modal.remove();
    });



    $ionicLoading.show({
        template: 'Loading Beers...'
    });

    $scope.hideLoading = function() {
        $ionicLoading.hide();
    };

    $scope.scrollTop = function() {
        $ionicScrollDelegate.resize();
    };

    $scope.clearFilter = function() {
        $scope.query = '';
    };

    $scope.formatDate = function(date) {
        date = date.split('T')[0];
        return getFormattedDate(new Date(date));
    };

    $scope.doRefresh = function() {

        loadData($scope, $http, $ionicPopup);
    };

    $scope.showImage = function(cellarBeer) {

        if(cellarBeer.hasPhoto)
        {
            $scope.imageSrc  = 'http://cellarappapi.azurewebsites.net/api/cellar/cellarbeerpicture?cellarId=' + cellarBeer.id;
                
            $scope.openModal();
        }
    }

    $scope.search = function(item) {

        var breweryName = item.beer.breweryName.toLowerCase().replace("'", "");
        var beerName = item.beer.name.toLowerCase().replace("'", "");

        if (!$scope.query ||
            (breweryName.indexOf($scope.query.toLowerCase()) !== -1) ||
            (beerName.indexOf($scope.query.toLowerCase()) !== -1)) {
            return true;
        }
        return false;
    };

    $scope.items = "";
    loadData($scope, $http, $ionicPopup);
});


app.directive('errSrc', function() {
    return {
        link: function(scope, element, attrs) {
            element.bind('error', function() {
                if (attrs.src !== attrs.errSrc) {
                    attrs.$set('src', attrs.errSrc);
                }
            });
        }
    }
});


function loadData($scope, $http, $ionicPopup) {

var isCellar = getParameterByName('type') === 'Cellar';

    $http({
        method: 'GET',
        url: 'https://cellarappapi.azurewebsites.net/api/cellar/'+ (isCellar ? 'getcellarbeersweb' : 'getcollectionbeersweb') +'?token=' + getParameterByName('token'),
        timeout: 90000
    }).then(function(resp) {

        $scope.$broadcast('scroll.refreshComplete');
        $scope.hideLoading();

        var titleStr = isCellar ? '' : ' Collection';

        var title = 'Cellar'+titleStr+': ' + resp.data.name + ' (' + resp.data.untappdUser + ')';
        $scope.title = title;
        document.title = $scope.title;

        if (resp.data.beers.length > 0) {

            resp.data.beers.sort(function(a, b) {


                return (a.beer.breweryName + ' ' + a.beer.name).localeCompare(b.beer.breweryName + ' ' + b.beer.name);


                // if (a.beer.breweryName + ' ' + a.beer.name < b.beer.breweryName + ' ' + b.beer.name) return -1;
                // if (a.beer.breweryName + ' ' + a.beer.name > b.beer.breweryName + ' ' + b.beer.name) return 1;
                // return 0;
            });

            $scope.items = resp.data.beers;

        } else {
            $ionicPopup.alert({
                title: 'No beers in Collection!'
            });
        }

    }, function(data, status, headers, config) {

        $scope.$broadcast('scroll.refreshComplete');
        $scope.hideLoading();

        $ionicPopup.alert({
            title: 'Error loading beers. Please pull to refresh to try again.'
        });

    });

}

function getFormattedDate(date) {
    var year = date.getFullYear();
    var month = (1 + date.getMonth()).toString();
    month = month.length > 1 ? month : '0' + month;
    var day = date.getDate().toString();
    day = day.length > 1 ? day : '0' + day;
    return month + '-' + day + '-' + year;
}

function getParameterByName(name, url) {
    if (!url) {
        url = window.location.href;
    }
    name = name.replace(/[\[\]]/g, "\\$&");
    var regex = new RegExp("[?&]" + name + "(=([^&#]*)|&|#|$)"),
        results = regex.exec(url);
    if (!results) return null;
    if (!results[2]) return '';
    return decodeURIComponent(results[2].replace(/\+/g, " "));
}