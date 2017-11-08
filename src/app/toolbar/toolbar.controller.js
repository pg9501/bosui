(function ()
{
    'use strict';

    angular
        .module('app.toolbar')
        .controller('ToolbarController', ToolbarController);

    /** @ngInject */
    function ToolbarController($rootScope, $q, $state,$cookies, $timeout, $mdSidenav, $translate, $mdToast, msNavigationService)
    {
        var vm = this;

      var user=$cookies.getObject('globals').currentUser;
      vm.username=user.username;


        // Data
        $rootScope.global = {
            search: ''
        };

        vm.bodyEl = angular.element('body');
        vm.userStatusOptions = [
            {
                'title': 'Online',
                'icon' : 'icon-checkbox-marked-circle',
                'color': '#4CAF50'
            },
            {
                'title': 'Away',
                'icon' : 'icon-clock',
                'color': '#FFC107'
            },
            {
                'title': 'Do not Disturb',
                'icon' : 'icon-minus-circle',
                'color': '#F44336'
            },
            {
                'title': 'Invisible',
                'icon' : 'icon-checkbox-blank-circle-outline',
                'color': '#BDBDBD'
            },
            {
                'title': 'Offline',
                'icon' : 'icon-checkbox-blank-circle-outline',
                'color': '#616161'
            }
        ];
        vm.languages = {
            en: {
                'title'      : 'English',
                'translation': 'TOOLBAR.ENGLISH',
                'code'       : 'en',
                'flag'       : 'us'
            },
            de: {
                'title'      : 'German',
                'translation': 'TOOLBAR.GERMAN',
                'code'       : 'de',
                'flag'       : 'ger'
            },
            chn: {
                'title'      : 'Chinese',
                'translation': 'TOOLBAR.CHINESE',
                'code'       : 'chn',
                'flag'       : 'chn'
            }
        };

        // Methods
        vm.toggleSidenav = toggleSidenav;
        vm.logout = logout;
        vm.changeLanguage = changeLanguage;
        vm.setUserStatus = setUserStatus;
        vm.toggleHorizontalMobileMenu = toggleHorizontalMobileMenu;
        vm.toggleMsNavigationFolded = toggleMsNavigationFolded;
        vm.search = search;
        vm.searchResultClick = searchResultClick;

        //////////

        init();

        /**
         * Initialize
         */
        function init()
        {
            // Select the first status as a default
            vm.userStatus = vm.userStatusOptions[0];

            // Get the selected language directly from angular-translate module setting
            vm.selectedLanguage = vm.languages[$translate.preferredLanguage()];
        }


        /**
         * Toggle sidenav
         *
         * @param sidenavId
         */
        function toggleSidenav(sidenavId)
        {
            $mdSidenav(sidenavId).toggle();
        }

        /**
         * Sets User Status
         * @param status
         */
        function setUserStatus(status)
        {
            vm.userStatus = status;
        }

        /**
         * Logout Function
         */
        function logout()
        {
          window.localStorage.setItem('is-login', 'false');
          window.localStorage.setItem('save-cookie', 'false');
          var user={};
          user.name="";
          user.password="";
          user.role="";
          window.localStorage.setItem('user-info', JSON.stringify(user));
          $state.go("login");
        }

        /**
         * Change Language
         */
        function changeLanguage(lang)
        {
            vm.selectedLanguage = lang;

            /**
             * Show temporary message if user selects a language other than English
             *
             * angular-translate module will try to load language specific json files
             * as soon as you change the language. And because we don't have them, there
             * will be a lot of errors in the page potentially breaking couple functions
             * of the template.
             *
             * To prevent that from happening, we added a simple "return;" statement at the
             * end of this if block. If you have all the translation files, remove this if
             * block and the translations should work without any problems.
             */
            /*if ( lang.code !== 'en' )
            {
                var message = 'Fuse supports translations through angular-translate module, but currently we do not have any translations other than English language. If you want to help us, send us a message through ThemeForest profile page.';

                $mdToast.show({
                    template : '<md-toast id="language-message" layout="column" layout-align="center start"><div class="md-toast-content">' + message + '</div></md-toast>',
                    hideDelay: 7000,
                    position : 'top right',
                    parent   : '#content'
                });

                return;
            }*/

            // Change the language
            $translate.use(lang.code);
        }

        /**
         * Toggle horizontal mobile menu
         */
        function toggleHorizontalMobileMenu()
        {
            vm.bodyEl.toggleClass('ms-navigation-horizontal-mobile-menu-active');
        }

        /**
         * Toggle msNavigation folded
         */
        function toggleMsNavigationFolded()
        {
            msNavigationService.toggleFolded();
        }

        /**
         * Search action
         *
         * @param query
         * @returns {Promise}
         */
        function search(query)
        {
            var navigation = [],
                flatNavigation = msNavigationService.getFlatNavigation(),
                deferred = $q.defer();

          var adminOptions=["Locations","Devices","Floor Plan"];
          var operatorOptions=["All Dwellers","Add A Dweller","Optimization Goals","Building History","Community Overview","Building Comparisons","Device Comparisons","Invoices"];
          var dwellerOptions=["Energy Overview","Calendar","Device Groups","Device Overview","Floor Plan","Device List","Electric Vehicle","Personal History","Device History","Energy Prediction","Event Logger","Notes","Scenes","Weather Forecast"];

            // Iterate through the navigation array and
            // make sure it doesn't have any groups or
            // none ui-sref items

          if(user.role == 'DWELLER'){
            for ( var x = 0; x < flatNavigation.length; x++ )
            {
              var title=flatNavigation[x].title;
              if(dwellerOptions.indexOf(title)>=0){
                if ( flatNavigation[x].uisref )
                {
                  navigation.push(flatNavigation[x]);
                }
              }

            }
          }
          if(user.role == 'OPERATOR'){
            for ( var x = 0; x < flatNavigation.length; x++ )
            {
              var title=flatNavigation[x].title;
              if(operatorOptions.indexOf(title)>=0){
                if ( flatNavigation[x].uisref )
                {
                  navigation.push(flatNavigation[x]);
                }
              }

            }
          }
          if(user.role == 'ADMINISTRATOR'){
            for ( var x = 0; x < flatNavigation.length; x++ )
            {
              var title=flatNavigation[x].title;
              if(adminOptions.indexOf(title)>=0){
                if ( flatNavigation[x].uisref )
                {
                  navigation.push(flatNavigation[x]);
                }
              }

            }
          }


            // If there is a query, filter the navigation;
            // otherwise we will return the entire navigation
            // list. Not exactly a good thing to do but it's
            // for demo purposes.


            if ( query )
            {
                navigation = navigation.filter(function (item)
                {
                    if ( angular.lowercase(item.title).search(angular.lowercase(query)) > -1 )
                    {
                        return true;
                    }
                });
            }

            // Fake service delay
            $timeout(function ()
            {
                deferred.resolve(navigation);
            }, 1000);

            return deferred.promise;
        }

        /**
         * Search result click action
         *
         * @param item
         */
        function searchResultClick(item)
        {
            // If item has a link
            if ( item.uisref )
            {
                // If there are state params,
                // use them...
                if ( item.stateParams )
                {
                    $state.go(item.state, item.stateParams);
                }
                else
                {
                    $state.go(item.state);
                }
            }
        }

      vm.checkIdentity=function () {
        if(user.role == 'DWELLER'){
          return true;
        }
        return false;
      }
    }

})();
